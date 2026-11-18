#!/usr/bin/env python3
"""Download and atomically import the public MusicBrainz canonical metadata dump."""

from __future__ import annotations

import hashlib
import os
import re
import sys
import tarfile
import tempfile
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen

import psycopg
import zstandard
from psycopg import sql


DATA_ROOT = "https://data.metabrainz.org/pub/musicbrainz/canonical_data/"
MINIMUM_ROWS = 10_000_000
CHUNK_BYTES = 1024 * 1024
CSV_NAME = "canonical_musicbrainz_data.csv"

CREATE_STAGE = """
CREATE UNLOGGED TABLE musicbrainz_recording_stage (
    id BIGINT NOT NULL,
    artist_credit_id BIGINT,
    artist_mbids TEXT,
    artist_credit_name TEXT,
    release_mbid TEXT,
    release_name TEXT,
    recording_mbid TEXT NOT NULL,
    recording_name TEXT NOT NULL,
    combined_lookup TEXT,
    score INTEGER NOT NULL DEFAULT 0
)
"""

COPY_STAGE = """
COPY musicbrainz_recording_stage
    (id, artist_credit_id, artist_mbids, artist_credit_name, release_mbid,
     release_name, recording_mbid, recording_name, combined_lookup, score)
FROM STDIN WITH (FORMAT CSV, HEADER TRUE)
"""


class DumpFolders(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.names: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return
        href = dict(attrs).get("href")
        if href and re.fullmatch(r"musicbrainz-canonical-dump-\d{8}-\d{6}/", href):
            self.names.append(href)


def latest_dump() -> tuple[str, str]:
    with urlopen(DATA_ROOT, timeout=60) as response:
        page = response.read().decode("utf-8", errors="replace")
    parser = DumpFolders()
    parser.feed(page)
    if not parser.names:
        raise RuntimeError("The MusicBrainz download index did not list a canonical dump.")
    folder = sorted(parser.names)[-1]
    stem = folder.rstrip("/")
    return DATA_ROOT + folder, stem


def download(url: str, destination: Path) -> str:
    digest = hashlib.sha256()
    with urlopen(url, timeout=120) as response, destination.open("wb") as output:
        total = int(response.headers.get("Content-Length", "0"))
        received = 0
        last_report = 0
        while chunk := response.read(4 * CHUNK_BYTES):
            output.write(chunk)
            digest.update(chunk)
            received += len(chunk)
            if received - last_report >= 128 * 1024 * 1024 or received == total:
                percent = f" ({received * 100 / total:.1f}%)" if total else ""
                print(f"Downloaded {received / (1024**3):.2f} GiB{percent}", flush=True)
                last_report = received
    return digest.hexdigest()


def database_connection() -> psycopg.Connection:
    return psycopg.connect(
        host=os.environ.get("PGHOST", "db"),
        port=os.environ.get("PGPORT", "5432"),
        dbname=os.environ.get("PGDATABASE", "music_marketplace"),
        user=os.environ.get("PGUSER", "music"),
        password=os.environ.get("PGPASSWORD", "music"),
        connect_timeout=30,
    )


def prepare_stage(connection: psycopg.Connection) -> None:
    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS musicbrainz_recording_stage")
        cursor.execute(CREATE_STAGE)
    connection.commit()


def import_csv(connection: psycopg.Connection, archive_path: Path) -> int:
    started = time.monotonic()
    found_csv = False
    decompressor = zstandard.ZstdDecompressor()
    with archive_path.open("rb") as archive_file:
        with decompressor.stream_reader(archive_file) as decoded:
            with tarfile.open(fileobj=decoded, mode="r|") as archive:
                for member in archive:
                    if not member.isfile() or Path(member.name).name != CSV_NAME:
                        continue
                    extracted = archive.extractfile(member)
                    if extracted is None:
                        raise RuntimeError("The canonical CSV could not be read from the archive.")
                    found_csv = True
                    print("Streaming the full canonical recording CSV into PostgreSQL…", flush=True)
                    with extracted, connection.cursor() as cursor:
                        with cursor.copy(COPY_STAGE) as copy:
                            while chunk := extracted.read(CHUNK_BYTES):
                                copy.write(chunk)
                    break
    if not found_csv:
        raise RuntimeError(f"The archive did not contain {CSV_NAME}.")
    connection.commit()
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM musicbrainz_recording_stage")
        rows = cursor.fetchone()[0]
    if rows < MINIMUM_ROWS:
        raise RuntimeError(f"Only {rows:,} rows loaded; refusing to replace the catalogue with a partial dump.")
    print(f"Loaded {rows:,} canonical track rows in {time.monotonic() - started:.0f}s.", flush=True)
    return rows


def index_and_swap(connection: psycopg.Connection, expected_rows: int, index_suffix: str) -> None:
    print("Building the searchable indexes; this can take a while…", flush=True)
    with connection.cursor() as cursor:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
        cursor.execute("ALTER TABLE musicbrainz_recording_stage SET LOGGED")
        cursor.execute("ALTER TABLE musicbrainz_recording_stage ADD PRIMARY KEY (id)")
        cursor.execute(f"CREATE INDEX idx_mbc_{index_suffix}_title_trgm ON musicbrainz_recording_stage USING gin (recording_name gin_trgm_ops)")
        cursor.execute(f"CREATE INDEX idx_mbc_{index_suffix}_artist_trgm ON musicbrainz_recording_stage USING gin (artist_credit_name gin_trgm_ops)")
        cursor.execute(f"CREATE INDEX idx_mbc_{index_suffix}_identity_score ON musicbrainz_recording_stage (recording_mbid, score DESC, id)")
        cursor.execute("ANALYZE musicbrainz_recording_stage")
        cursor.execute("SELECT COUNT(*) FROM musicbrainz_recording_stage")
        if cursor.fetchone()[0] != expected_rows:
            raise RuntimeError("The imported row count changed before indexing completed.")
    connection.commit()

    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS musicbrainz_recording_previous")
        cursor.execute("""
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'musicbrainz_recording'::regclass AND contype = 'p'
        """)
        existing_primary_key = cursor.fetchone()
        if existing_primary_key:
            cursor.execute(sql.SQL(
                "ALTER TABLE musicbrainz_recording RENAME CONSTRAINT {} "
                "TO musicbrainz_recording_previous_pkey"
            ).format(sql.Identifier(existing_primary_key[0])))
        cursor.execute("ALTER TABLE musicbrainz_recording RENAME TO musicbrainz_recording_previous")
        cursor.execute("ALTER TABLE musicbrainz_recording_stage RENAME TO musicbrainz_recording")
        cursor.execute("""
            ALTER TABLE musicbrainz_recording
            RENAME CONSTRAINT musicbrainz_recording_stage_pkey TO musicbrainz_recording_pkey
        """)
    connection.commit()

    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE musicbrainz_recording_previous")
    connection.commit()
    print("The complete canonical metadata table is now live.", flush=True)


def main() -> int:
    folder_url, dump_stem = latest_dump()
    archive_url = f"{folder_url}{dump_stem}.tar.zst"
    checksum_url = f"{archive_url}.sha256"
    print(f"Using the latest MusicBrainz canonical dump: {dump_stem}", flush=True)
    with tempfile.TemporaryDirectory(prefix="musicbrainz-catalog-") as temporary:
        archive_path = Path(temporary) / f"{dump_stem}.tar.zst"
        actual_digest = download(archive_url, archive_path)
        try:
            with urlopen(checksum_url, timeout=60) as response:
                expected_digest = response.read().decode("ascii").split()[0].lower()
            if actual_digest.lower() != expected_digest:
                raise RuntimeError("The downloaded MusicBrainz dump failed its SHA-256 check.")
            print("SHA-256 checksum verified.", flush=True)
        except (OSError, ValueError, IndexError) as error:
            raise RuntimeError("Could not verify the official dump checksum; import was stopped.") from error

        connection = database_connection()
        try:
            prepare_stage(connection)
            row_count = import_csv(connection, archive_path)
            dump_version = dump_stem.removeprefix("musicbrainz-canonical-dump-").replace("-", "")
            # Keep index names unique when the same snapshot is imported again.
            index_suffix = f"{dump_version}_{time.time_ns() % 100_000_000:08d}"
            index_and_swap(connection, row_count, index_suffix)
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"Catalogue import failed: {error}", file=sys.stderr, flush=True)
        sys.exit(1)

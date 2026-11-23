CREATE TABLE IF NOT EXISTS music_release (
    id BIGSERIAL PRIMARY KEY,
    external_track_id VARCHAR(100),
    title VARCHAR(180) NOT NULL,
    artist VARCHAR(180) NOT NULL,
    release_year INTEGER CHECK (release_year BETWEEN 1000 AND 2100),
    genre VARCHAR(80),
    language VARCHAR(64),
    catalogue_source VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS musicbrainz_recording_stage;
DROP TABLE IF EXISTS musicbrainz_recording_previous;
DROP TABLE IF EXISTS musicbrainz_recording;

ALTER TABLE music_release ADD COLUMN IF NOT EXISTS external_track_id VARCHAR(100);
ALTER TABLE music_release ALTER COLUMN release_year DROP NOT NULL;
ALTER TABLE music_release ADD COLUMN IF NOT EXISTS genre VARCHAR(80);
ALTER TABLE music_release ADD COLUMN IF NOT EXISTS language VARCHAR(64);
ALTER TABLE music_release DROP COLUMN IF EXISTS cover_image_key;
ALTER TABLE music_release DROP COLUMN IF EXISTS cover_color;
ALTER TABLE music_release ADD COLUMN IF NOT EXISTS catalogue_source VARCHAR(32) NOT NULL DEFAULT 'MANUAL';
ALTER TABLE music_release ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE music_release
SET external_track_id = 'shazam:' || external_track_id,
    catalogue_source = 'SHAZAM'
WHERE catalogue_source = 'MANUAL' AND external_track_id ~ '^[0-9]+$';
UPDATE music_release
SET catalogue_source = 'SHAZAM'
WHERE catalogue_source = 'MANUAL' AND external_track_id LIKE 'shazam:%';
CREATE UNIQUE INDEX IF NOT EXISTS idx_music_release_external_track_id
    ON music_release (external_track_id) WHERE external_track_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_music_release_cache_age
    ON music_release (catalogue_source, created_at);

CREATE TABLE IF NOT EXISTS music_listing (
    id BIGSERIAL PRIMARY KEY,
    release_id BIGINT NOT NULL REFERENCES music_release(id) ON DELETE CASCADE,
    seller VARCHAR(120) NOT NULL,
    format VARCHAR(24) NOT NULL CHECK (format IN ('VINYL', 'CD', 'CASSETTE', 'DIGITAL')),
    item_condition VARCHAR(24) NOT NULL CHECK (item_condition IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'DIGITAL')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'REQUESTED'))
);

ALTER TABLE music_listing ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS purchase_request (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES music_listing(id),
    buyer_name VARCHAR(120) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'DEMO_REQUEST',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DELETE FROM purchase_request p
USING music_listing l, music_release r
WHERE p.listing_id = l.id AND l.release_id = r.id
  AND (r.catalogue_source = 'MUSICBRAINZ' OR r.external_track_id LIKE 'musicbrainz:%');
DELETE FROM music_release
WHERE catalogue_source = 'MUSICBRAINZ' OR external_track_id LIKE 'musicbrainz:%';

CREATE INDEX IF NOT EXISTS idx_release_artist ON music_release (artist);
CREATE INDEX IF NOT EXISTS idx_release_catalogue_page ON music_release (created_at DESC, id DESC);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_release_title_trgm ON music_release USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_release_artist_trgm ON music_release USING GIN (artist gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listing_release_format ON music_listing (release_id, format);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_offer_per_release
    ON music_listing (release_id) WHERE seller = 'Melodex Demo Store';


CREATE TABLE IF NOT EXISTS music_release (
    id BIGSERIAL PRIMARY KEY,
    external_track_id VARCHAR(100),
    title VARCHAR(180) NOT NULL,
    artist VARCHAR(180) NOT NULL,
    release_year INTEGER CHECK (release_year BETWEEN 1000 AND 2100),
    cover_color VARCHAR(7) NOT NULL DEFAULT '#d85b42'
);

CREATE TABLE IF NOT EXISTS musicbrainz_recording (
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
);

ALTER TABLE music_release ADD COLUMN IF NOT EXISTS external_track_id VARCHAR(100);
ALTER TABLE music_release ALTER COLUMN release_year DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_music_release_external_track_id
    ON music_release (external_track_id) WHERE external_track_id IS NOT NULL;

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

CREATE INDEX IF NOT EXISTS idx_release_artist ON music_release (artist);
CREATE INDEX IF NOT EXISTS idx_listing_release_format ON music_listing (release_id, format);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_offer_per_release
    ON music_listing (release_id) WHERE seller = 'Melodex Demo Store';


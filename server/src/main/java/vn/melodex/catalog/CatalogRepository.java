package vn.melodex.catalog;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class CatalogRepository {
    private final JdbcTemplate jdbc;

    public CatalogRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<MusicRelease> search(String query, String artist, Integer fromYear,
                                     Integer toYear, String format) {
        StringBuilder sql = new StringBuilder("""
                SELECT r.id AS release_id, r.title, r.artist, r.release_year, r.cover_color,
                       l.id AS listing_id, l.seller, l.format, l.item_condition, l.price, l.currency,
                       l.is_demo
                FROM music_release r
                LEFT JOIN music_listing l ON l.release_id = r.id AND l.status = 'AVAILABLE'
                WHERE 1 = 1
                """);
        List<Object> params = new ArrayList<>();

        if (hasText(query)) {
            sql.append(" AND (r.title ILIKE ? OR r.artist ILIKE ?)");
            params.add("%" + query.trim() + "%");
            params.add("%" + query.trim() + "%");
        }
        if (hasText(artist)) {
            sql.append(" AND r.artist ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        if (fromYear != null) {
            sql.append(" AND r.release_year >= ?");
            params.add(fromYear);
        }
        if (toYear != null) {
            sql.append(" AND r.release_year <= ?");
            params.add(toYear);
        }
        if (hasText(format)) {
            sql.append(" AND EXISTS (SELECT 1 FROM music_listing f WHERE f.release_id = r.id AND f.status = 'AVAILABLE' AND f.format = ?)");
            params.add(format.trim().toUpperCase());
        }
        sql.append(" ORDER BY r.artist, r.release_year DESC, r.title, l.id");

        return jdbc.query(connection -> {
            var statement = connection.prepareStatement(sql.toString());
            for (int index = 0; index < params.size(); index++) {
                statement.setObject(index + 1, params.get(index));
            }
            return statement;
        }, resultSet -> {
            Map<Long, ReleaseBuilder> releases = new LinkedHashMap<>();
            while (resultSet.next()) {
                long releaseId = resultSet.getLong("release_id");
                ReleaseBuilder release = releases.computeIfAbsent(releaseId, ignored -> {
                    try {
                        return new ReleaseBuilder(releaseId, resultSet.getString("title"),
                                resultSet.getString("artist"), resultSet.getObject("release_year", Integer.class),
                                resultSet.getString("cover_color"));
                    } catch (java.sql.SQLException exception) {
                        throw new IllegalStateException(exception);
                    }
                });
                long listingId = resultSet.getLong("listing_id");
                if (!resultSet.wasNull()) {
                    String listingFormat = resultSet.getString("format");
                    if (!hasText(format) || format.trim().equalsIgnoreCase(listingFormat)) {
                        release.offers.add(new Offer(listingId, resultSet.getString("seller"),
                                listingFormat, resultSet.getString("item_condition"),
                                resultSet.getBigDecimal("price"), resultSet.getString("currency").trim(),
                                resultSet.getBoolean("is_demo")));
                    }
                }
            }
            return releases.values().stream().map(ReleaseBuilder::build).toList();
        });
    }

    public long saveRecognizedTrack(String trackId, String title, String artist,
                                    Integer releaseYear, String coverColor) {
        Long existingId = findMatchingRelease(title, artist, releaseYear, trackId);
        if (existingId != null) {
            jdbc.update("""
                    UPDATE music_release
                    SET external_track_id = COALESCE(external_track_id, ?),
                        release_year = COALESCE(release_year, ?)
                    WHERE id = ?
                    """, blankToNull(trackId), releaseYear, existingId);
            return existingId;
        }

        if (hasText(trackId)) {
            return jdbc.queryForObject("""
                    INSERT INTO music_release (external_track_id, title, artist, release_year, cover_color)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT (external_track_id) WHERE external_track_id IS NOT NULL
                    DO UPDATE SET title = EXCLUDED.title,
                                  artist = EXCLUDED.artist,
                                  release_year = COALESCE(EXCLUDED.release_year, music_release.release_year)
                    RETURNING id
                    """, Long.class, trackId.trim(), title, artist, releaseYear, coverColor);
        }

        return jdbc.queryForObject("""
                INSERT INTO music_release (title, artist, release_year, cover_color)
                VALUES (?, ?, ?, ?)
                RETURNING id
                """, Long.class, title, artist, releaseYear, coverColor);
    }

    private Long findMatchingRelease(String title, String artist, Integer releaseYear, String trackId) {
        StringBuilder sql = new StringBuilder("""
                SELECT id FROM music_release
                WHERE LOWER(title) = LOWER(?) AND LOWER(artist) = LOWER(?)
                """);
        List<Object> parameters = new ArrayList<>(List.of(title, artist));
        if (releaseYear == null) {
            sql.append(" AND release_year IS NULL");
        } else {
            sql.append(" AND (release_year = ? OR release_year IS NULL)");
            parameters.add(releaseYear);
        }
        if (hasText(trackId)) {
            sql.append(" AND (external_track_id IS NULL OR external_track_id = ?)");
            parameters.add(trackId.trim());
        } else {
            sql.append(" AND external_track_id IS NULL");
        }
        sql.append(" ORDER BY release_year DESC NULLS LAST, id LIMIT 1");

        List<Long> matches = jdbc.query(sql.toString(),
                (resultSet, rowNumber) -> resultSet.getLong("id"), parameters.toArray());
        return matches.isEmpty() ? null : matches.getFirst();
    }

    private static String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    public List<MusicRelease> all() {
        return search(null, null, null, null, null);
    }

    public List<MusicBrainzCatalogueService.Recording> searchOpenCatalogue(String query,
                                                                           String artist,
                                                                           int limit) {
        if ((!hasText(query) && !hasText(artist))
                || (hasText(query) && query.trim().length() < 3)
                || (hasText(artist) && artist.trim().length() < 3)) return List.of();
        StringBuilder sql = new StringBuilder("""
                SELECT recording_mbid, recording_name, artist_credit_name
                FROM (
                    SELECT DISTINCT ON (recording_mbid) recording_mbid, recording_name,
                           artist_credit_name, score, id
                    FROM musicbrainz_recording
                    WHERE recording_mbid IS NOT NULL
                      AND recording_name IS NOT NULL AND recording_name <> ''
                      AND artist_credit_name IS NOT NULL AND artist_credit_name <> ''
                """);
        List<Object> params = new ArrayList<>();
        if (hasText(query)) {
            sql.append(" AND (recording_name ILIKE ? OR artist_credit_name ILIKE ?)");
            params.add("%" + query.trim() + "%");
            params.add("%" + query.trim() + "%");
        }
        if (hasText(artist)) {
            sql.append(" AND artist_credit_name ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        sql.append(" ORDER BY recording_mbid, score DESC, id) matches ORDER BY score DESC, recording_name, artist_credit_name LIMIT ?");
        params.add(Math.max(1, Math.min(limit, 50)));
        return jdbc.query(sql.toString(), (resultSet, rowNumber) ->
                new MusicBrainzCatalogueService.Recording(
                        "musicbrainz:" + resultSet.getString("recording_mbid"),
                        resultSet.getString("recording_name"),
                        resultSet.getString("artist_credit_name"), null), params.toArray());
    }

    public List<AdvancedCatalogueEntry> searchAdvancedCatalogue(String artist, String release,
                                                                 String track, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
                SELECT recording_mbid, recording_name, artist_credit_name, release_name, score
                FROM (
                    SELECT DISTINCT ON (recording_mbid) recording_mbid, recording_name,
                           artist_credit_name, release_name, score, id
                    FROM musicbrainz_recording
                    WHERE recording_mbid IS NOT NULL
                      AND recording_name IS NOT NULL AND recording_name <> ''
                      AND artist_credit_name IS NOT NULL AND artist_credit_name <> ''
                """);
        List<Object> params = new ArrayList<>();
        if (hasText(artist)) {
            sql.append(" AND artist_credit_name ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        if (hasText(release)) {
            sql.append(" AND release_name ILIKE ?");
            params.add("%" + release.trim() + "%");
        }
        if (hasText(track)) {
            sql.append(" AND recording_name ILIKE ?");
            params.add("%" + track.trim() + "%");
        }
        sql.append(" ORDER BY recording_mbid, score DESC, id) matches "
                + "ORDER BY score DESC, recording_name, artist_credit_name LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);
        return jdbc.query(sql.toString(), (resultSet, rowNumber) ->
                new AdvancedCatalogueEntry(resultSet.getString("recording_mbid"),
                        resultSet.getString("recording_name"),
                        resultSet.getString("artist_credit_name"),
                        resultSet.getString("release_name"), resultSet.getInt("score")),
                params.toArray());
    }

    public MarketplacePage searchMarketplace(String query, String artist, Integer fromYear,
                                             Integer toYear, String format, String condition,
                                             String seller, BigDecimal minPrice, BigDecimal maxPrice,
                                             List<Long> releaseIds, List<Long> listingIds,
                                             String sort, int page, int pageSize) {
        StringBuilder where = new StringBuilder(" WHERE l.status = 'AVAILABLE'");
        List<Object> params = new ArrayList<>();
        if (hasText(query)) {
            where.append(" AND (r.title ILIKE ? OR r.artist ILIKE ? OR l.seller ILIKE ?)");
            String pattern = "%" + query.trim() + "%";
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }
        if (hasText(artist)) {
            where.append(" AND r.artist ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        if (fromYear != null) {
            where.append(" AND r.release_year >= ?");
            params.add(fromYear);
        }
        if (toYear != null) {
            where.append(" AND r.release_year <= ?");
            params.add(toYear);
        }
        if (hasText(format)) {
            where.append(" AND l.format = ?");
            params.add(format.trim().toUpperCase());
        }
        if (hasText(condition)) {
            where.append(" AND l.item_condition = ?");
            params.add(condition.trim().toUpperCase());
        }
        if (hasText(seller)) {
            where.append(" AND l.seller ILIKE ?");
            params.add("%" + seller.trim() + "%");
        }
        if (minPrice != null) {
            where.append(" AND l.price >= ?");
            params.add(minPrice);
        }
        if (maxPrice != null) {
            where.append(" AND l.price <= ?");
            params.add(maxPrice);
        }
        appendIdFilter(where, params, "r.id", releaseIds);
        appendIdFilter(where, params, "l.id", listingIds);

        String orderBy = switch (sort == null ? "newest" : sort) {
            case "price-low" -> "l.price ASC, r.artist ASC, r.title ASC, l.id";
            case "price-high" -> "l.price DESC, r.artist ASC, r.title ASC, l.id";
            case "artist" -> "r.artist ASC, r.title ASC, l.id";
            case "title" -> "r.title ASC, r.artist ASC, l.id";
            case "year-new" -> "r.release_year DESC NULLS LAST, r.artist ASC, r.title ASC, l.id";
            default -> "l.id DESC";
        };
        String from = " FROM music_listing l JOIN music_release r ON r.id = l.release_id";
        Long total = jdbc.queryForObject("SELECT COUNT(*)" + from + where,
                Long.class, params.toArray());
        String sql = """
                SELECT l.id AS listing_id, r.id AS release_id, r.title, r.artist,
                       r.release_year, r.cover_color, l.seller, l.format, l.item_condition,
                       l.price, l.currency, l.is_demo
                """ + from + where + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?";
        List<Object> pageParams = new ArrayList<>(params);
        pageParams.add(pageSize);
        pageParams.add((page - 1) * pageSize);
        List<MarketplaceListing> items = jdbc.query(sql, (resultSet, rowNumber) ->
                new MarketplaceListing(resultSet.getLong("listing_id"),
                        resultSet.getLong("release_id"), resultSet.getString("title"),
                        resultSet.getString("artist"), resultSet.getObject("release_year", Integer.class),
                        resultSet.getString("cover_color"), resultSet.getString("seller"),
                        resultSet.getString("format"), resultSet.getString("item_condition"),
                        resultSet.getBigDecimal("price"), resultSet.getString("currency").trim(),
                        resultSet.getBoolean("is_demo")), pageParams.toArray());
        return new MarketplacePage(items, page, pageSize, total == null ? 0 : total,
                sort == null ? "newest" : sort);
    }

    public List<PurchaseRecord> purchaseHistory(String buyerName) {
        return jdbc.query("""
                SELECT p.id AS request_id, l.id AS listing_id, r.title, r.artist,
                       l.seller, l.format, l.item_condition, l.price, l.currency,
                       p.status, p.created_at
                FROM purchase_request p
                JOIN music_listing l ON l.id = p.listing_id
                JOIN music_release r ON r.id = l.release_id
                WHERE LOWER(p.buyer_name) = LOWER(?)
                ORDER BY p.created_at DESC, p.id DESC
                LIMIT 100
                """, (resultSet, rowNumber) -> new PurchaseRecord(
                resultSet.getLong("request_id"), resultSet.getLong("listing_id"),
                resultSet.getString("title"), resultSet.getString("artist"),
                resultSet.getString("seller"), resultSet.getString("format"),
                resultSet.getString("item_condition"), resultSet.getBigDecimal("price"),
                resultSet.getString("currency").trim(), resultSet.getString("status"),
                resultSet.getTimestamp("created_at").toInstant()), buyerName);
    }

    public long estimatedCanonicalEntries() {
        Long estimate = jdbc.queryForObject("""
                SELECT GREATEST(reltuples::BIGINT, 0)
                FROM pg_class WHERE oid = 'musicbrainz_recording'::regclass
                """, Long.class);
        return estimate == null ? 0 : estimate;
    }

    private static void appendIdFilter(StringBuilder where, List<Object> params,
                                       String column, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        where.append(" AND ").append(column).append(" IN (")
                .append(String.join(",", Collections.nCopies(ids.size(), "?"))).append(')');
        params.addAll(ids);
    }

    public Long createListing(long releaseId, String seller, String format, String condition,
                              BigDecimal price) {
        return jdbc.queryForObject("""
                INSERT INTO music_listing (release_id, seller, format, item_condition, price, currency, is_demo)
                VALUES (?, ?, ?, ?, ?, 'VND', TRUE)
                RETURNING id
                """, Long.class, releaseId, seller, format, condition, price);
    }

    public void ensureDemoOffer(long releaseId) {
        jdbc.update("""
                INSERT INTO music_listing (release_id, seller, format, item_condition, price, currency, is_demo)
                VALUES (?, 'Melodex Demo Store', 'DIGITAL', 'DIGITAL', 99000, 'VND', TRUE)
                ON CONFLICT (release_id) WHERE seller = 'Melodex Demo Store' DO NOTHING
                """, releaseId);
    }

    public boolean releaseExists(long releaseId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM music_release WHERE id = ?",
                Integer.class, releaseId);
        return count != null && count > 0;
    }

    public Long createPurchaseRequest(long listingId, String buyerName) {
        List<Long> claimed = jdbc.query("""
                UPDATE music_listing SET status = 'REQUESTED'
                WHERE id = ? AND status = 'AVAILABLE'
                RETURNING id
                """, (resultSet, rowNumber) -> resultSet.getLong("id"), listingId);
        if (claimed.isEmpty()) return null;
        return jdbc.queryForObject("""
                INSERT INTO purchase_request (listing_id, buyer_name)
                VALUES (?, ?)
                RETURNING id
                """, Long.class, listingId, buyerName);
    }

    public boolean listingIsAvailable(long listingId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM music_listing WHERE id = ? AND status = 'AVAILABLE'",
                Integer.class, listingId);
        return count != null && count > 0;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static final class ReleaseBuilder {
        private final long id;
        private final String title;
        private final String artist;
        private final Integer releaseYear;
        private final String coverColor;
        private final List<Offer> offers = new ArrayList<>();

        private ReleaseBuilder(long id, String title, String artist, Integer releaseYear, String coverColor) {
            this.id = id;
            this.title = title;
            this.artist = artist;
            this.releaseYear = releaseYear;
            this.coverColor = coverColor;
        }

        private MusicRelease build() {
            return new MusicRelease(id, title, artist, releaseYear, coverColor, List.copyOf(offers));
        }
    }
}

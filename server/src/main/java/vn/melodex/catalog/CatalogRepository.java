package vn.melodex.catalog;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class CatalogRepository {
    private final JdbcTemplate jdbc;
    private final int recognitionCacheMaxEntries;

    public CatalogRepository(JdbcTemplate jdbc,
                             @Value("${catalogue.recognition-cache-max-entries:5000}") int recognitionCacheMaxEntries) {
        this.jdbc = jdbc;
        this.recognitionCacheMaxEntries = Math.max(100, recognitionCacheMaxEntries);
    }

    public List<MusicRelease> search(String query, String artist, Integer fromYear,
                                     Integer toYear, String format) {
        return search(query, artist, fromYear, toYear, format, 24);
    }

    private List<MusicRelease> search(String query, String artist, Integer fromYear,
                                      Integer toYear, String format, int resultLimit) {
        StringBuilder filters = new StringBuilder(" WHERE 1 = 1");
        List<Object> params = new ArrayList<>();

        if (hasText(query)) {
            filters.append(" AND (r.title ILIKE ? OR r.artist ILIKE ?)");
            params.add("%" + query.trim() + "%");
            params.add("%" + query.trim() + "%");
        }
        if (hasText(artist)) {
            filters.append(" AND r.artist ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        if (fromYear != null) {
            filters.append(" AND r.release_year >= ?");
            params.add(fromYear);
        }
        if (toYear != null) {
            filters.append(" AND r.release_year <= ?");
            params.add(toYear);
        }
        if (hasText(format)) {
            filters.append(" AND EXISTS (SELECT 1 FROM music_listing f WHERE f.release_id = r.id AND f.status = 'AVAILABLE' AND f.format = ?)");
            params.add(format.trim().toUpperCase());
        }
        String sql = """
                WITH selected_releases AS (
                    SELECT r.id, r.title, r.artist, r.release_year
                    FROM music_release r
                """ + filters + " ORDER BY r.artist, r.release_year DESC, r.title, r.id LIMIT ?) "
                + """
                SELECT r.id AS release_id, r.title, r.artist, r.release_year,
                       l.id AS listing_id, l.seller, l.format, l.item_condition, l.price, l.currency,
                       l.is_demo
                FROM selected_releases r
                LEFT JOIN music_listing l ON l.release_id = r.id AND l.status = 'AVAILABLE'
                ORDER BY r.artist, r.release_year DESC, r.title, l.id
                """;
        params.add(Math.max(1, Math.min(resultLimit, 200)));

        return jdbc.query(connection -> {
            var statement = connection.prepareStatement(sql);
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
                                resultSet.getString("artist"), resultSet.getObject("release_year", Integer.class));
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
                                    Integer releaseYear) {
        // Cache writes are uncommon; serializing this small section prevents two concurrent
        // recognition results from exceeding the configured cache limit or creating duplicates.
        jdbc.execute("SELECT pg_advisory_xact_lock(618204771)");
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

        evictOldRecognitionCacheIfNeeded();
        String source = "SHAZAM";

        if (hasText(trackId)) {
            return jdbc.queryForObject("""
                    INSERT INTO music_release (external_track_id, title, artist, release_year, catalogue_source)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT (external_track_id) WHERE external_track_id IS NOT NULL
                    DO UPDATE SET title = EXCLUDED.title,
                                  artist = EXCLUDED.artist,
                                  release_year = COALESCE(EXCLUDED.release_year, music_release.release_year)
                    RETURNING id
                    """, Long.class, trackId.trim(), title, artist, releaseYear, source);
        }

        return jdbc.queryForObject("""
                INSERT INTO music_release (title, artist, release_year, catalogue_source)
                VALUES (?, ?, ?, ?)
                RETURNING id
                """, Long.class, title, artist, releaseYear, source);
    }

    private void evictOldRecognitionCacheIfNeeded() {
        jdbc.update("""
                WITH excess AS (
                    SELECT r.id
                    FROM music_release r
                    WHERE r.catalogue_source = 'SHAZAM'
                      AND NOT EXISTS (
                          SELECT 1 FROM music_listing l
                          WHERE l.release_id = r.id AND NOT (l.is_demo AND l.seller = 'Melodex Demo Store')
                      )
                      AND NOT EXISTS (
                          SELECT 1 FROM purchase_request p
                          JOIN music_listing l ON l.id = p.listing_id
                          WHERE l.release_id = r.id
                      )
                    ORDER BY r.created_at ASC, r.id ASC
                    LIMIT ?
                )
                DELETE FROM music_release r USING excess e WHERE r.id = e.id
                """, Math.max(0, countDisposableRecognitionCache() - recognitionCacheMaxEntries + 1));
    }

    private int countDisposableRecognitionCache() {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM music_release r
                WHERE r.catalogue_source = 'SHAZAM'
                  AND NOT EXISTS (
                      SELECT 1 FROM music_listing l
                      WHERE l.release_id = r.id AND NOT (l.is_demo AND l.seller = 'Melodex Demo Store')
                  )
                  AND NOT EXISTS (
                      SELECT 1 FROM purchase_request p JOIN music_listing l ON l.id = p.listing_id
                      WHERE l.release_id = r.id
                  )
                """, Integer.class);
        return count == null ? 0 : count;
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
        return search(null, null, null, null, null, 200);
    }

    public CatalogueSearchPage searchLocalCatalogue(String query, String artist, int page, int pageSize) {
        StringBuilder where = new StringBuilder(" WHERE 1 = 1");
        List<Object> params = new ArrayList<>();
        if (hasText(query)) {
            where.append(" AND r.title ILIKE ?");
            params.add("%" + query.trim() + "%");
        }
        if (hasText(artist)) {
            where.append(" AND r.artist ILIKE ?");
            params.add("%" + artist.trim() + "%");
        }
        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM music_release r" + where,
                Long.class, params.toArray());
        List<Object> pageParams = new ArrayList<>(params);
        pageParams.add(pageSize);
        pageParams.add((page - 1) * pageSize);
        List<CatalogueEntry> items = jdbc.query("""
                WITH page_releases AS (
                    SELECT r.id, r.title, r.artist, r.release_year, r.genre, r.language, r.created_at
                    FROM music_release r
                """ + where + " ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?) " + """
                SELECT r.id, r.title, r.artist, r.release_year, r.genre, r.language,
                       COUNT(l.id) FILTER (WHERE l.status = 'AVAILABLE') AS offer_count,
                       MIN(l.price) FILTER (WHERE l.status = 'AVAILABLE') AS lowest_offer
                FROM page_releases r
                LEFT JOIN music_listing l ON l.release_id = r.id
                GROUP BY r.id, r.title, r.artist, r.release_year, r.genre, r.language, r.created_at
                ORDER BY r.created_at DESC, r.id DESC
                """,
                (rs, row) -> new CatalogueEntry(rs.getLong("id"), rs.getString("title"),
                        rs.getString("artist"),
                        rs.getObject("release_year", Integer.class), rs.getString("genre"),
                        rs.getString("language"), rs.getLong("offer_count"),
                        rs.getBigDecimal("lowest_offer")), pageParams.toArray());
        return new CatalogueSearchPage(items, page, pageSize, total == null ? 0 : total);
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
        String from = """
                 FROM music_listing l JOIN music_release r ON r.id = l.release_id
                """;
        Long total = jdbc.queryForObject("SELECT COUNT(*)" + from + where,
                Long.class, params.toArray());
        String sql = """
                SELECT l.id AS listing_id, r.id AS release_id, r.title, r.artist,
                       r.release_year,
                       l.seller, l.format, l.item_condition,
                       l.price, l.currency, l.is_demo
                """ + from + where + " ORDER BY " + orderBy + " LIMIT ? OFFSET ?";
        List<Object> pageParams = new ArrayList<>(params);
        pageParams.add(pageSize);
        pageParams.add((page - 1) * pageSize);
        List<MarketplaceListing> items = jdbc.query(sql, (resultSet, rowNumber) ->
                new MarketplaceListing(resultSet.getLong("listing_id"),
                        resultSet.getLong("release_id"), resultSet.getString("title"),
                        resultSet.getString("artist"), resultSet.getObject("release_year", Integer.class),
                        resultSet.getString("seller"),
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

    public long catalogueRecordCount() {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM music_release", Long.class);
        return count == null ? 0 : count;
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

    public boolean hasActiveListings(long releaseId) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM music_listing
                WHERE release_id = ? AND status = 'AVAILABLE'
                """, Integer.class, releaseId);
        return count != null && count > 0;
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

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static final class ReleaseBuilder {
        private final long id;
        private final String title;
        private final String artist;
        private final Integer releaseYear;
        private final List<Offer> offers = new ArrayList<>();

        private ReleaseBuilder(long id, String title, String artist, Integer releaseYear) {
            this.id = id;
            this.title = title;
            this.artist = artist;
            this.releaseYear = releaseYear;
        }

        private MusicRelease build() {
            return new MusicRelease(id, title, artist, releaseYear, List.copyOf(offers));
        }
    }

    public List<AdminRecord> adminRecords(int limit) {
        return jdbc.query("""
                SELECT r.id, r.title, r.artist, r.release_year, r.external_track_id,
                       r.catalogue_source, r.created_at,
                       COUNT(l.id) AS listing_count,
                       COUNT(l.id) FILTER (WHERE l.is_demo) AS demo_listing_count
                FROM music_release r LEFT JOIN music_listing l ON l.release_id = r.id
                GROUP BY r.id
                ORDER BY r.created_at DESC, r.id DESC LIMIT ?
                """, (rs, row) -> new AdminRecord(rs.getLong("id"), rs.getString("title"),
                rs.getString("artist"), rs.getObject("release_year", Integer.class),
                rs.getString("external_track_id"), rs.getString("catalogue_source"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getLong("listing_count"), rs.getLong("demo_listing_count")), limit);
    }

    public AdminMetrics adminMetrics() {
        long cacheCount = countDisposableRecognitionCache();
        Long listingCount = jdbc.queryForObject("SELECT COUNT(*) FROM music_listing", Long.class);
        Long demoCount = jdbc.queryForObject("SELECT COUNT(*) FROM music_listing WHERE is_demo", Long.class);
        Long databaseBytes = jdbc.queryForObject("SELECT pg_database_size(current_database())", Long.class);
        return new AdminMetrics(catalogueRecordCount(), cacheCount,
                recognitionCacheMaxEntries, listingCount == null ? 0 : listingCount,
                demoCount == null ? 0 : demoCount, databaseBytes == null ? 0 : databaseBytes);
    }
}

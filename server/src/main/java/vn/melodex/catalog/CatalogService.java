package vn.melodex.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CatalogService {
    private static final Pattern RELEASE_YEAR = Pattern.compile("\\b(?:19|20|21)\\d{2}\\b");
    private static final String[] DISCOVERY_COVER_COLORS = {
            "#536b72", "#8d674e", "#755c7e", "#576d4d", "#8a514b"
    };
    private static final Set<String> FORMATS = Set.of("VINYL", "CD", "CASSETTE", "DIGITAL");
    private static final Set<String> CONDITIONS = Set.of("NEW", "LIKE_NEW", "GOOD", "FAIR", "DIGITAL");

    private final CatalogRepository repository;
    private final MusicBrainzCatalogueService musicBrainz;

    public CatalogService(CatalogRepository repository, MusicBrainzCatalogueService musicBrainz) {
        this.repository = repository;
        this.musicBrainz = musicBrainz;
    }

    public List<MusicRelease> search(String query, String artist, Integer fromYear,
                                     Integer toYear, String format) {
        List<MusicRelease> matches = ensureOffers(
                repository.search(query, artist, fromYear, toYear, format),
                query, artist, fromYear, toYear, format);

        if (fromYear == null && toYear == null && !hasText(format)) {
            int limit = hasText(query) || hasText(artist) ? 15 : 24;
            List<MusicBrainzCatalogueService.Recording> openMatches =
                    repository.searchOpenCatalogue(query, artist, limit);
            for (MusicBrainzCatalogueService.Recording recording : openMatches) {
                long releaseId = repository.saveRecognizedTrack(recording.id(), recording.title(),
                        recording.artist(), null, "#536b72");
                repository.ensureDemoOffer(releaseId);
            }
            if (!openMatches.isEmpty()) return repository.search(query, artist, fromYear, toYear, format);
        }

        if (!matches.isEmpty() || (!hasText(query) && !hasText(artist))) return matches;

        for (MusicBrainzCatalogueService.Recording recording : musicBrainz.search(query, artist)) {
            long releaseId = repository.saveRecognizedTrack(recording.id(), recording.title(),
                    recording.artist(), extractReleaseYear(recording.releaseDate()), "#536b72");
            repository.ensureDemoOffer(releaseId);
        }
        return repository.search(query, artist, fromYear, toYear, format);
    }

    private List<MusicRelease> ensureOffers(List<MusicRelease> matches, String query, String artist,
                                            Integer fromYear, Integer toYear, String format) {
        boolean addedDemoOffers = false;
        for (MusicRelease release : matches) {
            if (release.offers().isEmpty()) {
                repository.ensureDemoOffer(release.id());
                addedDemoOffers = true;
            }
        }
        return addedDemoOffers ? repository.search(query, artist, fromYear, toYear, format) : matches;
    }

    public List<MusicRelease> all() {
        return repository.all();
    }

    public CatalogueSearchPage searchAdvancedCatalogue(String artist, String release,
                                                       String track, int page, int pageSize) {
        int safePage = Math.max(1, Math.min(page, 100_000));
        int safeSize = Math.max(1, Math.min(pageSize, 50));
        boolean searched = hasText(artist) || hasText(release) || hasText(track);
        if (!searched) {
            return new CatalogueSearchPage(List.of(), safePage, safeSize, false,
                    repository.estimatedCanonicalEntries() == 0
                            ? "The full metadata snapshot has not been loaded yet."
                            : "Enter an artist, release, or track title to search the full catalogue.");
        }
        for (String value : List.of(nullToEmpty(artist), nullToEmpty(release), nullToEmpty(track))) {
            if (!value.isBlank() && value.trim().length() < 3) {
                return new CatalogueSearchPage(List.of(), safePage, safeSize, true,
                        "Use at least three characters in each search field.");
            }
        }
        if (repository.estimatedCanonicalEntries() == 0) {
            return new CatalogueSearchPage(List.of(), safePage, safeSize, true,
                    "The full metadata snapshot is not loaded. Use the catalogue search on the home page for sample releases.");
        }
        List<AdvancedCatalogueEntry> items = repository.searchAdvancedCatalogue(
                artist, release, track, safeSize, (safePage - 1) * safeSize);
        return new CatalogueSearchPage(items, safePage, safeSize, true,
                items.isEmpty() ? "No matching recordings found. Try a broader search." : "");
    }

    public MarketplacePage searchMarketplace(String query, String artist, Integer fromYear,
                                             Integer toYear, String format, String condition,
                                             String seller, BigDecimal minPrice, BigDecimal maxPrice,
                                             List<Long> releaseIds, List<Long> listingIds,
                                             String sort, int page, int pageSize) {
        int safePage = Math.max(1, Math.min(page, 100_000));
        int safeSize = Math.max(1, Math.min(pageSize, 50));
        Integer safeFrom = validYear(fromYear);
        Integer safeTo = validYear(toYear);
        if (safeFrom != null && safeTo != null && safeFrom > safeTo) {
            throw new IllegalArgumentException("The start year must be earlier than the end year.");
        }
        String normalizedFormat = format == null ? "" : format.trim().toUpperCase(Locale.ROOT);
        String normalizedCondition = condition == null ? "" : condition.trim().toUpperCase(Locale.ROOT);
        if (!normalizedFormat.isBlank() && !FORMATS.contains(normalizedFormat)) {
            throw new IllegalArgumentException("Choose a valid format.");
        }
        if (!normalizedCondition.isBlank() && !CONDITIONS.contains(normalizedCondition)) {
            throw new IllegalArgumentException("Choose a valid condition.");
        }
        if (minPrice != null && minPrice.signum() < 0
                || maxPrice != null && maxPrice.signum() < 0) {
            throw new IllegalArgumentException("Prices must be zero or higher.");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("The minimum price cannot be higher than the maximum.");
        }
        String requestedSort = sort == null ? "newest" : sort;
        String normalizedSort = switch (requestedSort) {
            case "newest", "price-low", "price-high", "artist", "title", "year-new" -> requestedSort;
            default -> "newest";
        };
        return repository.searchMarketplace(query, artist, safeFrom, safeTo,
                normalizedFormat, normalizedCondition, seller, minPrice, maxPrice,
                safeIds(releaseIds), safeIds(listingIds), normalizedSort, safePage, safeSize);
    }

    public long estimatedCanonicalEntries() {
        return repository.estimatedCanonicalEntries();
    }

    public List<PurchaseRecord> purchaseHistory(String buyerName) {
        if (!hasText(buyerName)) return List.of();
        return repository.purchaseHistory(buyerName.trim());
    }

    @Transactional
    public List<Long> checkout(String buyerName, List<Long> listingIds) {
        if (!hasText(buyerName) || buyerName.trim().length() > 120) {
            throw new IllegalArgumentException("Enter a buyer name of 1 to 120 characters in Buyer Settings.");
        }
        if (listingIds == null || listingIds.isEmpty() || listingIds.size() > 25) {
            throw new IllegalArgumentException("Choose between 1 and 25 listings to request.");
        }
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(listingIds);
        if (uniqueIds.size() != listingIds.size() || uniqueIds.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new IllegalArgumentException("The cart contains an invalid or repeated listing.");
        }
        List<Long> requestIds = new ArrayList<>();
        for (Long listingId : uniqueIds) {
            Long requestId = repository.createPurchaseRequest(listingId, buyerName.trim());
            if (requestId == null) {
                throw new IllegalArgumentException("A cart listing is no longer available. Refresh the cart and try again.");
            }
            requestIds.add(requestId);
        }
        return List.copyOf(requestIds);
    }

    @Transactional
    public long saveRecognizedTrack(String trackId, String title, String artist, String releaseDate) {
        String cleanTitle = title == null ? "" : title.trim();
        String cleanArtist = artist == null ? "" : artist.trim();
        if (cleanTitle.isBlank() || cleanTitle.length() > 180
                || cleanArtist.isBlank() || cleanArtist.length() > 180) {
            throw new IllegalArgumentException("Recognized track details are incomplete.");
        }
        String cleanTrackId = trackId == null || trackId.isBlank() ? null : trackId.trim();
        Integer releaseYear = extractReleaseYear(releaseDate);
        int colorIndex = Math.floorMod((cleanTitle + "|" + cleanArtist).toLowerCase(Locale.ROOT).hashCode(),
                DISCOVERY_COVER_COLORS.length);
        long releaseId = repository.saveRecognizedTrack(cleanTrackId, cleanTitle, cleanArtist,
                releaseYear, DISCOVERY_COVER_COLORS[colorIndex]);
        repository.ensureDemoOffer(releaseId);
        return releaseId;
    }

    private static Integer extractReleaseYear(String releaseDate) {
        if (releaseDate == null) return null;
        Matcher matcher = RELEASE_YEAR.matcher(releaseDate);
        return matcher.find() ? Integer.valueOf(matcher.group()) : null;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    @Transactional
    public long createListing(long releaseId, String seller, String format, String condition,
                              BigDecimal price) {
        if (!repository.releaseExists(releaseId)) {
            throw new IllegalArgumentException("Choose a release from the catalogue.");
        }
        if (seller == null || seller.isBlank() || seller.trim().length() > 120) {
            throw new IllegalArgumentException("Enter a seller name of 1 to 120 characters.");
        }
        String normalizedFormat = format == null ? "" : format.trim().toUpperCase();
        String normalizedCondition = condition == null ? "" : condition.trim().toUpperCase();
        if (!FORMATS.contains(normalizedFormat)) {
            throw new IllegalArgumentException("Choose a valid format and condition.");
        }
        if ("DIGITAL".equals(normalizedFormat)) normalizedCondition = "DIGITAL";
        if (!CONDITIONS.contains(normalizedCondition)) {
            throw new IllegalArgumentException("Choose a valid format and condition.");
        }
        if (price == null || price.signum() < 0 || price.scale() > 2 || price.precision() > 10) {
            throw new IllegalArgumentException("Enter a valid non-negative price.");
        }
        if (!"DIGITAL".equals(normalizedFormat) && "DIGITAL".equals(normalizedCondition)) {
            throw new IllegalArgumentException("Choose a physical item condition.");
        }
        return repository.createListing(releaseId, seller.trim(), normalizedFormat,
                normalizedCondition, price);
    }

    @Transactional
    public long requestPurchase(long listingId, String buyerName) {
        if (buyerName == null || buyerName.isBlank() || buyerName.trim().length() > 120) {
            throw new IllegalArgumentException("Enter a buyer name of 1 to 120 characters.");
        }
        Long requestId = repository.createPurchaseRequest(listingId, buyerName.trim());
        if (requestId == null) throw new IllegalArgumentException("That listing is no longer available.");
        return requestId;
    }

    private static Integer validYear(Integer year) {
        return year != null && year >= 1000 && year <= 2100 ? year : null;
    }

    private static List<Long> safeIds(List<Long> ids) {
        if (ids == null) return null;
        return ids.stream().filter(id -> id != null && id > 0).distinct().limit(100).toList();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}


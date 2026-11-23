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
    private static final Set<String> FORMATS = Set.of("VINYL", "CD", "CASSETTE", "DIGITAL");
    private static final Set<String> CONDITIONS = Set.of("NEW", "LIKE_NEW", "GOOD", "FAIR", "DIGITAL");

    private final CatalogRepository repository;
    public CatalogService(CatalogRepository repository) {
        this.repository = repository;
    }

    public List<MusicRelease> search(String query, String artist, Integer fromYear,
                                     Integer toYear, String format) {
        return repository.search(query, artist, fromYear, toYear, format);
    }

    public List<MusicRelease> all() {
        return repository.all();
    }

    public CatalogueSearchPage searchCatalogue(String artist, String track, int page, int pageSize) {
        int safePage = Math.max(1, Math.min(page, 100_000));
        int safeSize = Math.max(1, Math.min(pageSize, 50));
        return repository.searchLocalCatalogue(track, artist, safePage, safeSize);
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

    public long catalogueRecordCount() {
        return repository.catalogueRecordCount();
    }

    public boolean hasActiveListings(long releaseId) {
        return repository.hasActiveListings(releaseId);
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
        if (cleanTrackId != null && !cleanTrackId.startsWith("shazam:")) {
            cleanTrackId = "shazam:" + cleanTrackId;
        }
        Integer releaseYear = extractReleaseYear(releaseDate);
        return repository.saveRecognizedTrack(cleanTrackId, cleanTitle, cleanArtist, releaseYear);
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

}


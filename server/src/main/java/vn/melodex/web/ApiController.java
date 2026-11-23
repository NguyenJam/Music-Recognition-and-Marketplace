package vn.melodex.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.melodex.catalog.CatalogService;
import vn.melodex.catalog.CatalogueSearchPage;
import vn.melodex.catalog.MarketplacePage;
import vn.melodex.catalog.PurchaseRecord;
import vn.melodex.catalog.ExchangeRateService;
import vn.melodex.catalog.MusicRelease;
import vn.melodex.recognition.ShazamRecognitionService;
import vn.melodex.recognition.RecognitionResult;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final CatalogService catalog;
    private final ExchangeRateService exchangeRates;
    private final ShazamRecognitionService recognition;
    public ApiController(CatalogService catalog, ExchangeRateService exchangeRates,
                         ShazamRecognitionService recognition) {
        this.catalog = catalog;
        this.exchangeRates = exchangeRates;
        this.recognition = recognition;
    }

    @PostMapping("/catalog/search")
    public List<MusicRelease> catalog(@RequestBody(required = false) CatalogSearchInput input) {
        CatalogSearchInput search = input == null ? new CatalogSearchInput(null, null, null, null, null) : input;
        return catalog.search(search.query(), search.artist(), search.fromYear(), search.toYear(), search.format());
    }

    @PostMapping("/catalogue/search")
    public CatalogueSearchPage localCatalogue(@RequestBody(required = false) CatalogueSearchInput input) {
        CatalogueSearchInput search = input == null ? new CatalogueSearchInput(null, null, 1, 25) : input;
        return catalog.searchCatalogue(search.artist(), search.track(),
                search.page() == null ? 1 : search.page(), search.size() == null ? 25 : search.size());
    }

    @PostMapping("/marketplace/search")
    public MarketplacePage marketplace(@RequestBody(required = false) MarketplaceSearchInput input) {
        MarketplaceSearchInput search = input == null ? MarketplaceSearchInput.empty() : input;
        try {
            return catalog.searchMarketplace(search.query(), search.artist(), search.fromYear(), search.toYear(),
                    search.format(), search.condition(), search.seller(), search.minPrice(), search.maxPrice(),
                    search.releaseIds(), search.listingIds(), search.sort() == null ? "newest" : search.sort(),
                    search.page() == null ? 1 : search.page(), search.size() == null ? 25 : search.size());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PostMapping("/buyer/purchases")
    public List<PurchaseRecord> purchases(@RequestBody PurchaseHistoryInput input) {
        return catalog.purchaseHistory(input.buyerName());
    }

    @PostMapping("/buyer/checkout")
    public Map<String, Object> checkout(@RequestBody CheckoutInput input) {
        try {
            List<Long> requestIds = catalog.checkout(input.buyerName(), input.listingIds());
            return Map.of("status", "REQUESTED", "requestIds", requestIds,
                    "message", "Purchase request received.");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @GetMapping("/exchange-rates")
    public ExchangeRateService.ExchangeRates exchangeRates() {
        return exchangeRates.latest();
    }

    @PostMapping("/recognition")
    public RecognitionResult recognize(@RequestBody byte[] pcmAudio) {
        RecognitionResult result = recognition.recognize(pcmAudio);
        if (!result.recognized()) return result;
        long releaseId = catalog.saveRecognizedTrack(result.trackId(), result.title(),
                result.artist(), result.releaseDate());
        return result.withCatalogueReleaseId(releaseId, catalog.hasActiveListings(releaseId));
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @PostMapping("/listings")
    public Map<String, Object> createListing(@RequestBody CreateListingInput input) {
        try {
            long id = catalog.createListing(input.releaseId(), input.seller(), input.format(),
                    input.condition(), input.price());
            return Map.of("id", id, "status", "AVAILABLE", "message", "Listing added.");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PostMapping("/listings/{listingId}/requests")
    public Map<String, Object> request(@PathVariable long listingId,
                                       @RequestBody PurchaseRequestInput input) {
        try {
            long id = catalog.requestPurchase(listingId, input.buyerName());
            return Map.of("id", id, "status", "REQUESTED", "message", "Purchase request received.");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    public record PurchaseRequestInput(String buyerName) {
    }

    public record CheckoutInput(String buyerName, List<Long> listingIds) {
    }

    public record PurchaseHistoryInput(String buyerName) {
    }

    public record CatalogSearchInput(String query, String artist, Integer fromYear,
                                     Integer toYear, String format) {
    }

    public record CatalogueSearchInput(String artist, String track, Integer page, Integer size) {
    }

    public record MarketplaceSearchInput(String query, String artist, Integer fromYear, Integer toYear,
                                         String format, String condition, String seller,
                                         BigDecimal minPrice, BigDecimal maxPrice,
                                         List<Long> releaseIds, List<Long> listingIds,
                                         String sort, Integer page, Integer size) {
        static MarketplaceSearchInput empty() {
            return new MarketplaceSearchInput(null, null, null, null, null, null, null,
                    null, null, null, null, "newest", 1, 25);
        }
    }

    public record CreateListingInput(long releaseId, String seller, String format,
                                     String condition, BigDecimal price) {
    }
}


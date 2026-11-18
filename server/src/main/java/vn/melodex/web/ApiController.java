package vn.melodex.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import vn.melodex.catalog.CatalogService;
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

    @GetMapping("/catalog")
    public List<MusicRelease> catalog(@RequestParam(required = false) String query,
                                      @RequestParam(required = false) String artist,
                                      @RequestParam(required = false) Integer fromYear,
                                      @RequestParam(required = false) Integer toYear,
                                      @RequestParam(required = false) String format) {
        return catalog.search(query, artist, fromYear, toYear, format);
    }

    @GetMapping("/marketplace")
    public MarketplacePage marketplace(@RequestParam(required = false) String query,
                                       @RequestParam(required = false) String artist,
                                       @RequestParam(required = false) Integer fromYear,
                                       @RequestParam(required = false) Integer toYear,
                                       @RequestParam(required = false) String format,
                                       @RequestParam(required = false) String condition,
                                       @RequestParam(required = false) String seller,
                                       @RequestParam(required = false) BigDecimal minPrice,
                                       @RequestParam(required = false) BigDecimal maxPrice,
                                       @RequestParam(required = false) List<Long> releaseIds,
                                       @RequestParam(required = false) List<Long> listingIds,
                                       @RequestParam(defaultValue = "newest") String sort,
                                       @RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "25") int size) {
        try {
            return catalog.searchMarketplace(query, artist, fromYear, toYear, format, condition,
                    seller, minPrice, maxPrice, releaseIds, listingIds, sort, page, size);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @GetMapping("/buyer/purchases")
    public List<PurchaseRecord> purchases(@RequestParam String buyerName) {
        return catalog.purchaseHistory(buyerName);
    }

    @PostMapping("/buyer/checkout")
    public Map<String, Object> checkout(@RequestBody CheckoutInput input) {
        try {
            List<Long> requestIds = catalog.checkout(input.buyerName(), input.listingIds());
            return Map.of("status", "DEMO_REQUEST", "requestIds", requestIds,
                    "message", "Demo requests recorded. No payment was taken.");
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
        return result.withCatalogueReleaseId(releaseId);
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
            return Map.of("id", id, "status", "AVAILABLE", "message", "Sample listing added to the demo catalogue.");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PostMapping("/listings/{listingId}/requests")
    public Map<String, Object> request(@PathVariable long listingId,
                                       @RequestBody PurchaseRequestInput input) {
        try {
            long id = catalog.requestPurchase(listingId, input.buyerName());
            return Map.of("id", id, "status", "DEMO_REQUEST", "message", "No payment was taken.");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    public record PurchaseRequestInput(String buyerName) {
    }

    public record CheckoutInput(String buyerName, List<Long> listingIds) {
    }

    public record CreateListingInput(long releaseId, String seller, String format,
                                     String condition, BigDecimal price) {
    }
}


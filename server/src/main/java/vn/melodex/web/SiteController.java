package vn.melodex.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import vn.melodex.catalog.CatalogueSearchPage;
import vn.melodex.catalog.CatalogService;
import vn.melodex.catalog.MarketplacePage;

import java.math.BigDecimal;
import java.util.List;

@Controller
public class SiteController {
    private final CatalogService catalog;

    public SiteController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/")
    public String home(@RequestParam(required = false) String query,
                       @RequestParam(required = false) String artist,
                       @RequestParam(required = false) Integer fromYear,
                       @RequestParam(required = false) Integer toYear,
                       @RequestParam(required = false) String format,
                       Model model) {
        model.addAttribute("items", catalog.search(query, artist, fromYear, toYear, format));
        model.addAttribute("catalogueEstimate", catalog.estimatedCanonicalEntries());
        model.addAttribute("query", safe(query));
        model.addAttribute("artist", safe(artist));
        model.addAttribute("fromYear", fromYear);
        model.addAttribute("toYear", toYear);
        model.addAttribute("format", safe(format));
        model.addAttribute("formats", new String[]{"VINYL", "CD", "CASSETTE", "DIGITAL"});
        return "home";
    }

    @GetMapping("/search")
    public String advancedSearch(@RequestParam(required = false) String artist,
                                 @RequestParam(required = false) String release,
                                 @RequestParam(required = false) String track,
                                 @RequestParam(defaultValue = "1") int page,
                                 Model model) {
        CatalogueSearchPage results = catalog.searchAdvancedCatalogue(artist, release, track, page, 25);
        model.addAttribute("results", results);
        model.addAttribute("catalogueEstimate", catalog.estimatedCanonicalEntries());
        model.addAttribute("artist", safe(artist));
        model.addAttribute("release", safe(release));
        model.addAttribute("track", safe(track));
        return "search";
    }

    @GetMapping("/marketplace")
    public String marketplace(@RequestParam(required = false) String query,
                              @RequestParam(required = false) String artist,
                              @RequestParam(required = false) Integer fromYear,
                              @RequestParam(required = false) Integer toYear,
                              @RequestParam(required = false) String format,
                              @RequestParam(required = false) String condition,
                              @RequestParam(required = false) String seller,
                              @RequestParam(required = false) BigDecimal minPrice,
                              @RequestParam(required = false) BigDecimal maxPrice,
                              @RequestParam(defaultValue = "newest") String sort,
                              @RequestParam(defaultValue = "1") int page,
                              @RequestParam(defaultValue = "all") String view,
                              Model model) {
        MarketplacePage listings;
        String error = "";
        try {
            // A catalogue search can find a recording that has no local marketplace row yet.
            // Cache matching metadata and attach the explicitly labelled demo offer so the
            // catalogue-to-buyer flow remains usable for newly discovered tracks.
            boolean hasSearchText = (query != null && !query.isBlank())
                    || (artist != null && !artist.isBlank());
            if (hasSearchText
                    && (format == null || format.isBlank())
                    && (condition == null || condition.isBlank())
                    && seller == null && minPrice == null && maxPrice == null) {
                catalog.search(query, artist, fromYear, toYear, format);
            }
            listings = catalog.searchMarketplace(query, artist, fromYear, toYear, format, condition,
                    seller, minPrice, maxPrice, null, null, sort, page, 25);
        } catch (IllegalArgumentException exception) {
            error = exception.getMessage();
            listings = catalog.searchMarketplace(null, null, null, null, null, null,
                    null, null, null, null, null, "newest", 1, 25);
        }
        model.addAttribute("listingPage", listings);
        model.addAttribute("query", safe(query));
        model.addAttribute("artist", safe(artist));
        model.addAttribute("fromYear", fromYear);
        model.addAttribute("toYear", toYear);
        model.addAttribute("format", safe(format));
        model.addAttribute("condition", safe(condition));
        model.addAttribute("seller", safe(seller));
        model.addAttribute("minPrice", minPrice);
        model.addAttribute("maxPrice", maxPrice);
        model.addAttribute("sort", listings.sort());
        model.addAttribute("view", List.of("all", "wantlist", "purchases", "cart", "settings").contains(view)
                ? view : "all");
        model.addAttribute("error", error);
        model.addAttribute("formats", new String[]{"VINYL", "CD", "CASSETTE", "DIGITAL"});
        model.addAttribute("conditions", new String[]{"NEW", "LIKE_NEW", "GOOD", "FAIR", "DIGITAL"});
        return "marketplace";
    }

    @GetMapping("/sell")
    public String sell(Model model) {
        model.addAttribute("releases", catalog.all());
        model.addAttribute("formats", new String[]{"VINYL", "CD", "CASSETTE", "DIGITAL"});
        model.addAttribute("conditions", new String[]{"NEW", "LIKE_NEW", "GOOD", "FAIR"});
        return "sell";
    }

    @PostMapping("/sell")
    public String createListing(@RequestParam long releaseId,
                                @RequestParam String seller,
                                @RequestParam String format,
                                @RequestParam(required = false) String condition,
                                @RequestParam BigDecimal price,
                                RedirectAttributes redirect) {
        try {
            catalog.createListing(releaseId, seller, format, condition, price);
            redirect.addFlashAttribute("notice", "Your sample listing is now in the demo catalogue.");
        } catch (IllegalArgumentException exception) {
            redirect.addFlashAttribute("error", exception.getMessage());
            return "redirect:/sell";
        }
        return "redirect:/";
    }

    @PostMapping("/listings/request")
    public String requestPurchase(@RequestParam long listingId,
                                  @RequestParam String buyerName,
                                  RedirectAttributes redirect) {
        try {
            long requestId = catalog.requestPurchase(listingId, buyerName);
            redirect.addFlashAttribute("notice", "Demo request #" + requestId + " was recorded. No payment was taken.");
        } catch (IllegalArgumentException exception) {
            redirect.addFlashAttribute("error", exception.getMessage());
        }
        return "redirect:/";
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}


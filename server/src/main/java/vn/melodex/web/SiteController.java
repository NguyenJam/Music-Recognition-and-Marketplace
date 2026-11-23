package vn.melodex.web;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import vn.melodex.catalog.CatalogueSearchPage;
import vn.melodex.catalog.CatalogService;
import vn.melodex.catalog.MarketplacePage;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Controller
public class SiteController {
    private static final Set<String> MARKETPLACE_VIEWS = Set.of(
            "offers", "wantlist", "saved", "collection", "purchases", "cart", "settings");

    private final CatalogService catalog;

    public SiteController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("catalogueCount", catalog.catalogueRecordCount());
        model.addAttribute("cataloguePreview", catalog.searchCatalogue(null, null, 1, 12).items());
        MarketplacePage offers = catalog.searchMarketplace(null, null, null, null, null, null,
                null, null, null, null, null, "newest", 1, 4);
        model.addAttribute("offerPreview", offers.items());
        model.addAttribute("offerCount", offers.totalItems());
        return "home";
    }

    @GetMapping("/catalogue")
    public String catalogue(Model model) {
        return renderMarketplace(null, null, null, null, null, null, null, null,
                null, null, "newest", 1, "catalogue", model);
    }

    @PostMapping("/catalogue/search")
    public String searchCatalogue(@RequestParam(required = false) String artist,
                                  @RequestParam(required = false) String track,
                                  @RequestParam(defaultValue = "1") int page,
                                  Model model) {
        return renderMarketplace(null, artist, track, null, null, null, null, null,
                null, null, "newest", page, "catalogue", model);
    }

    @GetMapping("/marketplace")
    public String marketplace(Model model) {
        return renderMarketplace(null, null, null, null, null, null, null, null,
                null, null, "newest", 1, "offers", model);
    }

    @GetMapping("/marketplace/{view}")
    public String marketplaceView(@PathVariable String view, Model model) {
        if (!MARKETPLACE_VIEWS.contains(view)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return renderMarketplace(null, null, null, null, null, null, null, null,
                null, null, "newest", 1, view, model);
    }

    @PostMapping("/marketplace/search")
    public String searchMarketplace(@RequestParam(required = false) String query,
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
                                    @RequestParam(defaultValue = "offers") String view,
                                    Model model) {
        if (!MARKETPLACE_VIEWS.contains(view)) view = "offers";
        return renderMarketplace(query, artist, null, fromYear, toYear, format, condition,
                seller, minPrice, maxPrice, sort, page, view, model);
    }

    private String renderMarketplace(String query, String artist, String track,
                                     Integer fromYear, Integer toYear, String format,
                                     String condition, String seller, BigDecimal minPrice,
                                     BigDecimal maxPrice, String sort, int page,
                                     String view, Model model) {
        MarketplacePage listings;
        String error = "";
        try {
            listings = catalog.searchMarketplace(query, artist, fromYear, toYear, format, condition,
                    seller, minPrice, maxPrice, null, null, sort, page, 25);
        } catch (IllegalArgumentException exception) {
            error = exception.getMessage();
            listings = catalog.searchMarketplace(null, null, null, null, null, null,
                    null, null, null, null, null, "newest", 1, 25);
        }
        CatalogueSearchPage cataloguePage = view.equals("catalogue")
                ? catalog.searchCatalogue(artist, track, page, 25)
                : new CatalogueSearchPage(List.of(), page, 25, 0);
        model.addAttribute("listingPage", listings);
        model.addAttribute("cataloguePage", cataloguePage);
        model.addAttribute("query", safe(query));
        model.addAttribute("artist", safe(artist));
        model.addAttribute("track", safe(track));
        model.addAttribute("fromYear", fromYear);
        model.addAttribute("toYear", toYear);
        model.addAttribute("format", safe(format));
        model.addAttribute("condition", safe(condition));
        model.addAttribute("seller", safe(seller));
        model.addAttribute("minPrice", minPrice);
        model.addAttribute("maxPrice", maxPrice);
        model.addAttribute("sort", listings.sort());
        model.addAttribute("view", view);
        model.addAttribute("catalogueCount", catalog.catalogueRecordCount());
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
            redirect.addFlashAttribute("notice", "Your listing is now available.");
        } catch (IllegalArgumentException exception) {
            redirect.addFlashAttribute("error", exception.getMessage());
            return "redirect:/sell";
        }
        return "redirect:/marketplace/offers";
    }

    @PostMapping("/listings/request")
    public String requestPurchase(@RequestParam long listingId,
                                  @RequestParam String buyerName,
                                  RedirectAttributes redirect) {
        try {
            long requestId = catalog.requestPurchase(listingId, buyerName);
            redirect.addFlashAttribute("notice", "Order request #" + requestId + " was received.");
        } catch (IllegalArgumentException exception) {
            redirect.addFlashAttribute("error", exception.getMessage());
        }
        return "redirect:/marketplace/purchases";
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}

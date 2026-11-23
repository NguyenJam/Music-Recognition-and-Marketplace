package vn.melodex.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import vn.melodex.catalog.CatalogRepository;

@Controller
public class AdminController {
    private final CatalogRepository repository;

    public AdminController(CatalogRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/admin/login")
    public String login() {
        return "admin-login";
    }

    @GetMapping("/admin")
    public String dashboard(Model model) {
        model.addAttribute("metrics", repository.adminMetrics());
        model.addAttribute("records", repository.adminRecords(200));
        return "admin";
    }
}

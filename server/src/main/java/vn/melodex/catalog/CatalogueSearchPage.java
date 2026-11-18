package vn.melodex.catalog;

import java.util.List;

public record CatalogueSearchPage(List<AdvancedCatalogueEntry> items, int page,
                                  int pageSize, boolean searched, String message) {
    public boolean hasPrevious() {
        return page > 1;
    }

    public boolean hasNext() {
        return items.size() == pageSize;
    }
}

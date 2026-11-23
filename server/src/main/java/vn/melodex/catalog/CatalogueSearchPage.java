package vn.melodex.catalog;

import java.util.List;

public record CatalogueSearchPage(List<CatalogueEntry> items, int page,
                                  int pageSize, long totalItems) {
    public boolean hasPrevious() {
        return page > 1;
    }

    public boolean hasNext() {
        return (long) page * pageSize < totalItems;
    }
}

package vn.melodex.catalog;

import java.util.List;

public record MarketplacePage(List<MarketplaceListing> items, int page, int pageSize,
                              long totalItems, String sort) {
    public int totalPages() {
        return totalItems == 0 ? 0 : (int) Math.ceil((double) totalItems / pageSize);
    }

    public boolean hasPrevious() {
        return page > 1;
    }

    public boolean hasNext() {
        return page < totalPages();
    }
}

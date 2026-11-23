package vn.melodex.catalog;

import java.math.BigDecimal;

public record MarketplaceListing(long listingId, long releaseId, String title,
                                 String artist, Integer releaseYear,
                                 String seller, String format, String condition,
                                 BigDecimal price, String currency, boolean demo) {
}

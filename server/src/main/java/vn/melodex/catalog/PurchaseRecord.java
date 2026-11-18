package vn.melodex.catalog;

import java.math.BigDecimal;
import java.time.Instant;

public record PurchaseRecord(long requestId, long listingId, String title, String artist,
                             String seller, String format, String condition,
                             BigDecimal price, String currency, String status,
                             Instant createdAt) {
}

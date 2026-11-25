package vn.melodex.catalog;

import java.math.BigDecimal;

public record Offer(long id, String seller, String format, String condition,
                    BigDecimal price, String currency, boolean demo) {
}
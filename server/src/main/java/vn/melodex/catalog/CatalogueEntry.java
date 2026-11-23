package vn.melodex.catalog;

import java.math.BigDecimal;

public record CatalogueEntry(long id, String title, String artist, Integer releaseYear,
                             String genre, String language,
                             long offerCount, BigDecimal lowestOffer) {
}

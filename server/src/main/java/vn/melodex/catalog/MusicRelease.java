package vn.melodex.catalog;

import java.util.List;

public record MusicRelease(long id, String title, String artist, Integer releaseYear,
                           List<Offer> offers) {
}


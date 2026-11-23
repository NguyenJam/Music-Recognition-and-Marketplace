package vn.melodex.catalog;

import java.time.Instant;
public record AdminRecord(long id, String title, String artist, Integer releaseYear,
                          String externalTrackId, String catalogueSource,
                          Instant createdAt,
                          long listingCount, long demoListingCount) {
    public String referenceUrl() {
        if (externalTrackId == null || externalTrackId.isBlank()) return "";
        if (externalTrackId.startsWith("shazam:")) {
            return "https://www.shazam.com/track/" + externalTrackId.substring("shazam:".length());
        }
        // FMA identifiers identify imported rows in the local catalogue; they
        // are not links to a live song lookup service.
        if (externalTrackId.startsWith("fma:")) return "";
        return "";
    }

    public String referenceLabel() {
        if (externalTrackId != null && externalTrackId.startsWith("shazam:")) return "Open Shazam track ↗";
        return "Open source reference ↗";
    }
}

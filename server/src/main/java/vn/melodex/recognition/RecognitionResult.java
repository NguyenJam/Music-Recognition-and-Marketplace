package vn.melodex.recognition;

public record RecognitionResult(boolean recognized, String title, String artist,
                                String album, String releaseDate, String trackId,
                                Long catalogueReleaseId, boolean hasListings, String message) {
    public static RecognitionResult unavailable(String message) {
        return new RecognitionResult(false, null, null, null, null, null, null, false, message);
    }

    public RecognitionResult withCatalogueReleaseId(long releaseId, boolean hasListings) {
        String status = hasListings ? "Track found and saved in the catalogue."
                : "Track found. No listings yet.";
        return new RecognitionResult(true, title, artist, album, releaseDate,
                trackId, releaseId, hasListings, status);
    }
}
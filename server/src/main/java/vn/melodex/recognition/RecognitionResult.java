package vn.melodex.recognition;

public record RecognitionResult(boolean recognized, String title, String artist,
                                String album, String releaseDate, String trackId,
                                Long catalogueReleaseId, String message) {
    public static RecognitionResult unavailable(String message) {
        return new RecognitionResult(false, null, null, null, null, null, null, message);
    }

    public RecognitionResult withCatalogueReleaseId(long releaseId) {
        return new RecognitionResult(true, title, artist, album, releaseDate,
                trackId, releaseId, "Track recognized and saved in the catalogue.");
    }
}


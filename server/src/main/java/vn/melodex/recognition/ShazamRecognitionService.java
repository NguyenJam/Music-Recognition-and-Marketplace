package vn.melodex.recognition;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class ShazamRecognitionService {
    private static final int MAX_AUDIO_BYTES = 5 * 1024 * 1024;

    private final RestClient restClient = RestClient.create();
    private final String apiKey;
    private final String apiHost;

    public ShazamRecognitionService(
            @Value("${music.recognition.rapidapi-key:}") String apiKey,
            @Value("${music.recognition.rapidapi-host:shazam.p.rapidapi.com}") String apiHost) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.apiHost = apiHost == null || apiHost.isBlank() ? "shazam.p.rapidapi.com" : apiHost.trim();
    }

    public RecognitionResult recognize(byte[] pcmAudio) {
        if (apiKey.isBlank()) {
            return RecognitionResult.unavailable(
                    "Recognition is not configured yet. Add SHAZAM_RAPIDAPI_KEY to the server environment.");
        }
        if (pcmAudio == null || pcmAudio.length < 4096) {
            return RecognitionResult.unavailable("Record or choose a clearer audio sample, then try again.");
        }
        if (pcmAudio.length > MAX_AUDIO_BYTES) {
            return RecognitionResult.unavailable("The converted audio sample must be 5 MB or smaller.");
        }

        try {
            String encodedAudio = Base64.getEncoder().encodeToString(pcmAudio);
            Map<?, ?> response = restClient.post()
                    .uri("https://" + apiHost + "/songs/v2/detect?locale=en-US")
                    .header("X-RapidAPI-Key", apiKey)
                    .header("X-RapidAPI-Host", apiHost)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(encodedAudio)
                    .retrieve()
                    .body(Map.class);

            Object trackValue = response == null ? null : response.get("track");
            if (!(trackValue instanceof Map<?, ?> track)) {
                return RecognitionResult.unavailable("No match was found in that sample. Try a clearer 5–8 second clip.");
            }
            String title = text(track.get("title")).trim();
            String artist = text(track.get("subtitle")).trim();
            if (title.isBlank() || artist.isBlank()) {
                return RecognitionResult.unavailable("A match was found, but the track details were incomplete.");
            }
            String trackId = text(track.get("key"));
            if (trackId.isBlank()) trackId = text(track.get("id"));
            return new RecognitionResult(true, title, artist, metadata(track, "Album"),
                    metadata(track, "Released"), trackId, null, false, "Track recognized.");
        } catch (RuntimeException exception) {
            return RecognitionResult.unavailable(
                    "Recognition could not be completed. Check the RapidAPI key, Shazam API subscription, and server connection.");
        }
    }

    private static String metadata(Map<?, ?> track, String label) {
        Object sectionsValue = track.get("sections");
        if (!(sectionsValue instanceof List<?> sections)) return "";
        for (Object sectionValue : sections) {
            if (!(sectionValue instanceof Map<?, ?> section)) continue;
            Object metadataValue = section.get("metadata");
            if (!(metadataValue instanceof List<?> metadata)) continue;
            for (Object itemValue : metadata) {
                if (!(itemValue instanceof Map<?, ?> item)) continue;
                if (label.equalsIgnoreCase(text(item.get("title")))) return text(item.get("text"));
            }
        }
        return "";
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}

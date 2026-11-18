package vn.melodex.catalog;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MusicBrainzCatalogueService {
    private static final String USER_AGENT = "Melodex/0.1.0 (https://github.com/NguyenJam/Music-Recognition-and-Marketplace)";

    private final RestClient client = RestClient.builder()
            .baseUrl("https://musicbrainz.org")
            .defaultHeader(HttpHeaders.USER_AGENT, USER_AGENT)
            .build();
    private long lastRequestAt;

    public List<Recording> search(String title, String artist) {
        String query = query(title, artist);
        if (query.isBlank()) return List.of();
        try {
            respectRateLimit();
            Map<String, Object> response = client.get()
                    .uri(uri -> uri.path("/ws/2/recording/")
                            .queryParam("query", query)
                            .queryParam("fmt", "json")
                            .queryParam("limit", 15)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() { });
            Object recordingsValue = response == null ? null : response.get("recordings");
            if (!(recordingsValue instanceof List<?> recordings)) return List.of();

            List<Recording> result = new ArrayList<>();
            for (Object value : recordings) {
                if (!(value instanceof Map<?, ?> recording)) continue;
                String id = text(recording.get("id"));
                String name = text(recording.get("title"));
                String creditedArtist = artist(recording.get("artist-credit"));
                if (id.isBlank() || name.isBlank() || creditedArtist.isBlank()) continue;
                result.add(new Recording("musicbrainz:" + id, name, creditedArtist,
                        text(recording.get("first-release-date"))));
            }
            return List.copyOf(result);
        } catch (RuntimeException ignored) {
            return List.of();
        }
    }

    private synchronized void respectRateLimit() {
        long wait = 1_000L - (System.currentTimeMillis() - lastRequestAt);
        if (wait > 0) {
            try {
                Thread.sleep(wait);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Music metadata request was interrupted.", exception);
            }
        }
        lastRequestAt = System.currentTimeMillis();
    }

    private static String query(String title, String artist) {
        StringBuilder query = new StringBuilder();
        if (hasText(title)) query.append("recording:\"").append(escape(title.trim())).append('\"');
        if (hasText(artist)) {
            if (!query.isEmpty()) query.append(" AND ");
            query.append("artist:\"").append(escape(artist.trim())).append('\"');
        }
        return query.toString();
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String artist(Object artistCreditValue) {
        if (!(artistCreditValue instanceof List<?> credits)) return "";
        StringBuilder name = new StringBuilder();
        for (Object value : credits) {
            if (value instanceof String creditText) {
                name.append(creditText);
                continue;
            }
            if (!(value instanceof Map<?, ?> credit)) continue;
            Object creditedName = credit.get("name");
            if (creditedName == null && credit.get("artist") instanceof Map<?, ?> artist) {
                creditedName = artist.get("name");
            }
            if (creditedName != null) name.append(creditedName);
            Object joinPhrase = credit.get("joinphrase");
            if (joinPhrase != null) name.append(joinPhrase);
        }
        return name.toString().trim();
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    public record Recording(String id, String title, String artist, String releaseDate) {
    }
}

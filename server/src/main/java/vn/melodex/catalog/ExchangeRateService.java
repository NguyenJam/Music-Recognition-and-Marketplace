package vn.melodex.catalog;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExchangeRateService {
    private static final String QUOTES = "USD,GBP,EUR,JPY,KRW,CNY";
    private static final long CACHE_MILLIS = 12 * 60 * 60 * 1000L;

    private final RestClient client = RestClient.create();
    private volatile ExchangeRates cached = new ExchangeRates("VND", "", Map.of("VND", BigDecimal.ONE), false);
    private volatile long cachedAt;

    public ExchangeRates latest() {
        if (System.currentTimeMillis() - cachedAt < CACHE_MILLIS && cached.available()) return cached;
        synchronized (this) {
            if (System.currentTimeMillis() - cachedAt < CACHE_MILLIS && cached.available()) return cached;
            try {
                List<Map<String, Object>> rows = client.get()
                        .uri("https://api.frankfurter.dev/v2/rates?base=VND&quotes=" + QUOTES)
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() { });
                Map<String, BigDecimal> rates = new LinkedHashMap<>();
                rates.put("VND", BigDecimal.ONE);
                String date = "";
                if (rows != null) {
                    for (Map<String, Object> row : rows) {
                        Object quote = row.get("quote");
                        Object value = row.get("rate");
                        if (quote != null && value != null) {
                            rates.put(quote.toString(), new BigDecimal(value.toString()));
                            if (date.isEmpty() && row.get("date") != null) date = row.get("date").toString();
                        }
                    }
                }
                if (rates.size() > 1) {
                    cached = new ExchangeRates("VND", date, Map.copyOf(rates), true);
                    cachedAt = System.currentTimeMillis();
                }
            } catch (RuntimeException ignored) {
                // Keep the last successful rates and let clients fall back to VND if none were fetched yet.
            }
            return cached;
        }
    }

    public record ExchangeRates(String base, String date, Map<String, BigDecimal> rates,
                                boolean available) {
    }
}

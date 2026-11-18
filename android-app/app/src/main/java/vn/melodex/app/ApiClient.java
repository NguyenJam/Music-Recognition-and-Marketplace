package vn.melodex.app;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class ApiClient {
    interface Callback<T> {
        void onComplete(T result, String error);
    }

    private static final ExecutorService IO = Executors.newFixedThreadPool(2);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static final String BASE = BuildConfig.API_BASE_URL.replaceAll("/+$", "");

    private ApiClient() {
    }

    static String baseUrl() {
        return BASE;
    }

    static void loadCatalog(String query, String artist, String fromYear, String toYear,
                            String format, Callback<JSONArray> callback) {
        IO.execute(() -> {
            HttpURLConnection connection = null;
            try {
                StringBuilder path = new StringBuilder(BASE).append("/api/catalog");
                StringBuilder params = new StringBuilder();
                appendParam(params, "query", query);
                appendParam(params, "artist", artist);
                appendParam(params, "fromYear", fromYear);
                appendParam(params, "toYear", toYear);
                appendParam(params, "format", format);
                if (!params.isEmpty()) path.append('?').append(params);
                connection = (HttpURLConnection) new URL(path.toString()).openConnection();
                connection.setConnectTimeout(6000);
                connection.setReadTimeout(10000);
                connection.setRequestMethod("GET");
                String body = readResponse(connection);
                JSONArray result = new JSONArray(body);
                MAIN.post(() -> callback.onComplete(result, null));
            } catch (Exception exception) {
                MAIN.post(() -> callback.onComplete(null, "Could not reach the catalogue at " + BASE + ". Start the Java server and try again."));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    static void loadExchangeRates(Callback<JSONObject> callback) {
        IO.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(BASE + "/api/exchange-rates").openConnection();
                connection.setConnectTimeout(6000);
                connection.setReadTimeout(10000);
                connection.setRequestMethod("GET");
                JSONObject result = new JSONObject(readResponse(connection));
                MAIN.post(() -> callback.onComplete(result, null));
            } catch (Exception exception) {
                MAIN.post(() -> callback.onComplete(null, "Exchange rates are unavailable. Prices remain in VND."));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    static void recognize(byte[] pcmAudio, Callback<JSONObject> callback) {
        IO.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(BASE + "/api/recognition").openConnection();
                connection.setConnectTimeout(10000);
                connection.setReadTimeout(30000);
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/octet-stream");
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(pcmAudio);
                }
                String body = readResponse(connection);
                JSONObject result = new JSONObject(body);
                MAIN.post(() -> callback.onComplete(result, null));
            } catch (Exception exception) {
                MAIN.post(() -> callback.onComplete(null, "Recognition could not reach the server. Check the Java service and try again."));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    static void requestListing(long listingId, String buyerName, Callback<JSONObject> callback) {
        IO.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(BASE + "/api/listings/" + listingId + "/requests").openConnection();
                connection.setConnectTimeout(6000);
                connection.setReadTimeout(10000);
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                JSONObject input = new JSONObject().put("buyerName", buyerName);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(input.toString().getBytes(StandardCharsets.UTF_8));
                }
                JSONObject result = new JSONObject(readResponse(connection));
                MAIN.post(() -> callback.onComplete(result, null));
            } catch (Exception exception) {
                MAIN.post(() -> callback.onComplete(null, "Could not submit the demo request. Check the server and try again."));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    static void createListing(long releaseId, String seller, String format, String condition,
                              String price, Callback<JSONObject> callback) {
        IO.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(BASE + "/api/listings").openConnection();
                connection.setConnectTimeout(6000);
                connection.setReadTimeout(10000);
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                JSONObject input = new JSONObject()
                        .put("releaseId", releaseId)
                        .put("seller", seller)
                        .put("format", format)
                        .put("condition", condition)
                        .put("price", new BigDecimal(price));
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(input.toString().getBytes(StandardCharsets.UTF_8));
                }
                JSONObject result = new JSONObject(readResponse(connection));
                MAIN.post(() -> callback.onComplete(result, null));
            } catch (Exception exception) {
                MAIN.post(() -> callback.onComplete(null, "Could not add the listing. Check the server and entered values."));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    private static String readResponse(HttpURLConnection connection) throws Exception {
        int status = connection.getResponseCode();
        InputStream stream = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
        if (stream == null) throw new IllegalStateException("Server returned HTTP " + status);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) body.append(line);
            if (status >= 400) throw new IllegalStateException(body.toString());
            return body.toString();
        }
    }

    private static String encode(String value) throws Exception {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static void appendParam(StringBuilder params, String name, String value) throws Exception {
        if (value == null || value.isBlank()) return;
        if (!params.isEmpty()) params.append('&');
        params.append(name).append('=').append(encode(value));
    }

    private static void write(OutputStream out, String value) throws Exception {
        out.write(value.getBytes(StandardCharsets.UTF_8));
    }
}


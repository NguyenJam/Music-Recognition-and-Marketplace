package vn.melodex.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.util.Currency;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {
    private static final int REQUEST_AUDIO_PERMISSION = 71;
    private static final int INK = Color.rgb(32, 32, 31);
    private static final int MUTED = Color.rgb(117, 115, 109);
    private static final int RED = Color.rgb(200, 75, 57);
    private static final int PAPER = Color.rgb(244, 241, 233);
    private static final int WHITE = Color.rgb(255, 253, 248);
    private static final int DARK_PAPER = Color.rgb(24, 25, 24);
    private static final int DARK_SURFACE = Color.rgb(35, 37, 35);
    private static final int DARK_INK = Color.rgb(238, 234, 225);
    private static final int DARK_MUTED = Color.rgb(177, 174, 165);
    private static final int AUDIO_SAMPLE_RATE = 44100;
    private static final int RECORDING_DURATION_MS = 8000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private LinearLayout catalogList;
    private EditText searchInput;
    private EditText artistInput;
    private EditText fromYearInput;
    private EditText toYearInput;
    private Spinner formatSpinner;
    private TextView recognitionStatus;
    private Button recognizeButton;
    private AudioRecord recorder;
    private volatile boolean isRecording;
    private Thread recordingThread;
    private boolean darkMode;
    private String languageCode = "en-US";
    private final Map<String, Double> exchangeRates = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        var preferences = getSharedPreferences("melodex-preferences", MODE_PRIVATE);
        darkMode = preferences.getBoolean("dark-mode", false);
        languageCode = preferences.getString("language", "en-US");
        setTheme(darkMode ? R.style.Theme_Melodex_Dark : R.style.Theme_Melodex_Light);
        getWindow().setStatusBarColor(darkMode ? DARK_PAPER : PAPER);
        getWindow().setNavigationBarColor(darkMode ? DARK_PAPER : PAPER);
        if (android.os.Build.VERSION.SDK_INT >= 29) getWindow().setNavigationBarContrastEnforced(false);
        String savedRates = preferences.getString("exchange-rates", null);
        if (savedRates != null) {
            try {
                JSONObject values = new JSONObject(savedRates);
                var keys = values.keys();
                while (keys.hasNext()) {
                    String code = keys.next();
                    exchangeRates.put(code, values.getDouble(code));
                }
            } catch (Exception ignored) { }
        }
        exchangeRates.putIfAbsent("VND", 1.0);
        buildScreen();
        loadCatalog();
        ApiClient.loadExchangeRates((result, error) -> {
            if (result == null) return;
            JSONObject values = result.optJSONObject("rates");
            if (values == null) return;
            var keys = values.keys();
            while (keys.hasNext()) {
                String code = keys.next();
                exchangeRates.put(code, values.optDouble(code, 0));
            }
            preferences.edit().putString("exchange-rates", values.toString()).apply();
            loadCatalog();
        });
    }

    private void buildScreen() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setPadding(dp(20), dp(16), dp(20), dp(36));
        page.setBackgroundColor(uiPaper());
        scroll.addView(page);

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        TextView mark = text("m", 22, WHITE, true);
        mark.setGravity(Gravity.CENTER);
        mark.setBackground(round(RED, 50));
        header.addView(mark, params(36, 36));
        TextView name = text("  melodex", 20, uiInk(), true);
        header.addView(name, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        Button themeButton = button(darkMode ? "☀  " + tr("Light mode") : "◐  " + tr("Dark mode"), uiSurface(), uiInk());
        themeButton.setOnClickListener(view -> {
            darkMode = !darkMode;
            getSharedPreferences("melodex-preferences", MODE_PRIVATE).edit().putBoolean("dark-mode", darkMode).apply();
            recreate();
        });
        header.addView(themeButton, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(42)));
        TextView tagline = text(tr("HEAR IT. FIND IT. KEEP IT."), 10, uiMuted(), true);
        tagline.setLetterSpacing(.09f);
        tagline.setPadding(0, dp(4), 0, dp(12));
        page.addView(header);
        page.addView(tagline);

        Spinner languageSpinner = new Spinner(this);
        String[] languages = {"English (US) · USD", "English (UK) · GBP", "Tiếng Việt · VND", "Español · EUR", "Français · EUR", "日本語 · JPY", "한국어 · KRW", "简体中文 · CNY"};
        languageSpinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, languages));
        languageSpinner.setSelection(languageIndex(languageCode), false);
        languageSpinner.setBackground(round(uiSurface(), 8));
        page.addView(languageSpinner, matchWidth(dp(44)));
        LinearLayout.LayoutParams languageParams = (LinearLayout.LayoutParams) languageSpinner.getLayoutParams();
        languageParams.bottomMargin = dp(18);
        languageSpinner.setLayoutParams(languageParams);
        languageSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selectedLanguage = languageAt(position);
                if (selectedLanguage.equals(languageCode)) return;
                languageCode = selectedLanguage;
                getSharedPreferences("melodex-preferences", MODE_PRIVATE).edit().putString("language", languageCode).apply();
                recreate();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) { }
        });

        TextView title = text(tr("Music finds\nits way back."), 34, uiInk(), true);
        title.setTypeface(Typeface.create("serif", Typeface.BOLD));
        page.addView(title);
        TextView intro = text(tr("Identify a track, explore its release, and browse a few sample listings."), 14, uiMuted(), false);
        intro.setPadding(0, dp(9), 0, dp(18));
        page.addView(intro);

        TextView recognitionTitle = sectionTitle(tr("IDENTIFY A TRACK"));
        page.addView(recognitionTitle);
        recognizeButton = button(tr("Record an 8-second sample"), RED, Color.WHITE);
        recognizeButton.setOnClickListener(view -> beginRecognition());
        page.addView(recognizeButton, matchWidth(dp(48)));
        recognitionStatus = text(tr("Your recording is sent for recognition but not saved. Recognized song details are added to the shared catalogue."), 12, uiMuted(), false);
        recognitionStatus.setPadding(0, dp(8), 0, dp(24));
        page.addView(recognitionStatus);

        page.addView(sectionTitle(tr("BROWSE THE CATALOGUE")));
        Button sellButton = button(tr("＋  List a sample release"), Color.rgb(84, 99, 75), Color.WHITE);
        sellButton.setOnClickListener(view -> openSellDialog());
        page.addView(sellButton, matchWidth(dp(46)));
        searchInput = new EditText(this);
        searchInput.setSingleLine(true);
        searchInput.setHint(tr("Search artist or release"));
        searchInput.setTextSize(14);
        searchInput.setTextColor(uiInk());
        searchInput.setHintTextColor(uiMuted());
        searchInput.setPadding(dp(12), 0, dp(12), 0);
        searchInput.setBackground(round(uiSurface(), 10));
        page.addView(searchInput, matchWidth(dp(48)));

        artistInput = new EditText(this);
        artistInput.setSingleLine(true);
        artistInput.setHint(tr("Filter artist / creator"));
        artistInput.setTextSize(13);
        artistInput.setTextColor(uiInk());
        artistInput.setHintTextColor(uiMuted());
        artistInput.setPadding(dp(12), 0, dp(12), 0);
        artistInput.setBackground(round(uiSurface(), 10));
        LinearLayout.LayoutParams artistParams = matchWidth(dp(46));
        artistParams.topMargin = dp(8);
        page.addView(artistInput, artistParams);

        LinearLayout yearRow = new LinearLayout(this);
        yearRow.setGravity(Gravity.CENTER_VERTICAL);
        fromYearInput = yearInput(tr("From year"));
        toYearInput = yearInput(tr("To year"));
        yearRow.addView(fromYearInput, new LinearLayout.LayoutParams(0, dp(44), 1));
        TextView yearDash = text("  —  ", 12, uiMuted(), false);
        yearRow.addView(yearDash);
        yearRow.addView(toYearInput, new LinearLayout.LayoutParams(0, dp(44), 1));
        LinearLayout.LayoutParams yearParams = matchWidth(dp(44));
        yearParams.topMargin = dp(8);
        page.addView(yearRow, yearParams);

        LinearLayout filterRow = new LinearLayout(this);
        filterRow.setGravity(Gravity.CENTER_VERTICAL);
        formatSpinner = new Spinner(this);
        String[] formats = {tr("All formats"), tr("Vinyl"), "CD", tr("Cassette"), tr("Digital")};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, formats);
        formatSpinner.setAdapter(adapter);
        filterRow.addView(formatSpinner, new LinearLayout.LayoutParams(0, dp(48), 1));
        Button searchButton = button(tr("Search"), uiInk(), uiPaper());
        searchButton.setOnClickListener(view -> loadCatalog());
        LinearLayout.LayoutParams searchParams = new LinearLayout.LayoutParams(dp(110), dp(44));
        searchParams.leftMargin = dp(10);
        filterRow.addView(searchButton, searchParams);
        page.addView(filterRow);

        catalogList = new LinearLayout(this);
        catalogList.setOrientation(LinearLayout.VERTICAL);
        catalogList.setPadding(0, dp(12), 0, 0);
        page.addView(catalogList, matchWidth(LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView footer = text(tr("DEMO LISTINGS · REQUESTS DO NOT TAKE PAYMENT"), 9, uiMuted(), true);
        footer.setGravity(Gravity.CENTER);
        footer.setPadding(0, dp(30), 0, 0);
        page.addView(footer);
        setContentView(scroll);
    }

    private void loadCatalog() {
        if (catalogList == null) return;
        catalogList.removeAllViews();
        TextView loading = text(tr("Loading releases…"), 13, uiMuted(), false);
        catalogList.addView(loading);
        String selected = formatSpinner == null ? "" : String.valueOf(formatSpinner.getSelectedItem());
        String format = tr("All formats").equals(selected) ? "" : formatCode(selected);
        ApiClient.loadCatalog(searchInput == null ? "" : searchInput.getText().toString(),
                artistInput == null ? "" : artistInput.getText().toString(),
                fromYearInput == null ? "" : fromYearInput.getText().toString(),
                toYearInput == null ? "" : toYearInput.getText().toString(), format,
                (items, error) -> {
                    catalogList.removeAllViews();
                    if (error != null) {
                        catalogList.addView(text(error, 13, RED, false));
                        return;
                    }
                    if (items.length() == 0) {
                        catalogList.addView(text(tr("No releases match those filters."), 13, uiMuted(), false));
                        return;
                    }
                    for (int index = 0; index < items.length(); index++) {
                        JSONObject item = items.optJSONObject(index);
                        if (item != null) catalogList.addView(releaseCard(item));
                    }
                });
    }

    private EditText yearInput(String hint) {
        EditText field = new EditText(this);
        field.setSingleLine(true);
        field.setHint(hint);
        field.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        field.setTextSize(13);
        field.setPadding(dp(12), 0, dp(12), 0);
        field.setTextColor(uiInk());
        field.setHintTextColor(uiMuted());
        field.setBackground(round(uiSurface(), 10));
        return field;
    }

    private void openSellDialog() {
        ApiClient.loadCatalog("", "", "", "", "", (releases, error) -> {
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_LONG).show();
                return;
            }
            showSellDialog(releases);
        });
    }

    private void showSellDialog(JSONArray releases) {
        if (releases.length() == 0) {
            Toast.makeText(this, tr("The catalogue has no releases yet."), Toast.LENGTH_SHORT).show();
            return;
        }
        LinearLayout form = new LinearLayout(this);
        form.setOrientation(LinearLayout.VERTICAL);
        form.setPadding(dp(22), dp(8), dp(22), dp(2));

        Spinner releaseSpinner = new Spinner(this);
        String[] releaseLabels = new String[releases.length()];
        for (int index = 0; index < releases.length(); index++) {
            JSONObject release = releases.optJSONObject(index);
            releaseLabels[index] = release == null ? tr("Release") :
                    release.optString("title") + " — " + release.optString("artist");
        }
        releaseSpinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, releaseLabels));
        form.addView(fieldLabel(tr("Release")));
        form.addView(releaseSpinner);

        EditText seller = dialogInput(tr("Seller or shop name"));
        form.addView(fieldLabel(tr("Seller name")));
        form.addView(seller);

        Spinner formatSpinner = new Spinner(this);
        String[] formats = {tr("Vinyl"), "CD", tr("Cassette"), tr("Digital")};
        formatSpinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, formats));
        form.addView(fieldLabel(tr("Format")));
        form.addView(formatSpinner);

        Spinner conditionSpinner = new Spinner(this);
        String[] conditions = {tr("New"), tr("Like new"), tr("Good"), tr("Fair")};
        conditionSpinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, conditions));
        form.addView(fieldLabel(tr("Condition (ignored for digital)")));
        form.addView(conditionSpinner);

        EditText price = dialogInput(tr("Price in VND"));
        price.setInputType(android.text.InputType.TYPE_CLASS_NUMBER | android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL);
        form.addView(fieldLabel(tr("Price")));
        form.addView(price);

        new AlertDialog.Builder(this)
                .setTitle(tr("Add a sample listing"))
                .setMessage(tr("This creates a demo listing. It does not arrange payment or delivery."))
                .setView(form)
                .setNegativeButton(tr("Cancel"), null)
                .setPositiveButton(tr("Add listing"), (dialog, which) -> {
                    JSONObject chosen = releases.optJSONObject(releaseSpinner.getSelectedItemPosition());
                    String amount = price.getText().toString().trim();
                    String sellerName = seller.getText().toString().trim();
                    if (chosen == null || amount.isBlank() || sellerName.isBlank()) {
                        Toast.makeText(this, tr("Choose a release and enter a seller and price."), Toast.LENGTH_LONG).show();
                        return;
                    }
                    String selectedFormat = formatCode(formats[formatSpinner.getSelectedItemPosition()]);
                    String selectedCondition = conditionCode(conditions[conditionSpinner.getSelectedItemPosition()]);
                    ApiClient.createListing(chosen.optLong("id"), sellerName, selectedFormat,
                            selectedCondition, amount, (result, requestError) -> {
                                Toast.makeText(this, requestError == null ? tr("Sample listing added.") : requestError,
                                        Toast.LENGTH_LONG).show();
                                if (requestError == null) loadCatalog();
                            });
                }).show();
    }

    private TextView fieldLabel(String value) {
        TextView label = text(value, 10, uiMuted(), true);
        label.setPadding(0, dp(12), 0, 0);
        return label;
    }

    private EditText dialogInput(String hint) {
        EditText field = new EditText(this);
        field.setSingleLine(true);
        field.setTextSize(14);
        field.setHint(hint);
        return field;
    }

    private View releaseCard(JSONObject release) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(15), dp(14), dp(15), dp(12));
        card.setBackground(round(uiSurface(), 12));
        LinearLayout.LayoutParams cardParams = matchWidth(LinearLayout.LayoutParams.WRAP_CONTENT);
        cardParams.bottomMargin = dp(12);
        card.setLayoutParams(cardParams);

        TextView releaseTitle = text(release.optString("title"), 19, uiInk(), true);
        releaseTitle.setTypeface(Typeface.create("serif", Typeface.BOLD));
        card.addView(releaseTitle);
        int year = release.optInt("releaseYear", 0);
        card.addView(text(release.optString("artist") + "  ·  " + (year > 0 ? year : tr("Year unknown")), 12, uiMuted(), false));

        JSONArray offers = release.optJSONArray("offers");
        if (offers == null || offers.length() == 0) {
            TextView noOffers = text(tr("No sample listings yet."), 12, uiMuted(), false);
            noOffers.setPadding(0, dp(12), 0, 0);
            card.addView(noOffers);
        } else {
            for (int i = 0; i < offers.length(); i++) {
                JSONObject offer = offers.optJSONObject(i);
                if (offer != null) card.addView(offerRow(offer));
            }
        }
        return card;
    }

    private View offerRow(JSONObject offer) {
        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, dp(12), 0, 0);
        String offerInfo = formatName(offer.optString("format")) + " · " +
                formatName(offer.optString("condition")) + "\n" + offer.optString("seller") + " · " +
                money(offer.optString("price"), offer.optString("currency"));
        if (offer.optBoolean("demo")) offerInfo += " · " + tr("Sample offer");
        TextView details = text(offerInfo, 11, uiInk(), false);
        row.addView(details, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        Button request = button(tr("Request"), Color.rgb(84, 99, 75), Color.WHITE);
        request.setOnClickListener(view -> askBuyerName(offer.optLong("id")));
        row.addView(request, new LinearLayout.LayoutParams(dp(92), dp(38)));
        return row;
    }

    private void askBuyerName(long listingId) {
        EditText buyer = new EditText(this);
        buyer.setHint(tr("Your name"));
        buyer.setSingleLine(true);
        new AlertDialog.Builder(this)
                .setTitle(tr("Send a demo request"))
                .setMessage(tr("This does not charge a payment method."))
                .setView(buyer)
                .setNegativeButton(tr("Cancel"), null)
                .setPositiveButton(tr("Send request"), (dialog, which) -> {
                    String name = buyer.getText().toString().trim();
                    ApiClient.requestListing(listingId, name, (result, error) -> {
                        Toast.makeText(this, error == null ? tr("Demo request recorded. No payment was taken.") : error,
                                Toast.LENGTH_LONG).show();
                    });
                }).show();
    }

    private void beginRecognition() {
        if (isRecording) return;
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_AUDIO_PERMISSION);
            return;
        }
        startRecording();
    }

    private void startRecording() {
        try {
            int minimumBuffer = AudioRecord.getMinBufferSize(AUDIO_SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
            if (minimumBuffer <= 0) throw new IllegalStateException(tr("Microphone format is unavailable."));
            int bufferSize = Math.max(minimumBuffer, AUDIO_SAMPLE_RATE);
            recorder = new AudioRecord(MediaRecorder.AudioSource.MIC, AUDIO_SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, bufferSize);
            if (recorder.getState() != AudioRecord.STATE_INITIALIZED) {
                throw new IllegalStateException(tr("Microphone could not be initialized."));
            }
            isRecording = true;
            recorder.startRecording();
            recognizeButton.setText(tr("Recording…"));
            recognizeButton.setEnabled(false);
            recognitionStatus.setText(tr("Listening for 8 seconds. Keep the phone near the music."));
            AudioRecord activeRecorder = recorder;
            recordingThread = new Thread(() -> capturePcm(activeRecorder, bufferSize), "melodex-audio-capture");
            recordingThread.start();
        } catch (Exception exception) {
            isRecording = false;
            releaseRecorder();
            recognitionStatus.setText(tr("Could not start the microphone. Try again or check app permissions."));
            recognizeButton.setEnabled(true);
        }
    }

    private void capturePcm(AudioRecord activeRecorder, int bufferSize) {
        ByteArrayOutputStream audio = new ByteArrayOutputStream(AUDIO_SAMPLE_RATE * 2 * RECORDING_DURATION_MS / 1000);
        byte[] chunk = new byte[Math.max(4096, bufferSize / 2)];
        long deadline = SystemClock.elapsedRealtime() + RECORDING_DURATION_MS;
        String captureError = null;
        try {
            while (isRecording && SystemClock.elapsedRealtime() < deadline) {
                int bytesRead = activeRecorder.read(chunk, 0, chunk.length, AudioRecord.READ_BLOCKING);
                if (bytesRead > 0) {
                    audio.write(chunk, 0, bytesRead);
                } else if (bytesRead < 0) {
                    captureError = tr("The microphone stopped while recording. Try again.");
                    break;
                }
            }
        } catch (RuntimeException exception) {
            captureError = tr("The microphone stopped while recording. Try again.");
        }
        byte[] pcm = audio.toByteArray();
        String finalCaptureError = captureError;
        handler.post(() -> finishRecording(pcm, finalCaptureError));
    }

    private void finishRecording(byte[] pcmAudio, String captureError) {
        if (!isRecording) return;
        isRecording = false;
        releaseRecorder();
        if (isFinishing() || isDestroyed()) return;
        if (captureError != null || pcmAudio.length < AUDIO_SAMPLE_RATE * 2) {
            recognitionStatus.setText(captureError == null ? tr("The sample was too short. Try recording again.") : captureError);
            resetRecognitionButton();
            return;
        }
        recognizeButton.setText(tr("Sending sample…"));
        recognitionStatus.setText(tr("Looking for a match…"));
        ApiClient.recognize(pcmAudio, (result, error) -> {
            resetRecognitionButton();
            if (error != null) {
                recognitionStatus.setText(error);
                return;
            }
            if (result.optBoolean("recognized")) {
                String match = result.optString("title") + " — " + result.optString("artist");
                String album = result.optString("album");
                if (!album.isBlank() && !"null".equals(album)) match += "\n" + album;
                recognitionStatus.setText(tr("Track found and saved in the catalogue") + "\n" + match);
            } else {
                recognitionStatus.setText(result.optString("message", tr("No match. Try a clearer sample.")));
            }
        });
    }

    private void resetRecognitionButton() {
        recognizeButton.setText(tr("Record an 8-second sample"));
        recognizeButton.setEnabled(true);
    }

    private void releaseRecorder() {
        if (recorder != null) {
            AudioRecord current = recorder;
            recorder = null;
            try {
                if (current.getRecordingState() == AudioRecord.RECORDSTATE_RECORDING) current.stop();
            } catch (RuntimeException ignored) { }
            current.release();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_AUDIO_PERMISSION && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            startRecording();
        } else if (requestCode == REQUEST_AUDIO_PERMISSION) {
            recognitionStatus.setText(tr("Microphone permission is needed to record a song sample."));
        }
    }

    @Override
    protected void onDestroy() {
        isRecording = false;
        if (recordingThread != null) recordingThread.interrupt();
        releaseRecorder();
        super.onDestroy();
    }

    private TextView sectionTitle(String title) {
        TextView view = text(title, 10, RED, true);
        view.setLetterSpacing(.09f);
        view.setPadding(0, dp(8), 0, dp(10));
        return view;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return view;
    }

    private Button button(String value, int backgroundColor, int textColor) {
        Button view = new Button(this);
        view.setText(value);
        view.setAllCaps(false);
        view.setTextSize(13);
        view.setTextColor(textColor);
        view.setBackground(round(backgroundColor, 10));
        return view;
    }

    private android.graphics.drawable.GradientDrawable round(int color, int radius) {
        android.graphics.drawable.GradientDrawable drawable = new android.graphics.drawable.GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radius));
        return drawable;
    }

    private LinearLayout.LayoutParams params(int width, int height) {
        return new LinearLayout.LayoutParams(dp(width), dp(height));
    }

    private LinearLayout.LayoutParams matchWidth(int height) {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,
                height == LinearLayout.LayoutParams.WRAP_CONTENT ? height : dp(height));
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String formatName(String value) {
        if ("LIKE_NEW".equals(value)) return tr("Like new");
        if (value.isEmpty()) return "";
        String name = value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1).toLowerCase(Locale.ROOT);
        return tr(name);
    }

    private String money(String value, String baseCurrency) {
        try {
            double amount = Double.parseDouble(value);
            String currency = currencyCode();
            if (!currency.equals(baseCurrency)) {
                Double rate = exchangeRates.get(currency);
                if (rate == null || rate <= 0) {
                    return NumberFormat.getIntegerInstance(Locale.US).format(Math.round(amount)) + " VND";
                }
                amount *= rate;
            }
            long rounded = Math.round(amount);
            if ("VND".equals(currency)) {
                return NumberFormat.getIntegerInstance(Locale.US).format(rounded) + " VND";
            }
            NumberFormat formatter = NumberFormat.getCurrencyInstance(numberLocale());
            formatter.setCurrency(Currency.getInstance(currency));
            formatter.setMinimumFractionDigits(0);
            formatter.setMaximumFractionDigits(0);
            return formatter.format(rounded);
        } catch (Exception exception) {
            return value;
        }
    }

    private int uiPaper() { return darkMode ? DARK_PAPER : PAPER; }
    private int uiSurface() { return darkMode ? DARK_SURFACE : WHITE; }
    private int uiInk() { return darkMode ? DARK_INK : INK; }
    private int uiMuted() { return darkMode ? DARK_MUTED : MUTED; }

    private String currencyCode() {
        return switch (languageCode) {
            case "en-GB" -> "GBP";
            case "vi-VN" -> "VND";
            case "es-ES", "fr-FR" -> "EUR";
            case "ja-JP" -> "JPY";
            case "ko-KR" -> "KRW";
            case "zh-CN" -> "CNY";
            default -> "USD";
        };
    }

    private Locale numberLocale() {
        return switch (languageCode) {
            case "en-GB" -> Locale.UK;
            case "vi-VN" -> Locale.forLanguageTag("vi-VN");
            case "es-ES" -> Locale.forLanguageTag("es-ES");
            case "fr-FR" -> Locale.FRANCE;
            case "ja-JP" -> Locale.JAPAN;
            case "ko-KR" -> Locale.KOREA;
            case "zh-CN" -> Locale.SIMPLIFIED_CHINESE;
            default -> Locale.US;
        };
    }

    private String formatCode(String localized) {
        if (localized.equals(tr("Vinyl"))) return "VINYL";
        if (localized.equals(tr("Cassette"))) return "CASSETTE";
        if (localized.equals(tr("Digital"))) return "DIGITAL";
        return localized.toUpperCase(Locale.ROOT);
    }

    private String conditionCode(String localized) {
        for (String condition : new String[]{"New", "Like new", "Good", "Fair"}) {
            if (localized.equals(tr(condition))) return condition.toUpperCase(Locale.ROOT).replace(' ', '_');
        }
        return localized.toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    private int languageIndex(String code) {
        String[] codes = {"en-US", "en-GB", "vi-VN", "es-ES", "fr-FR", "ja-JP", "ko-KR", "zh-CN"};
        for (int i = 0; i < codes.length; i++) if (codes[i].equals(code)) return i;
        return 0;
    }

    private String languageAt(int index) {
        String[] codes = {"en-US", "en-GB", "vi-VN", "es-ES", "fr-FR", "ja-JP", "ko-KR", "zh-CN"};
        return codes[Math.max(0, Math.min(index, codes.length - 1))];
    }

    private String tr(String english) {
        String language = languageCode.substring(0, 2);
        if ("en".equals(language)) return english;
        String[] translated = switch (english) {
            case "Dark mode" -> new String[]{"Chế độ tối", "Modo oscuro", "Mode sombre", "ダークモード", "다크 모드", "深色模式"};
            case "Light mode" -> new String[]{"Chế độ sáng", "Modo claro", "Mode clair", "ライトモード", "라이트 모드", "浅色模式"};
            case "HEAR IT. FIND IT. KEEP IT." -> new String[]{"NGHE THẤY. TÌM RA. LƯU LẠI.", "ESCUCHA. ENCUENTRA. CONSERVA.", "ÉCOUTER. TROUVER. GARDER.", "聴いて、見つけて、残そう。", "듣고, 찾고, 간직하세요.", "听见它，找到它，收藏它。"};
            case "Music finds\nits way back." -> new String[]{"Âm nhạc\nthật gần gũi.", "La música\nvuelve a ti.", "La musique\nrevient à vous.", "音楽と、\nまた出会う。", "음악을 다시\n만나다.", "让音乐\n再次相遇。"};
            case "Identify a track, explore its release, and browse a few sample listings." -> new String[]{"Nhận diện bài hát, xem bản phát hành và tham khảo các tin đăng mẫu.", "Identifica canciones, explora sus ediciones y consulta anuncios de muestra.", "Identifiez un titre, explorez ses éditions et consultez des annonces de démonstration.", "曲を特定し、作品を見て、出品例を確認できます。", "곡을 찾고 발매 정보를 살펴본 뒤 샘플 상품을 둘러보세요.", "识别歌曲、查看发行信息并浏览示例商品。"};
            case "IDENTIFY A TRACK" -> new String[]{"NHẬN DIỆN BÀI HÁT", "IDENTIFICAR CANCIÓN", "IDENTIFIER UN TITRE", "曲を特定", "곡 식별", "识别歌曲"};
            case "Record an 8-second sample" -> new String[]{"Ghi âm mẫu 8 giây", "Grabar una muestra de 8 segundos", "Enregistrer un extrait de 8 secondes", "8秒間録音する", "8초 샘플 녹음", "录制 8 秒音频"};
            case "Your recording is sent for recognition but not saved. Recognized song details are added to the shared catalogue." -> new String[]{"Bản ghi được gửi để nhận diện và không được lưu. Thông tin bài hát tìm được sẽ được thêm vào danh mục.", "El audio se envía para identificarlo y no se guarda. Los datos encontrados se añaden al catálogo.", "L’extrait est envoyé pour identification, sans être conservé. Les titres trouvés sont ajoutés au catalogue.", "録音は識別のために送信され、保存されません。見つかった曲の情報はカタログに追加されます。", "녹음은 식별 요청에 사용된 뒤 저장되지 않습니다. 찾은 곡 정보는 카탈로그에 추가됩니다.", "录音仅用于识别，不会保存。识别到的歌曲信息会加入目录。"};
            case "BROWSE THE CATALOGUE" -> new String[]{"KHÁM PHÁ DANH MỤC", "EXPLORAR CATÁLOGO", "PARCOURIR LE CATALOGUE", "カタログを見る", "카탈로그 둘러보기", "浏览目录"};
            case "＋  List a sample release" -> new String[]{"＋  Đăng sản phẩm mẫu", "＋  Publicar edición de muestra", "＋  Ajouter une annonce exemple", "＋  サンプルを出品", "＋  샘플 상품 등록", "＋  发布示例商品"};
            case "Search artist or release" -> new String[]{"Tìm nghệ sĩ hoặc bản phát hành", "Buscar artista o edición", "Rechercher un artiste ou une édition", "アーティスト・作品を検索", "아티스트 또는 발매작 검색", "搜索艺人或发行作品"};
            case "Filter artist / creator" -> new String[]{"Lọc nghệ sĩ / người sáng tạo", "Filtrar artista / creador", "Filtrer par artiste / créateur", "アーティストで絞り込む", "아티스트 / 제작자 필터", "按艺人 / 创作者筛选"};
            case "From year" -> new String[]{"Từ năm", "Desde el año", "À partir de", "開始年", "시작 연도", "起始年份"};
            case "To year" -> new String[]{"Đến năm", "Hasta el año", "Jusqu’à", "終了年", "종료 연도", "结束年份"};
            case "All formats" -> new String[]{"Tất cả định dạng", "Todos los formatos", "Tous les formats", "すべての形式", "모든 형식", "所有格式"};
            case "Vinyl" -> new String[]{"Đĩa than", "Vinilo", "Vinyle", "レコード", "바이닐", "黑胶"};
            case "New" -> new String[]{"Mới", "Nuevo", "Neuf", "新品", "새 상품", "全新"};
            case "Like new" -> new String[]{"Như mới", "Como nuevo", "Comme neuf", "ほぼ新品", "거의 새 상품", "近乎全新"};
            case "Good" -> new String[]{"Tốt", "Bueno", "Bon", "良好", "양호", "良好"};
            case "Fair" -> new String[]{"Khá", "Aceptable", "Correct", "可", "보통", "一般"};
            case "Cassette" -> new String[]{"Băng cassette", "Casete", "Cassette", "カセット", "카세트", "磁带"};
            case "Digital" -> new String[]{"Kỹ thuật số", "Digital", "Numérique", "デジタル", "디지털", "数字版"};
            case "Search" -> new String[]{"Tìm kiếm", "Buscar", "Rechercher", "検索", "검색", "搜索"};
            case "Loading releases…" -> new String[]{"Đang tải bản phát hành…", "Cargando ediciones…", "Chargement des éditions…", "作品を読み込み中…", "발매 정보 불러오는 중…", "正在加载发行信息…"};
            case "No releases match those filters." -> new String[]{"Không có bản phát hành phù hợp.", "No hay ediciones que coincidan.", "Aucune édition ne correspond.", "条件に合う作品がありません。", "조건에 맞는 발매작이 없습니다.", "没有符合条件的发行作品。"};
            case "Year unknown" -> new String[]{"Chưa rõ năm", "Año desconocido", "Année inconnue", "年不明", "연도 미상", "年份未知"};
            case "Sample offer" -> new String[]{"Tin mẫu", "Oferta de muestra", "Offre exemple", "サンプル出品", "샘플 상품", "示例商品"};
            case "Request" -> new String[]{"Yêu cầu", "Solicitar", "Demander", "リクエスト", "요청", "请求"};
            case "DEMO LISTINGS · REQUESTS DO NOT TAKE PAYMENT" -> new String[]{"TIN ĐĂNG MẪU · KHÔNG THANH TOÁN", "ANUNCIOS DE MUESTRA · SIN PAGOS", "ANNONCES EXEMPLE · SANS PAIEMENT", "デモ出品 · 決済なし", "샘플 상품 · 결제 없음", "示例商品 · 不收款"};
            default -> null;
        };
        int index = switch (language) { case "vi" -> 0; case "es" -> 1; case "fr" -> 2; case "ja" -> 3; case "ko" -> 4; case "zh" -> 5; default -> -1; };
        return index < 0 || translated == null ? english : translated[index];
    }
}


(() => {
  const storageGet = (key) => {
    try { return window.localStorage.getItem(key); } catch (ignored) { return null; }
  };
  const storageSet = (key, value) => {
    try { window.localStorage.setItem(key, value); return true; } catch (ignored) { return false; }
  };
  const recognitionForm = document.querySelector('#recognition-form');
  const resultBox = document.querySelector('#recognition-result');
  const recordButton = document.querySelector('#record-button');
  const fileInput = recognitionForm?.querySelector('input[type="file"]');
  const fileButton = document.querySelector('#file-button');
  const fileButtonLabel = document.querySelector('#file-button-label');
  const fileSelection = document.querySelector('#file-selection');
  const selectedAudioName = document.querySelector('#selected-audio-name');
  const selectedAudioDetails = document.querySelector('#selected-audio-details');
  const clearAudioButton = document.querySelector('#clear-audio');
  const languageSelect = document.querySelector('#language-select');
  const themeToggle = document.querySelector('#theme-toggle');

  const { base, translations, localeConfig } = window.MelodexI18n;
  const savedLocale = window.MelodexPreferences?.locale || storageGet('melodex-locale');
  let locale = localeConfig[savedLocale] ? savedLocale : 'en-US';
  let messages = { ...base, ...(translations[locale] || {}) };
  let rates = { VND: 1 };
  let rateDate = '';
  let activeRecorder;
  let activeStream;
  let recordingTimer;

  const readableSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const t = (key) => messages[key] || base[key] || key;

  const applyPrices = () => {
    const currency = localeConfig[locale].currency;
    const localeName = localeConfig[locale].language;
    document.querySelectorAll('.localized-price[data-price-vnd]').forEach((element) => {
      const amountVnd = Number(element.dataset.priceVnd);
      const rate = Number(rates[currency] || 0);
      if (!Number.isFinite(amountVnd) || !rate) {
        element.textContent = `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amountVnd))} VND`;
        return;
      }
      const rounded = Math.round(amountVnd * rate);
      if (currency === 'VND') {
        element.textContent = `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(rounded)} VND`;
      } else {
        element.textContent = new Intl.NumberFormat(localeName, {
          style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0,
        }).format(rounded);
      }
    });
  };

  const translateOptions = () => {
    const formatLabels = { VINYL: 'formatVinyl', CD: 'formatCd', CASSETTE: 'formatCassette', DIGITAL: 'formatDigital' };
    const conditionLabels = { NEW: 'conditionNew', LIKE_NEW: 'conditionLikeNew', GOOD: 'conditionGood', FAIR: 'conditionFair' };
    document.querySelectorAll('select[name="format"] option').forEach((option) => {
      if (option.value && formatLabels[option.value]) option.textContent = t(formatLabels[option.value]);
    });
    document.querySelectorAll('#condition-select option').forEach((option) => {
      if (conditionLabels[option.value]) option.textContent = t(conditionLabels[option.value]);
    });
    const conditionLabel = document.querySelector('#condition-field > span');
    if (conditionLabel && document.querySelector('#format-select')?.value === 'DIGITAL') {
      conditionLabel.textContent = t('conditionIgnored');
    } else if (conditionLabel) {
      conditionLabel.textContent = t('condition');
    }
  };

  const applyLanguage = () => {
    messages = { ...base, ...(translations[locale] || {}) };
    document.documentElement.lang = locale;
    if (languageSelect) languageSelect.value = locale;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-offer-count]').forEach((element) => {
      const count = Number(element.dataset.count || 0);
      element.textContent = `${count} ${count === 1 ? t('oneOffer') : t('manyOffers')}`;
    });
    translateOptions();
    if (fileInput?.files?.[0]) updateFileSelection();
    applyPrices();
    updateThemeButton();
  };

  const updateFileSelection = () => {
    const file = fileInput?.files?.[0];
    if (!file || !fileSelection || !selectedAudioName || !selectedAudioDetails) {
      if (fileSelection) fileSelection.hidden = true;
      fileButton?.classList.remove('has-file');
      if (fileButtonLabel) fileButtonLabel.textContent = t('chooseAudio');
      return;
    }
    selectedAudioName.textContent = file.name;
    selectedAudioDetails.textContent = `${readableSize(file.size)} · ${t('readyToIdentify')}`;
    fileSelection.hidden = false;
    fileButton?.classList.add('has-file');
    if (fileButtonLabel) fileButtonLabel.textContent = t('changeAudio');
  };

  const storedRates = storageGet('melodex-rates');
  if (storedRates) {
    try {
      const saved = JSON.parse(storedRates);
      if (saved.rates) rates = saved.rates;
      rateDate = saved.date || '';
    } catch (ignored) { /* Invalid stale cache will be replaced by the API response. */ }
  }

  const loadExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) throw new Error('Rates unavailable');
      const result = await response.json();
      if (result.rates) {
        rates = result.rates;
        rateDate = result.date || '';
        storageSet('melodex-rates', JSON.stringify({ rates, date: rateDate }));
        applyPrices();
      }
    } catch (ignored) {
      // Use the last saved reference rates; VND remains available if none were fetched.
    }
  };

  function updateThemeButton() {
    if (!themeToggle) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    const label = themeToggle.querySelector('[data-i18n]');
    if (label) label.textContent = dark ? t('lightMode') : t('darkMode');
  }

  applyLanguage();
  loadExchangeRates();

  document.addEventListener('melodex:locale-change', (event) => {
    const selectedLocale = event.detail?.locale;
    locale = localeConfig[selectedLocale] ? selectedLocale : 'en-US';
    applyLanguage();
  });
  fileInput?.addEventListener('change', updateFileSelection);
  clearAudioButton?.addEventListener('click', () => {
    if (fileInput) fileInput.value = '';
    updateFileSelection();
    fileInput?.focus();
  });

  const showResult = (message, match) => {
    if (!resultBox) return;
    resultBox.replaceChildren();
    resultBox.classList.add('visible');
    const summary = document.createElement('strong');
    summary.textContent = message;
    resultBox.append(summary);
    if (match?.recognized) {
      const details = document.createElement('span');
      details.textContent = ` ${match.title} — ${match.artist}${match.releaseDate ? ` (${match.releaseDate})` : ''}`;
      resultBox.append(details);
      const link = document.createElement('a');
      const listingStatus = document.createElement('span');
      listingStatus.className = match.hasListings ? 'recognition-listings-found' : 'recognition-no-listings';
      listingStatus.textContent = ` ${match.hasListings ? t('listingsAvailable') : t('noListingsYet')}`;
      resultBox.append(listingStatus);
      link.href = '/marketplace/offers';
      link.textContent = ` ${t('browseCurrentOffers')}`;
      resultBox.append(link);
    } else if (match?.message) {
      const details = document.createElement('span');
      details.textContent = ` ${match.message}`;
      resultBox.append(details);
    }
  };

  const pcmFromAudio = async (file) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextClass || !OfflineAudioContextClass) throw new Error('Audio conversion is not supported in this browser.');
    const decoder = new AudioContextClass();
    try {
      const decoded = await decoder.decodeAudioData(await file.arrayBuffer());
      const seconds = Math.min(decoded.duration, 8);
      const frames = Math.max(1, Math.floor(seconds * 44100));
      const offline = new OfflineAudioContextClass(1, frames, 44100);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      source.start(0, 0, seconds);
      const rendered = await offline.startRendering();
      const samples = rendered.getChannelData(0);
      const pcm = new ArrayBuffer(samples.length * 2);
      const view = new DataView(pcm);
      for (let index = 0; index < samples.length; index += 1) {
        const sample = Math.max(-1, Math.min(1, samples[index]));
        view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }
      return pcm;
    } finally {
      await decoder.close().catch(() => {});
    }
  };

  const sendAudio = async (file) => {
    if (!file) return;
    showResult(t('preparing'));
    try {
      const pcm = await pcmFromAudio(file);
      const response = await fetch('/api/recognition', {
        method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: pcm,
      });
      const result = await response.json();
      showResult(result.recognized ? t('trackFound') : t('noMatch'), result);
    } catch (error) {
      showResult(t('audioError'));
    }
  };

  recognitionForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    sendAudio(fileInput?.files?.[0]);
  });

  const setRecordLabel = (message) => {
    const label = recordButton?.querySelector('[data-i18n]');
    if (label) label.textContent = t(message);
  };
  recordButton?.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      showResult(t('recordingError'));
      return;
    }
    if (activeRecorder?.state === 'recording') {
      activeRecorder.stop();
      return;
    }
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(activeStream);
      activeRecorder = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        clearTimeout(recordingTimer);
        recordingTimer = null;
        activeStream?.getTracks().forEach((track) => track.stop());
        activeStream = null;
        setRecordLabel('recordAgain');
        const type = recorder.mimeType || 'audio/webm';
        const extension = type.includes('mp4') ? 'm4a' : 'webm';
        await sendAudio(new File(chunks, `sample.${extension}`, { type }));
      };
      recorder.start();
      setRecordLabel('recording');
      recordButton.classList.add('recording');
      recordingTimer = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
        recordButton.classList.remove('recording');
      }, 8000);
      recorder.addEventListener('stop', () => recordButton.classList.remove('recording'), { once: true });
    } catch (error) {
      activeStream?.getTracks().forEach((track) => track.stop());
      activeStream = null;
      showResult(t('allowMicrophone'));
    }
  });

  const formatSelect = document.querySelector('#format-select');
  const conditionField = document.querySelector('#condition-field');
  const syncCondition = () => {
    if (!formatSelect || !conditionField) return;
    const digital = formatSelect.value === 'DIGITAL';
    conditionField.hidden = digital;
    const conditionSelect = conditionField.querySelector('select');
    conditionSelect.required = !digital;
    conditionSelect.disabled = digital;
    translateOptions();
  };
  formatSelect?.addEventListener('change', syncCondition);
  syncCondition();

  const WANTLIST_KEY = 'melodex-wantlist';
  const CART_KEY = 'melodex-cart';
  const BUYER_KEY = 'melodex-buyer-name';
  const SAVED_SEARCH_KEY = 'melodex-saved-searches';
  const COLLECTION_KEY = 'melodex-collection';
  const safeRead = (key, fallback) => {
    try { return JSON.parse(storageGet(key) || ''); } catch (ignored) { return fallback; }
  };
  const readWantlist = () => {
    const items = safeRead(WANTLIST_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && item.id) : [];
  };
  const readCart = () => {
    const items = safeRead(CART_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && Number(item.listingId) > 0) : [];
  };
  const readSavedSearches = () => {
    const items = safeRead(SAVED_SEARCH_KEY, []);
    if (!Array.isArray(items)) return [];
    return items.filter((item) => item && item.id).map((item) => {
      if (item.filters) return item;
      const filters = {};
      try {
        new URL(item.href || '/marketplace', window.location.origin).searchParams.forEach((value, key) => {
          if (key !== 'view' && key !== 'page') filters[key] = value;
        });
      } catch (ignored) { }
      return { ...item, filters: { view: 'offers', ...filters } };
    });
  };
  const readCollection = () => {
    const items = safeRead(COLLECTION_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && item.id) : [];
  };
  const writeWantlist = (items) => storageSet(WANTLIST_KEY, JSON.stringify(items));
  const writeCart = (items) => storageSet(CART_KEY, JSON.stringify(items));
  const writeSavedSearches = (items) => storageSet(SAVED_SEARCH_KEY, JSON.stringify(items));
  const writeCollection = (items) => storageSet(COLLECTION_KEY, JSON.stringify(items));
  const countNodes = (selector, count) => document.querySelectorAll(selector).forEach((node) => { node.textContent = String(count); });
  const updateBuyerCounts = () => {
    countNodes('[data-want-count]', readWantlist().length);
    countNodes('[data-cart-count]', readCart().length);
    countNodes('[data-saved-search-count]', readSavedSearches().length);
    countNodes('[data-collection-count]', readCollection().length);
  };
  const feedbackNode = document.querySelector('#market-feedback');
  let toastTimer;
  const showBuyerFeedback = (message, isError = false) => {
    let node = feedbackNode;
    if (!node) {
      node = document.querySelector('#site-feedback');
      if (!node) {
        node = document.createElement('div');
        node.id = 'site-feedback';
        node.className = 'global-feedback';
        node.setAttribute('role', 'status');
        node.setAttribute('aria-live', 'polite');
        document.body.append(node);
      }
    }
    node.textContent = message;
    node.classList.add('visible');
    node.classList.toggle('error', isError);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 4200);
  };
  const wantItemFromButton = (button) => ({
    id: button.dataset.wantId,
    releaseId: Number(button.dataset.releaseId || 0) || null,
    title: button.dataset.title || 'Untitled recording',
    artist: button.dataset.artist || 'Unknown artist',
    release: button.dataset.release || '',
  });
  const updateWantButtons = () => {
    const ids = new Set(readWantlist().map((item) => item.id));
    document.querySelectorAll('.want-toggle[data-want-id]').forEach((button) => {
      const saved = ids.has(button.dataset.wantId);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      const label = button.querySelector('span');
      if (label) label.textContent = saved ? t('saved') : t('wantlist');
    });
  };
  const updateCollectionButtons = () => {
    const ids = new Set(readCollection().map((item) => item.id));
    document.querySelectorAll('.collection-toggle[data-collection-id]').forEach((button) => {
      const saved = ids.has(button.dataset.collectionId);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      const label = button.querySelector('span');
      if (label) label.textContent = saved ? t('inCollection') : t('collection');
    });
  };
  const toggleWantItem = (button) => {
    const item = wantItemFromButton(button);
    const items = readWantlist();
    const exists = items.some((saved) => saved.id === item.id);
    writeWantlist(exists ? items.filter((saved) => saved.id !== item.id) : [...items, item]);
    updateWantButtons();
    updateBuyerCounts();
    showBuyerFeedback(exists ? t('removedFromWantlist') : t('savedToWantlist'));
    if (document.querySelector('[data-market-view="wantlist"]')) renderWantlist();
  };
  const cartItemFromButton = (button) => ({
    listingId: Number(button.dataset.listingId),
    releaseId: Number(button.dataset.releaseId),
    title: button.dataset.title || 'Untitled release',
    artist: button.dataset.artist || 'Unknown artist',
    format: button.dataset.format || 'DIGITAL',
    condition: button.dataset.condition || 'DIGITAL',
    priceVnd: Number(button.dataset.priceVnd || 0),
    currency: button.dataset.currency || 'VND',
    seller: button.dataset.seller || 'Seller',
  });
  const addCartItem = (button) => {
    const item = cartItemFromButton(button);
    if (!item.listingId) return;
    const items = readCart();
    if (items.some((saved) => Number(saved.listingId) === item.listingId)) {
      showBuyerFeedback(t('alreadyInCart'));
      return;
    }
    items.push(item);
    writeCart(items);
    updateBuyerCounts();
    showBuyerFeedback(t('addedToCart'));
    if (document.querySelector('[data-market-view="cart"]')) renderCart();
  };
  const catalogueItemFromButton = (button) => ({
    id: button.dataset.collectionId || button.dataset.wantId,
    title: button.dataset.title || 'Untitled recording',
    artist: button.dataset.artist || 'Unknown artist',
    release: button.dataset.release || '',
  });
  const toggleCollectionItem = (button) => {
    const item = catalogueItemFromButton(button);
    if (!item.id) return;
    const collection = readCollection();
    const exists = collection.some((saved) => saved.id === item.id);
    writeCollection(exists ? collection.filter((saved) => saved.id !== item.id) : [...collection, item]);
    updateCollectionButtons();
    updateBuyerCounts();
    showBuyerFeedback(exists ? t('removedFromCollection') : t('addedToCollection'));
    if (document.querySelector('[data-market-view="collection"]')) renderCollection();
  };
  const postForm = (action, values) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = action;
    Object.entries(values).forEach(([name, value]) => {
      if (value === null || value === undefined || value === '') return;
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = String(value);
      form.append(input);
    });
    document.body.append(form);
    form.submit();
  };
  const saveCurrentSearch = (button) => {
    const form = button.closest('form');
    if (!form) return;
    const filters = { view: 'offers' };
    new FormData(form).forEach((value, key) => {
      const clean = String(value).trim();
      if (clean && key !== 'view' && key !== 'page') filters[key] = clean;
    });
    const label = [filters.query, filters.artist, filters.format, filters.condition]
      .filter(Boolean).join(' · ') || 'All available offers';
    const searches = readSavedSearches();
    if (searches.some((item) => JSON.stringify(item.filters) === JSON.stringify(filters))) {
      showBuyerFeedback(t('alreadySaved'));
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    writeSavedSearches([{ id, label, filters }, ...searches].slice(0, 100));
    updateBuyerCounts();
    showBuyerFeedback(t('savedSearchFeedback'));
    if (document.querySelector('[data-market-view="saved"]')) renderSavedSearches();
  };
  document.addEventListener('click', (event) => {
    const wantButton = event.target.closest('.want-toggle[data-want-id]');
    if (wantButton) { toggleWantItem(wantButton); return; }
    const cartButton = event.target.closest('.cart-add[data-listing-id]');
    if (cartButton) addCartItem(cartButton);
    const collectionButton = event.target.closest('.collection-toggle[data-collection-id]');
    if (collectionButton) { toggleCollectionItem(collectionButton); return; }
    const saveSearchButton = event.target.closest('[data-save-search]');
    if (saveSearchButton) saveCurrentSearch(saveSearchButton);
  });

  const marketViewNode = document.querySelector('.market-main[data-market-view]');
  const buyerNameInput = document.querySelector('#buyer-name');
  const buyerName = () => storageGet(BUYER_KEY) || '';
  const formatCondition = (condition) => {
    const keys = { LIKE_NEW: 'conditionLikeNew', NEW: 'conditionNew', GOOD: 'conditionGood', FAIR: 'conditionFair', DIGITAL: 'formatDigital' };
    return keys[condition] ? t(keys[condition]) : (condition || t('conditionUnknown'));
  };
  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };
  const addAction = (parent, label, className, callback) => {
    const button = makeElement('button', className, label);
    button.type = 'button';
    button.addEventListener('click', callback);
    parent.append(button);
    return button;
  };
  const emptyClientList = (container, message, linkHref, linkText) => {
    container.replaceChildren();
    const empty = makeElement('div', 'client-empty', message);
    if (linkHref && linkText) {
      const link = makeElement('a', 'client-empty-link', linkText);
      link.href = linkHref;
      empty.append(document.createElement('br'), link);
    }
    container.append(empty);
  };
  const responseJson = async (response) => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.detail || 'The request could not be completed.');
    return result;
  };
  const createListingRow = (listing, options = {}) => {
    const row = makeElement('article', 'client-row');
    const copy = makeElement('div');
    copy.append(makeElement('h3', '', `${listing.title} — ${listing.artist}`));
    copy.append(makeElement('p', '', `${listing.format ? `${listing.format} · ` : ''}${formatCondition(listing.condition)} · ${listing.seller || 'Seller'}`));
    row.append(copy);
    const actions = makeElement('div', 'client-row-actions');
    const price = makeElement('strong', 'localized-price');
    price.dataset.priceVnd = String(listing.price ?? listing.priceVnd ?? 0);
    price.textContent = `${price.dataset.priceVnd} VND`;
    actions.append(price);
    if (options.addToCart) {
      addAction(actions, t('addToCartAction'), 'button button-dark', () => {
        const button = document.createElement('button');
        button.dataset.listingId = String(listing.listingId);
        button.dataset.releaseId = String(listing.releaseId);
        button.dataset.title = listing.title;
        button.dataset.artist = listing.artist;
        button.dataset.format = listing.format;
        button.dataset.condition = listing.condition;
        button.dataset.priceVnd = String(listing.price ?? listing.priceVnd ?? 0);
        button.dataset.currency = listing.currency || 'VND';
        button.dataset.seller = listing.seller;
        addCartItem(button);
      });
    }
    if (options.removeWantId) {
      addAction(actions, t('remove'), 'want-toggle', () => {
        writeWantlist(readWantlist().filter((item) => item.id !== options.removeWantId));
        updateBuyerCounts();
        updateWantButtons();
        renderWantlist();
      });
    }
    row.append(actions);
    return row;
  };
  const renderWantlist = async () => {
    const container = document.querySelector('#wantlist-items');
    if (!container) return;
    const saved = readWantlist();
    if (!saved.length) {
      emptyClientList(container, t('emptyWantlist'), '/catalogue', t('findRecordingToSave'));
      return;
    }
    const releaseIds = saved.map((item) => item.releaseId).filter(Boolean);
    let offers = [];
    if (releaseIds.length) {
      try {
        const result = await responseJson(await fetch('/api/marketplace/search', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ releaseIds, size: 100, sort: 'price-low' }),
        }));
        offers = result.items || [];
      } catch (error) { showBuyerFeedback(t('requestCouldNotComplete'), true); }
    }
    container.replaceChildren();
    saved.forEach((item) => {
      const matching = offers.filter((offer) => Number(offer.releaseId) === Number(item.releaseId));
      if (!matching.length) {
        const row = makeElement('article', 'client-row');
        const copy = makeElement('div');
        copy.append(makeElement('h3', '', `${item.title} — ${item.artist}`));
        copy.append(makeElement('p', '', item.release ? `${item.release} · ${t('noAvailableListingsYet')}` : t('noAvailableListingsYet')));
        row.append(copy);
        const actions = makeElement('div', 'client-row-actions');
        addAction(actions, t('searchListingsAction'), 'button button-outline', () => {
          postForm('/marketplace/search', { view: 'offers', query: item.title, artist: item.artist });
        });
        addAction(actions, t('remove'), 'want-toggle', () => {
          writeWantlist(readWantlist().filter((savedItem) => savedItem.id !== item.id));
          updateBuyerCounts();
          updateWantButtons();
          renderWantlist();
        });
        row.append(actions);
        container.append(row);
      } else {
        matching.forEach((offer) => container.append(createListingRow(offer, { addToCart: true, removeWantId: item.id })));
      }
    });
    applyPrices();
  };
  const renderSavedSearches = () => {
    const container = document.querySelector('#saved-search-items');
    if (!container) return;
    const searches = readSavedSearches();
    if (!searches.length) {
      emptyClientList(container, t('noSavedSearches'), '/marketplace/offers', t('filterAvailableOffers'));
      return;
    }
    container.replaceChildren();
    searches.forEach((search) => {
      const row = makeElement('article', 'client-row');
      const copy = makeElement('div');
      copy.append(makeElement('h3', '', search.label));
      copy.append(makeElement('p', '', Object.entries(search.filters || {}).filter(([key]) => key !== 'view')
        .map(([key, value]) => `${key}: ${value}`).join(' · ') || t('availableOffers')));
      row.append(copy);
      const actions = makeElement('div', 'client-row-actions');
      addAction(actions, t('openSearch'), 'button button-dark', () => {
        postForm('/marketplace/search', search.filters || { view: 'offers' });
      });
      addAction(actions, t('remove'), 'want-toggle', () => {
        writeSavedSearches(readSavedSearches().filter((item) => item.id !== search.id));
        updateBuyerCounts();
        renderSavedSearches();
      });
      row.append(actions);
      container.append(row);
    });
  };
  const renderCollection = () => {
    const container = document.querySelector('#collection-items');
    if (!container) return;
    const collection = readCollection();
    if (!collection.length) {
      emptyClientList(container, t('emptyCollection'), '/catalogue', t('browseCatalogueAction'));
      return;
    }
    container.replaceChildren();
    collection.forEach((item) => {
      const row = makeElement('article', 'client-row');
      const copy = makeElement('div');
      copy.append(makeElement('h3', '', `${item.title} — ${item.artist}`));
      if (item.release) copy.append(makeElement('p', '', item.release));
      row.append(copy);
      const actions = makeElement('div', 'client-row-actions');
      addAction(actions, t('checkOffers'), 'button button-outline', () => {
        postForm('/marketplace/search', { view: 'offers', query: item.title, artist: item.artist });
      });
      addAction(actions, t('remove'), 'want-toggle', () => {
        writeCollection(readCollection().filter((saved) => saved.id !== item.id));
        updateBuyerCounts();
        renderCollection();
      });
      row.append(actions);
      container.append(row);
    });
  };
  const renderCart = async () => {
    const container = document.querySelector('#cart-items');
    const summary = document.querySelector('#cart-summary');
    if (!container || !summary) return;
    const saved = readCart();
    if (!saved.length) {
      summary.hidden = true;
      emptyClientList(container, t('emptyCart'), '/marketplace/offers', t('browseAvailableListings'));
      return;
    }
    let available = [];
    try {
      const result = await responseJson(await fetch('/api/marketplace/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingIds: saved.map((item) => item.listingId), size: 100, sort: 'newest' }),
      }));
      available = result.items || [];
    } catch (error) { showBuyerFeedback(t('requestCouldNotComplete'), true); }
    const availableIds = new Set(available.map((item) => Number(item.listingId)));
    container.replaceChildren();
    saved.forEach((item) => {
      const listing = available.find((offer) => Number(offer.listingId) === Number(item.listingId));
      if (!listing) {
        const row = makeElement('article', 'client-row');
        const copy = makeElement('div');
        copy.append(makeElement('h3', '', `${item.title} — ${item.artist}`));
        copy.append(makeElement('p', '', t('listingUnavailable')));
        row.append(copy);
        const actions = makeElement('div', 'client-row-actions');
        addAction(actions, t('remove'), 'want-toggle', () => {
          writeCart(readCart().filter((savedItem) => Number(savedItem.listingId) !== Number(item.listingId)));
          updateBuyerCounts();
          renderCart();
        });
        row.append(actions);
        container.append(row);
      } else {
        const row = createListingRow(listing);
        addAction(row.querySelector('.client-row-actions'), t('remove'), 'want-toggle', () => {
          writeCart(readCart().filter((savedItem) => Number(savedItem.listingId) !== Number(item.listingId)));
          updateBuyerCounts();
          renderCart();
        });
        container.append(row);
      }
    });
    const subtotal = available.reduce((sum, listing) => sum + Number(listing.price || 0), 0);
    const subtotalNode = document.querySelector('#cart-subtotal');
    if (subtotalNode) subtotalNode.dataset.priceVnd = String(subtotal);
    summary.hidden = available.length === 0;
    summary.dataset.availableIds = [...availableIds].join(',');
    applyPrices();
  };
  const renderPurchases = async () => {
    const container = document.querySelector('#purchase-items');
    if (!container) return;
    const name = buyerName();
    if (!name) {
      emptyClientList(container, t('buyerNameNeeded'), '/marketplace/settings', t('openBuyerSettings'));
      return;
    }
    try {
      const purchases = await responseJson(await fetch('/api/buyer/purchases', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName: name }),
      }));
      if (!purchases.length) {
        emptyClientList(container, t('noPurchaseRequests'), '/marketplace/offers', t('browseAvailableListings'));
        return;
      }
      container.replaceChildren();
      purchases.forEach((purchase) => {
        const row = createListingRow(purchase);
        const requestNote = makeElement('p', 'request-status', `${purchase.status.replaceAll('_', ' ')} · ${new Date(purchase.createdAt).toLocaleString(localeConfig[locale].language)}`);
        row.querySelector('.client-row > div').append(requestNote);
        container.append(row);
      });
      applyPrices();
    } catch (error) {
      emptyClientList(container, t('requestCouldNotComplete'));
    }
  };

  const settingsForm = document.querySelector('#buyer-settings-form');
  if (buyerNameInput) buyerNameInput.value = buyerName();
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = buyerNameInput?.value.trim();
    if (!name) return;
    storageSet(BUYER_KEY, name.slice(0, 120));
    showBuyerFeedback(t('buyerSettingsSaved'));
  });
  document.querySelector('#checkout-button')?.addEventListener('click', async () => {
    const name = buyerName();
    if (!name) {
      showBuyerFeedback(t('setBuyerNameFirst'), true);
      window.location.href = '/marketplace/settings';
      return;
    }
    const listingIds = readCart().map((item) => Number(item.listingId));
    if (!listingIds.length) return;
    const button = document.querySelector('#checkout-button');
    button.disabled = true;
    try {
      const result = await responseJson(await fetch('/api/buyer/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName: name, listingIds }),
      }));
      writeCart([]);
      updateBuyerCounts();
      showBuyerFeedback(`${t('orderRequestRecorded')} ${result.requestIds.join(', ')}.`);
      await renderCart();
    } catch (error) {
      showBuyerFeedback(t('requestCouldNotComplete'), true);
      await renderCart();
    } finally { button.disabled = false; }
  });
  const catalogueResults = document.querySelector('[data-catalogue-results]');
  const setCatalogueLayout = (layout) => {
    if (!catalogueResults) return;
    const selected = layout === 'grid' ? 'grid' : 'list';
    catalogueResults.dataset.layout = selected;
    storageSet('melodex-catalogue-layout', selected);
    document.querySelectorAll('[data-view-mode]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.viewMode === selected));
    });
  };
  if (catalogueResults) {
    setCatalogueLayout(storageGet('melodex-catalogue-layout') || 'list');
    document.querySelectorAll('[data-view-mode]').forEach((button) => {
      button.addEventListener('click', () => setCatalogueLayout(button.dataset.viewMode));
    });
  }
  updateBuyerCounts();
  updateWantButtons();
  updateCollectionButtons();
  if (marketViewNode) {
    const activeView = marketViewNode.dataset.marketView || 'catalogue';
    document.querySelectorAll('.market-panel[data-panel], .buyer-panel[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== activeView;
    });
    if (activeView === 'wantlist') renderWantlist();
    if (activeView === 'saved') renderSavedSearches();
    if (activeView === 'collection') renderCollection();
    if (activeView === 'cart') renderCart();
    if (activeView === 'purchases') renderPurchases();
  }
})();

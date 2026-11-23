(() => {
  const i18n = window.MelodexI18n || {};
  const base = i18n.base || {};
  const translations = i18n.translations || {};
  const localeConfig = i18n.localeConfig || { 'en-US': { currency: 'USD', language: 'en-US' } };
  const storageGet = (key) => {
    try { return window.localStorage.getItem(key); } catch (ignored) { return null; }
  };
  const storageSet = (key, value) => {
    try { window.localStorage.setItem(key, value); } catch (ignored) { /* The controls still work for this page. */ }
  };

  const savedLocale = storageGet('melodex-locale');
  let locale = localeConfig[savedLocale] ? savedLocale : 'en-US';
  let messages = { ...base, ...(translations[locale] || {}) };
  const translate = (key) => messages[key] || base[key] || key;

  const updateThemeLabel = () => {
    const button = document.querySelector('#theme-toggle');
    if (!button) return;
    const isDark = document.documentElement.dataset.theme === 'dark';
    const nextModeLabel = translate(isDark ? 'lightMode' : 'darkMode');
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', nextModeLabel);
    button.title = nextModeLabel;
    const label = button.querySelector('[data-i18n]');
    if (label) label.textContent = nextModeLabel;
  };

  const applyLanguage = () => {
    messages = { ...base, ...(translations[locale] || {}) };
    document.documentElement.lang = locale;
    const selector = document.querySelector('#language-select');
    const languageControl = selector?.closest('.language-control');
    const languageOptions = languageControl?.querySelectorAll('[data-locale-option]') || [];
    const selectedOption = Array.from(languageOptions).find((option) => option.dataset.localeOption === locale);
    const currentLocale = selector?.querySelector('.language-current');
    if (selectedOption && currentLocale) currentLocale.textContent = selectedOption.textContent.trim();
    languageOptions.forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.localeOption === locale));
    });
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.placeholder = translate(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', translate(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-offer-count]').forEach((element) => {
      const count = Number(element.dataset.count || 0);
      element.textContent = `${count} ${count === 1 ? translate('oneOffer') : translate('manyOffers')}`;
    });
    updateThemeLabel();
  };

  const setTheme = (value) => {
    const theme = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    storageSet('melodex-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#181918' : '#f4f1e9';
    updateThemeLabel();
  };

  const setLocale = (value) => {
    locale = localeConfig[value] ? value : 'en-US';
    storageSet('melodex-locale', locale);
    applyLanguage();
    document.dispatchEvent(new CustomEvent('melodex:locale-change', { detail: { locale } }));
  };

  window.MelodexPreferences = {
    get locale() { return locale; },
    setLocale,
    setTheme,
    translate,
  };

  const savedTheme = storageGet('melodex-theme');
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  setTheme(savedTheme || (systemDark ? 'dark' : 'light'));
  applyLanguage();

  const languageControl = document.querySelector('.language-control');
  const languageTrigger = languageControl?.querySelector('#language-select');
  const languageList = languageControl?.querySelector('.language-options');
  const languageItems = () => Array.from(languageList?.querySelectorAll('[data-locale-option]') || []);
  const closeLanguageList = (restoreFocus = false) => {
    if (!languageTrigger || !languageList) return;
    languageList.hidden = true;
    languageTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) languageTrigger.focus();
  };
  const openLanguageList = (edge = null) => {
    if (!languageTrigger || !languageList) return;
    languageList.hidden = false;
    languageTrigger.setAttribute('aria-expanded', 'true');
    const items = languageItems();
    const selectedIndex = Math.max(0, items.findIndex((item) => item.dataset.localeOption === locale));
    const target = edge === 'first' ? items[0] : edge === 'last' ? items[items.length - 1] : items[selectedIndex];
    target?.focus();
  };

  if (languageControl && languageTrigger && languageList) {
    languageTrigger.addEventListener('click', () => {
      if (languageTrigger.getAttribute('aria-expanded') === 'true') closeLanguageList();
      else openLanguageList();
    });
    languageTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        openLanguageList(event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : null);
      }
    });
    languageList.addEventListener('click', (event) => {
      const option = event.target?.closest?.('[data-locale-option]');
      if (!option || !languageList.contains(option)) return;
      setLocale(option.dataset.localeOption);
      closeLanguageList(true);
    });
    languageList.addEventListener('keydown', (event) => {
      const items = languageItems();
      const index = items.indexOf(document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLanguageList(true);
        return;
      }
      if (event.key === 'Tab') {
        closeLanguageList();
        return;
      }
      let nextIndex = null;
      if (event.key === 'ArrowDown') nextIndex = (index + 1 + items.length) % items.length;
      if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = items.length - 1;
      if (nextIndex !== null) {
        event.preventDefault();
        items[nextIndex]?.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!languageControl.contains(event.target)) closeLanguageList();
    });
  }

  // Delegate from the document so the controls keep working if page content is refreshed.
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#theme-toggle');
    if (!button) return;
    event.preventDefault();
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'melodex-theme' && event.newValue) setTheme(event.newValue);
    if (event.key === 'melodex-locale' && event.newValue) setLocale(event.newValue);
  });

  const menu = document.querySelector('.topbar-menu');
  if (menu) {
    const compactLayout = window.matchMedia('(max-width: 1240px)');
    menu.open = !compactLayout.matches;
    document.documentElement.classList.add('menu-ready');
    menu.addEventListener('toggle', () => { if (!menu.open) closeLanguageList(); });
    compactLayout.addEventListener('change', (event) => { menu.open = !event.matches; });
    document.addEventListener('click', (event) => {
      if (compactLayout.matches && menu.open && !menu.contains(event.target)) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && compactLayout.matches && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
  }
})();

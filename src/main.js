import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const API = 'https://api.nasa.gov/planetary/apod';
const MIN_DATE = '1995-06-16';

const todayEl = document.querySelector('#today');
const clockEl = document.querySelector('#clock');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const luckyBtn = document.querySelector('#lucky-btn');
const searchWrap = document.querySelector('.search-wrap');
const suggest = document.querySelector('#suggest');
const engineBtn = document.querySelector('#engine-btn');
const engineMenu = document.querySelector('#engine-menu');
const engineIcon = document.querySelector('#engine-icon');
const linksEl = document.querySelector('#quick-links');
const bg = document.querySelector('#bg');
const titleEl = document.querySelector('#apod-title');
const explanationEl = document.querySelector('#apod-explanation');
const explainToggle = document.querySelector('#explain-toggle');
const mediaEl = document.querySelector('#apod-media');
const favBtn = document.querySelector('#fav-btn');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');
const dateInput = document.querySelector('#date-input');
const weather = document.querySelector('#weather');
const weatherCity = document.querySelector('#weather-city');
const weatherEdit = document.querySelector('#weather-edit');
const weatherInput = document.querySelector('#weather-input');
const weatherTemp = document.querySelector('#weather-temp');
const weatherIcon = document.querySelector('#weather-icon');
const weatherDesc = document.querySelector('#weather-desc');
const weatherMeta = document.querySelector('#weather-meta');
const calTitle = document.querySelector('#cal-title');
const calPrev = document.querySelector('#cal-prev');
const calNext = document.querySelector('#cal-next');
const calWeekdays = document.querySelector('#cal-weekdays');
const calGrid = document.querySelector('#cal-grid');
const todoList = document.querySelector('#todo-list');
const todoAdd = document.querySelector('#todo-add');
const todoInput = document.querySelector('#todo-input');
const issLoc = document.querySelector('#iss-loc');
const issCoords = document.querySelector('#iss-coords');
const moonEl = document.querySelector('#moon-phase');
const newsList = document.querySelector('#news-list');
const recentsList = document.querySelector('#recents-list');
const widgetAddBtn = document.querySelector('#widget-add-btn');
const widgetEditBtn = document.querySelector('#widget-edit-btn');
const widgetModal = document.querySelector('#widget-modal');
const widgetModalTitle = document.querySelector('#widget-modal-title');
const widgetPicker = document.querySelector('#widget-picker');
const widgetModalClose = document.querySelector('#widget-modal-close');
const overlays = document.querySelector('.overlays');
const modal = document.querySelector('#add-modal');
const addForm = document.querySelector('#add-form');
const addName = document.querySelector('#add-name');
const addUrl = document.querySelector('#add-url');
const addCancel = document.querySelector('#add-cancel');
const engineModal = document.querySelector('#engine-modal');
const engineForm = document.querySelector('#engine-form');
const engineName = document.querySelector('#engine-name');
const engineUrl = document.querySelector('#engine-url');
const engineCancel = document.querySelector('#engine-cancel');
const clockEdit = document.querySelector('#clock-edit');
const clockFormatEl = document.querySelector('#clock-format');
const clockTzEl = document.querySelector('#clock-tz');
const settingsBtn = document.querySelector('#settings-btn');
const settingsMenu = document.querySelector('#settings-menu');

const WMO = {
  0: ['Clear sky', '☀️'],  1: ['Mostly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'],
  57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'],
  67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '🌨️'],
  80: ['Light showers', '🌦️'],
  81: ['Showers', '🌧️'],
  82: ['Heavy showers', '⛈️'],
  85: ['Snow showers', '🌨️'],
  86: ['Snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm', '⛈️'],
  99: ['Thunderstorm', '⛈️']
};

const DEFAULT_LINKS = [
  { name: 'NASA', url: 'https://www.nasa.gov' },
  { name: 'APOD', url: 'https://apod.nasa.gov/apod/astropix.html' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'Google', url: 'https://www.google.com' }
];

const now = new Date();
const todayStr = toDateStr(now);
let currentDate = todayStr;
let currentData = null;
let favorites = JSON.parse(localStorage.getItem('solartab:favorites') || '{}');
let links = JSON.parse(localStorage.getItem('solartab:links') || 'null') ?? DEFAULT_LINKS;
let activeEngine = localStorage.getItem('solartab:engine') || 'google';

let clockFormat = localStorage.getItem('solartab:clockformat') || '24';
let clockTimezone = localStorage.getItem('solartab:timezone') || '';
let theme = localStorage.getItem('solartab:theme') || 'dark';
let accent = localStorage.getItem('solartab:accent') || '#5a8bff';
let sunTimes = null;

const ACCENTS = ['#5a8bff', '#a78bfa', '#f472b6', '#34d399', '#2dd4bf', '#fb923c', '#f87171', '#fbbf24'];

function isDaytime() {
  if (!sunTimes) {
    const h = new Date().getHours();
    return h >= 6 && h < 18;
  }
  const now = new Date();
  return now >= sunTimes.sunrise && now < sunTimes.sunset;
}

function effectiveTheme() {
  return theme === 'auto' ? (isDaytime() ? 'light' : 'dark') : theme;
}

async function fetchSunTimes(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const s = data.daily;
    if (s && s.sunrise && s.sunset) {
      sunTimes = { sunrise: new Date(s.sunrise[0]), sunset: new Date(s.sunset[0]) };
      if (theme === 'auto') applyTheme();
    }
  } catch {}
}

function initAutoTheme() {
  const saved = JSON.parse(localStorage.getItem('solartab:weather') || 'null');
  if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number') {
    fetchSunTimes(saved.lat, saved.lon);
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = effectiveTheme();
}

function applyAccent() {
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const root = document.documentElement;
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.18)`);
  accentCustom.value = accent;
  [...accentSwatches.children].forEach((s) => {
    s.classList.toggle('active', s.dataset.accent === accent);
  });
}

function buildAccentSwatches() {
  accentSwatches.innerHTML = '';
  ACCENTS.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset.accent = c;
    b.style.background = c;
    b.title = c;
    b.setAttribute('aria-label', `Accent ${c}`);
    b.addEventListener('click', () => {
      accent = c;
      localStorage.setItem('solartab:accent', accent);
      applyAccent();
    });
    accentSwatches.appendChild(b);
  });
}

function renderThemeOptions() {
  themeOptions.querySelectorAll('[data-theme-opt]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themeOpt === theme);
  });
}

function openSettings() {
  settingsBtn.setAttribute('aria-expanded', 'true');
  settingsMenu.hidden = false;
}

function closeSettings() {
  settingsBtn.setAttribute('aria-expanded', 'false');
  settingsMenu.hidden = true;
}

function buildSettingsMenu() {
  settingsMenu.innerHTML = `
    <div class="settings-section">
      <div class="settings-title">Theme</div>
      <div class="settings-options" id="theme-options">
        <button type="button" data-theme-opt="light">Light</button>
        <button type="button" data-theme-opt="dark">Dark</button>
        <button type="button" data-theme-opt="auto">Auto</button>
      </div>
    </div>
    <div class="settings-section">
      <div class="settings-title">Accent color</div>
      <div class="settings-swatches" id="accent-swatches"></div>
      <label class="settings-custom">
        <span>Custom</span>
        <input type="color" id="accent-custom" value="#5a8bff" />
      </label>
    </div>
  `;
}

settingsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeEngineMenu();
  if (settingsMenu.hidden) openSettings();
  else closeSettings();
});

buildSettingsMenu();

const themeOptions = settingsMenu.querySelector('#theme-options');
const accentSwatches = settingsMenu.querySelector('#accent-swatches');
const accentCustom = settingsMenu.querySelector('#accent-custom');

buildAccentSwatches();
renderThemeOptions();

themeOptions.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-theme-opt]');
  if (!btn) return;
  theme = btn.dataset.themeOpt;
  localStorage.setItem('solartab:theme', theme);
  renderThemeOptions();
  applyTheme();
});

accentCustom.addEventListener('input', () => {
  accent = accentCustom.value;
  localStorage.setItem('solartab:accent', accent);
  applyAccent();
});

document.addEventListener('click', (e) => {
  if (settingsMenu.hidden) return;
  if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) closeSettings();
});

applyTheme();
applyAccent();
initAutoTheme();
setInterval(() => {
  if (theme === 'auto') applyTheme();
}, 60000);

const FALLBACK_TIMEZONES = [
  'UTC', 'Pacific/Midway', 'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles',
  'America/Phoenix', 'America/Denver', 'America/Chicago', 'America/New_York',
  'America/Caracas', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
  'Atlantic/South_Georgia', 'Atlantic/Azores', 'Europe/London', 'Europe/Lisbon',
  'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Athens',
  'Europe/Moscow', 'Europe/Istanbul', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata',
  'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Hong_Kong', 'Asia/Shanghai',
  'Asia/Taipei', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Adelaide', 'Australia/Sydney',
  'Australia/Brisbane', 'Pacific/Auckland', 'Pacific/Fiji'
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tickClock() {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: clockFormat === '12',
    ...(clockTimezone ? { timeZone: clockTimezone } : {})
  });
  clockEl.textContent = fmt.format(d);
}

function renderDate() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(clockTimezone ? { timeZone: clockTimezone } : {})
  });
  todayEl.textContent = fmt.format(new Date());
}

function getTimeZones() {
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      const zones = Intl.supportedValuesOf('timeZone');
      if (zones && zones.length) return zones;
    } catch {}
  }
  return FALLBACK_TIMEZONES;
}

function buildClockTzOptions() {
  clockTzEl.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = '';
  auto.textContent = 'Automatic (local time)';
  clockTzEl.appendChild(auto);

  const groups = {};
  getTimeZones().forEach((z) => {
    const idx = z.indexOf('/');
    if (idx === -1) {
      (groups['Other'] = groups['Other'] || []).push(z);
      return;
    }
    const region = z.slice(0, idx);
    (groups[region] = groups[region] || []).push(z);
  });

  Object.keys(groups)
    .sort((a, b) => (a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)))
    .forEach((region) => {
      const og = document.createElement('optgroup');
      og.label = region;
      groups[region].forEach((z) => {
        const opt = document.createElement('option');
        opt.value = z;
        opt.textContent = z.replace(/_/g, ' ');
        og.appendChild(opt);
      });
      clockTzEl.appendChild(og);
    });
}

function openClockEdit() {
  clockFormatEl.value = clockFormat;
  clockTzEl.value = clockTimezone;
  clockEdit.hidden = false;
}

function closeClockEdit() {
  clockEdit.hidden = true;
}

clockEl.addEventListener('click', () => {
  if (clockEdit.hidden) openClockEdit();
  else closeClockEdit();
});

clockFormatEl.addEventListener('change', () => {
  clockFormat = clockFormatEl.value;
  localStorage.setItem('solartab:clockformat', clockFormat);
  tickClock();
});

clockTzEl.addEventListener('change', () => {
  clockTimezone = clockTzEl.value;
  localStorage.setItem('solartab:timezone', clockTimezone);
  tickClock();
  renderDate();
});

document.addEventListener('click', (e) => {
  if (clockEdit.hidden) return;
  if (!clockEdit.contains(e.target) && !clockEl.contains(e.target)) closeClockEdit();
});

async function fetchApod(date) {
  currentDate = date;
  titleEl.textContent = 'loading...';
  explanationEl.textContent = '';
  mediaEl.innerHTML = '';
  dateInput.value = date;
  updateDateNav();

  try {
    const res = await fetch(`${API}?api_key=${API_KEY}&date=${date}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    const data = await res.json();
    currentData = data;
    renderApod(data);
  } catch (err) {
    titleEl.textContent = 'Could not load this picture';
    explanationEl.textContent = `${err.message}. Check your internet connection and API key.`;
  }
}

function renderApod(data) {
  titleEl.textContent = data.title;
  explanationEl.textContent = data.explanation;
  explainToggle.hidden = explanationEl.scrollHeight <= explanationEl.clientHeight;
  explainToggle.textContent = 'read more';

  if (data.media_type === 'image') {
    bg.style.backgroundImage = `url(${data.url})`;
    mediaEl.innerHTML = '';
  } else if (data.url.includes('youtube')) {
    bg.style.backgroundImage = '';
    mediaEl.innerHTML = `
      <iframe src="${data.url}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
  } else {
    bg.style.backgroundImage = '';
    mediaEl.innerHTML = `<video src="${data.url}" controls></video>`;
  }

  updateFavState();
}

function updateDateNav() {
  nextBtn.disabled = currentDate >= todayStr;
  prevBtn.disabled = currentDate <= MIN_DATE;
}

function shiftDate(days) {
  const d = new Date(`${currentDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function updateFavState() {
  favBtn.textContent = currentData && favorites[currentData.date] ? '★' : '☆';
}

favBtn.addEventListener('click', () => {
  if (!currentData) return;
  const key = currentData.date;
  if (favorites[key]) {
    delete favorites[key];
  } else {
    favorites[key] = {
      date: currentData.date,
      title: currentData.title,
      url: currentData.url,
      explanation: currentData.explanation,
      media_type: currentData.media_type
    };
  }
  localStorage.setItem('solartab:favorites', JSON.stringify(favorites));
  updateFavState();
});

prevBtn.addEventListener('click', () => fetchApod(shiftDate(-1)));
nextBtn.addEventListener('click', () => fetchApod(shiftDate(1)));
dateInput.addEventListener('change', () => {
  if (dateInput.value) fetchApod(dateInput.value);
});

explainToggle.addEventListener('click', () => {
  const open = explanationEl.classList.toggle('open');
  explainToggle.textContent = open ? 'read less' : 'read more';
  explainToggle.hidden = !open && explanationEl.scrollHeight <= explanationEl.clientHeight;
});

const apodCard = document.querySelector('.apod');

apodCard.addEventListener('click', (e) => {
  if (e.target.closest('button, input, a, .apod-media')) return;
  if (!bg.style.backgroundImage) return;
  bg.classList.toggle('front');
  bg.classList.toggle('hide-front', !bg.classList.contains('front'));
});

bg.addEventListener('animationend', (e) => {
  if (e.animationName === 'bg-to-back') bg.classList.remove('hide-front');
});

function getCustomEngines() {
  return JSON.parse(localStorage.getItem('solartab:engines') || '[]');
}

function saveCustomEngines(engines) {
  localStorage.setItem('solartab:engines', JSON.stringify(engines));
}

function getEngines() {
  return [...BUILTIN_ENGINES, ...getCustomEngines()];
}

function findEngine(id) {
  return getEngines().find((e) => e.id === id) || BUILTIN_ENGINES[0];
}

function domainFromTemplate(template) {
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(template) ? template : `https://${template}`;
  try {
    return new URL(withScheme).hostname;
  } catch {
    return '';
  }
}

function buildSearchUrl(template, q) {
  return template.replace(/%s/g, encodeURIComponent(q));
}

function searchUrl(q, engineId) {
  return buildSearchUrl(findEngine(engineId).url, q);
}

function luckyUrl(q, engineId) {
  const eng = findEngine(engineId);
  if (eng.lucky) return buildSearchUrl(eng.lucky, q);
  return searchUrl(q, engineId);
}

function getHistory() {
  return JSON.parse(localStorage.getItem('solartab:history') || '[]');
}

function addToHistory(q) {
  const history = getHistory().filter((s) => s.toLowerCase() !== q.toLowerCase());
  history.unshift(q);
  localStorage.setItem('solartab:history', JSON.stringify(history.slice(0, 10)));
  renderRecents();
}

function clearHistory() {
  localStorage.removeItem('solartab:history');
  renderRecents();
}

function renderRecents() {
  const history = getHistory().slice(0, 5);
  recentsList.innerHTML = '';
  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'recents-empty';
    li.textContent = 'No searches yet';
    recentsList.appendChild(li);
    return;
  }
  history.forEach((q) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = searchUrl(q, activeEngine);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = q;
    li.appendChild(a);
    recentsList.appendChild(li);
  });
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  addToHistory(q);
  window.open(searchUrl(q, activeEngine), '_blank', 'noopener');
});

luckyBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (!q) return;
  addToHistory(q);
  window.open(luckyUrl(q, activeEngine), '_blank', 'noopener');
});

let suggestIndex = -1;
let suggestTimer;

async function getSuggestions(q) {
  try {
    const res = await fetch(`https://ac.duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) return data.slice(0, 8);
    throw new Error('empty');
  } catch {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=8&namespace=0&format=json&origin=*`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data[1] || []).slice(0, 8);
    } catch {
      return [];
    }
  }
}

function highlightSuggestion() {
  const selectable = [...suggest.querySelectorAll('li')].filter(
    (li) => !li.classList.contains('suggest-label') && !li.classList.contains('suggest-clear')
  );
  suggestIndex = Math.max(-1, Math.min(suggestIndex, selectable.length - 1));
  suggest.querySelectorAll('li').forEach((li) => li.classList.remove('active'));
  if (suggestIndex >= 0) selectable[suggestIndex].classList.add('active');
}

function chooseSuggestion(s) {
  searchInput.value = s;
  suggest.hidden = true;
  searchForm.requestSubmit();
}

function makeSuggestionLi(text, extraClass) {
  const li = document.createElement('li');
  li.textContent = text;
  if (extraClass) li.className = extraClass;
  li.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (extraClass === 'suggest-clear') {
      clearHistory();
      renderSuggestions([]);
      return;
    }
    chooseSuggestion(text);
  });
  return li;
}

function renderSuggestions(items) {
  suggestIndex = -1;
  suggest.innerHTML = '';
  const q = searchInput.value.trim().toLowerCase();
  const history = getHistory().filter((s) => !q || s.toLowerCase().includes(q)).slice(0, 4);
  const ul = document.createElement('ul');

  if (history.length) {
    const head = document.createElement('li');
    head.className = 'suggest-label';
    head.textContent = 'Previous';
    ul.appendChild(head);
    history.forEach((s) => ul.appendChild(makeSuggestionLi(s, 'history')));
  }

  if (items.length) {
    if (history.length) {
      const head = document.createElement('li');
      head.className = 'suggest-label';
      head.textContent = 'Suggestions';
      ul.appendChild(head);
    }
    items.forEach((s) => ul.appendChild(makeSuggestionLi(s)));
  }

  if (history.length && !q) {
    ul.appendChild(makeSuggestionLi('Clear search history', 'suggest-clear'));
  }

  if (!history.length && !items.length) {
    suggest.hidden = true;
    return;
  }
  suggest.appendChild(ul);
  suggest.hidden = false;
}

searchInput.addEventListener('input', () => {
  clearTimeout(suggestTimer);
  const q = searchInput.value.trim();
  if (!q) {
    renderSuggestions([]);
    return;
  }
  suggestTimer = setTimeout(async () => {
    renderSuggestions(await getSuggestions(q));
  }, 220);
});

searchInput.addEventListener('focus', () => {
  if (!searchInput.value.trim()) {
    clearTimeout(suggestTimer);
    renderSuggestions([]);
  }
});

searchInput.addEventListener('keydown', (e) => {
  if (suggest.hidden) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const selectable = [...suggest.querySelectorAll('li')].filter(
      (li) => !li.classList.contains('suggest-label') && !li.classList.contains('suggest-clear')
    );
    suggestIndex = Math.min(suggestIndex + 1, selectable.length - 1);
    highlightSuggestion();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    suggestIndex = Math.max(suggestIndex - 1, -1);
    highlightSuggestion();
  } else if (e.key === 'Enter') {
    if (suggestIndex >= 0) {
      const active = suggest.querySelector('li.active');
      if (active) {
        e.preventDefault();
        chooseSuggestion(active.textContent);
      }
    }
  } else if (e.key === 'Escape') {
    suggest.hidden = true;
  }
});

document.addEventListener('click', (e) => {
  if (!searchWrap.contains(e.target)) suggest.hidden = true;
});

const BUILTIN_ENGINES = [
  { id: 'google', name: 'Google', domain: 'google.com', url: 'https://www.google.com/search?q=%s', lucky: 'https://www.google.com/search?q=%s&btnI=1' },
  { id: 'bing', name: 'Bing', domain: 'bing.com', icon: 'https://www.bing.com/favicon.ico', url: 'https://www.bing.com/search?q=%s' },
  { id: 'duckduckgo', name: 'DuckDuckGo', domain: 'duckduckgo.com', url: 'https://duckduckgo.com/?q=%s', lucky: 'https://duckduckgo.com/?q=!ducky+%s' }
];

function setEngineIcon(el, eng) {
  const url = eng.icon || faviconFor(`https://${eng.domain}`);
  el.innerHTML = '';
  if (!url) {
    el.textContent = eng.name.charAt(0).toUpperCase();
    return;
  }
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.src = url;
  img.addEventListener('error', () => {
    img.remove();
    el.textContent = eng.name.charAt(0).toUpperCase();
  });
  el.appendChild(img);
}

function markEngineActive() {
  engineMenu.querySelectorAll('li[data-engine]').forEach((li) => {
    li.classList.toggle('active', li.dataset.engine === activeEngine);
  });
}

function setEngine(id, save) {
  const eng = findEngine(id);
  activeEngine = eng.id;
  engineBtn.setAttribute('aria-label', `Search engine: ${eng.name}`);
  setEngineIcon(engineIcon, eng);
  markEngineActive();
  if (save) localStorage.setItem('solartab:engine', eng.id);
  renderRecents();
}

function buildEngineMenu() {
  engineMenu.innerHTML = '';
  const ul = document.createElement('ul');
  getEngines().forEach((eng) => {
    const li = document.createElement('li');
    li.dataset.engine = eng.id;
    li.setAttribute('role', 'option');
    const icon = document.createElement('span');
    icon.className = 'engine-icon';
    setEngineIcon(icon, eng);
    const name = document.createElement('span');
    name.textContent = eng.name;
    li.append(icon, name);
    li.addEventListener('click', () => {
      setEngine(eng.id, true);
      closeEngineMenu();
    });
    if (eng.custom) {
      const del = document.createElement('button');
      del.className = 'engine-remove';
      del.type = 'button';
      del.title = `Remove ${eng.name}`;
      del.setAttribute('aria-label', `Remove ${eng.name}`);
      del.textContent = '×';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCustomEngine(eng.id);
        if (activeEngine === eng.id) setEngine(getEngines()[0].id, true);
        buildEngineMenu();
        markEngineActive();
      });
      li.appendChild(del);
    }
    ul.appendChild(li);
  });

  const divider = document.createElement('li');
  divider.className = 'engine-divider';
  divider.setAttribute('role', 'separator');
  ul.appendChild(divider);

  const add = document.createElement('li');
  add.className = 'engine-add';
  add.setAttribute('role', 'option');
  const addIcon = document.createElement('span');
  addIcon.className = 'engine-icon';
  addIcon.textContent = '+';
  const addName = document.createElement('span');
  addName.textContent = 'Add custom engine';
  add.append(addIcon, addName);
  add.addEventListener('click', () => openEngineModal());
  ul.appendChild(add);

  engineMenu.appendChild(ul);
}

function openEngineMenu() {
  buildEngineMenu();
  markEngineActive();
  engineMenu.hidden = false;
  engineBtn.setAttribute('aria-expanded', 'true');
}

function closeEngineMenu() {
  engineMenu.hidden = true;
  engineBtn.setAttribute('aria-expanded', 'false');
}

engineBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeSettings();
  if (engineMenu.hidden) openEngineMenu();
  else closeEngineMenu();
});

document.addEventListener('click', (e) => {
  if (!engineMenu.contains(e.target) && !engineBtn.contains(e.target)) closeEngineMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeEngineMenu();
    engineModal.hidden = true;
    closeClockEdit();
    closeSettings();
  }
});

function removeCustomEngine(id) {
  saveCustomEngines(getCustomEngines().filter((e) => e.id !== id));
}

function openEngineModal() {
  closeEngineMenu();
  engineName.value = '';
  engineUrl.value = '';
  engineUrl.setCustomValidity('');
  engineModal.hidden = false;
  engineName.focus();
}

function closeEngineModal() {
  engineModal.hidden = true;
}

engineUrl.addEventListener('input', () => {
  engineUrl.setCustomValidity('');
});

engineForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = engineName.value.trim();
  const url = engineUrl.value.trim();
  if (!name || !url) return;
  if (!url.includes('%s')) {
    engineUrl.setCustomValidity('The URL must contain %s where the search query is inserted.');
    engineUrl.reportValidity();
    return;
  }
  const custom = getCustomEngines();
  const engine = {
    id: `custom-${Date.now()}`,
    name,
    url,
    domain: domainFromTemplate(url),
    custom: true
  };
  custom.push(engine);
  saveCustomEngines(custom);
  closeEngineModal();
  setEngine(engine.id, true);
});

engineCancel.addEventListener('click', closeEngineModal);

engineModal.addEventListener('click', (e) => {
  if (e.target === engineModal) closeEngineModal();
});

buildEngineMenu();
setEngine(activeEngine, false);

function faviconFor(url) {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return null;
  }
}

function renderLinks() {
  linksEl.innerHTML = '';
  links.forEach((link, i) => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.classList.add('link');
    a.title = link.name;
    a.innerHTML = `
      <span class="link-icon"></span>
      <span class="link-name">${link.name}</span>
      <button class="link-remove" data-i="${i}" title="Remove ${link.name}" aria-label="Remove ${link.name}">×</button>
    `;
    const iconEl = a.querySelector('.link-icon');
    const letter = document.createElement('span');
    letter.className = 'link-letter';
    letter.textContent = link.name.charAt(0).toUpperCase();
    const favicon = faviconFor(link.url);
    if (favicon) {
      const img = document.createElement('img');
      img.className = 'link-img';
      img.alt = '';
      img.loading = 'lazy';
      img.src = favicon;
      img.addEventListener('error', () => {
        img.remove();
        letter.classList.add('show');
      });
      iconEl.append(img, letter);
    } else {
      letter.classList.add('show');
      iconEl.append(letter);
    }
    a.addEventListener('click', (e) => {
      if (e.target.closest('.link-remove')) e.preventDefault();
    });
    linksEl.appendChild(a);
  });

  const add = document.createElement('button');
  add.className = 'link-add';
  add.textContent = '+';
  add.title = 'Add a quick link';
  add.addEventListener('click', () => {
    addName.value = '';
    addUrl.value = '';
    modal.hidden = false;
    addName.focus();
  });
  linksEl.appendChild(add);
}

linksEl.addEventListener('click', (e) => {
  const remove = e.target.closest('.link-remove');
  if (!remove) return;
  links = links.filter((_, i) => i !== Number(remove.dataset.i));
  localStorage.setItem('solartab:links', JSON.stringify(links));
  renderLinks();
});

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = addName.value.trim();
  const url = addUrl.value.trim();
  if (!name || !url) return;
  links.push({ name, url });
  localStorage.setItem('solartab:links', JSON.stringify(links));
  modal.hidden = true;
  renderLinks();
});

addCancel.addEventListener('click', () => {
  modal.hidden = true;
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.hidden = true;
});

function weatherLabel(code) {
  return (WMO[code] || ['Unknown', '🌡️'])[0];
}

function weatherEmoji(code) {
  return (WMO[code] || ['Unknown', '🌡️'])[1];
}

function saveWeather(city, lat, lon) {
  localStorage.setItem('solartab:weather', JSON.stringify({ city, lat, lon }));
}

function setLocationNone() {
  weatherCity.textContent = 'Set location';
  weatherTemp.textContent = '--°';
  weatherIcon.textContent = '';
  weatherDesc.textContent = 'Click above to set your location';
  weatherMeta.textContent = '';
}

function closeWeatherEdit() {
  weatherEdit.hidden = true;
}

async function renderWeather(city, lat, lon) {
  weatherCity.textContent = city;
  weatherDesc.textContent = 'Loading...';
  weatherMeta.textContent = '';
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const c = data.current;
    const d = data.daily;
    weatherTemp.textContent = `${Math.round(c.temperature_2m)}°`;
    weatherIcon.textContent = weatherEmoji(c.weather_code);
    weatherDesc.textContent = weatherLabel(c.weather_code);
    weatherMeta.textContent = [
      `H ${Math.round(d.temperature_2m_max[0])}°  L ${Math.round(d.temperature_2m_min[0])}°`,
      `${Math.round(c.relative_humidity_2m)}%`,
      `${Math.round(c.wind_speed_10m)} km/h`
    ].join('  ·  ');
  } catch (err) {
    weatherTemp.textContent = '--°';
    weatherIcon.textContent = '';
    weatherDesc.textContent = 'Weather unavailable';
    weatherMeta.textContent = '';
  }
}

async function initWeatherFromIp() {
  try {
    const res = await fetch('https://ipwho.is/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const g = await res.json();
    if (g.success !== false && typeof g.latitude === 'number' && typeof g.longitude === 'number') {
      return { city: g.city || g.country || 'Current location', lat: g.latitude, lon: g.longitude };
    }
    throw new Error('no location');
  } catch {
    return null;
  }
}

function initWeather() {
  const saved = JSON.parse(localStorage.getItem('solartab:weather') || 'null');
  if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number') {
    renderWeather(saved.city || 'Saved location', saved.lat, saved.lon);
    return;
  }

  let placed = false;
  const place = (city, lat, lon) => {
    if (placed) return;
    placed = true;
    saveWeather(city, lat, lon);
    renderWeather(city, lat, lon);
  };

  const placeFromIp = async () => {
    const loc = await initWeatherFromIp();
    if (loc) place(loc.city, loc.lat, loc.lon);
    else setLocationNone();
  };

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let city = 'Current location';
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (r.ok) {
            const g = await r.json();
            city = g.city || g.locality || g.principalSubdivision || 'Current location';
          }
        } catch {}
        place(city, lat, lon);
      },
      placeFromIp
    );
    setTimeout(placeFromIp, 5000);
  } else {
    placeFromIp();
  }
}

weatherCity.addEventListener('click', () => {
  weatherEdit.hidden = false;
  weatherInput.value = '';
  weatherInput.focus();
});

weatherEdit.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = weatherInput.value.trim();
  if (!q) return closeWeatherEdit();
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const g = await res.json();
    const hit = g.results && g.results[0];
    if (!hit) {
      weatherDesc.textContent = 'City not found';
      return;
    }
    const city = [hit.name, hit.admin1].filter(Boolean).join(', ');
    saveWeather(city, hit.latitude, hit.longitude);
    closeWeatherEdit();
    renderWeather(city, hit.latitude, hit.longitude);
  } catch {
    weatherDesc.textContent = 'Search failed';
  }
});

weatherInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWeatherEdit();
});

document.addEventListener('click', (e) => {
  if (!weather.contains(e.target)) closeWeatherEdit();
});

const WIDGET_DEFS = [
  { id: 'calendar', name: 'Calendar', desc: 'Monthly calendar' },
  { id: 'weather', name: 'Weather', desc: 'Local forecast' },
  { id: 'todo', name: 'Todo List', desc: 'Tasks & reminders' },
  { id: 'recents', name: 'Recent Searches', desc: 'Your last searches' },
  { id: 'iss', name: 'ISS Tracker', desc: 'Live station position & moon phase' },
  { id: 'news', name: 'Space News', desc: 'Latest headlines' }
];

function getWidgetsEnabled() {
  const stored = JSON.parse(localStorage.getItem('solartab:widgets') || 'null');
  if (Array.isArray(stored)) return stored;
  return WIDGET_DEFS.map((w) => w.id);
}

function saveWidgets(enabled) {
  localStorage.setItem('solartab:widgets', JSON.stringify(enabled));
}

function moveWidgetBefore(id, beforeId) {
  const enabled = getWidgetsEnabled();
  const from = enabled.indexOf(id);
  const to = enabled.indexOf(beforeId);
  if (from === -1 || to === -1 || from === to) return;
  enabled.splice(from, 1);
  enabled.splice(enabled.indexOf(beforeId), 0, id);
  saveWidgets(enabled);
  applyWidgets();
}

function makeReorderable(el, grip) {
  let overDepth = 0;
  grip.draggable = true;
  grip.addEventListener('dragstart', (e) => {
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', el.dataset.widget);
  });
  grip.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('[data-widget].drag-over').forEach((w) => w.classList.remove('drag-over'));
  });

  el.addEventListener('dragenter', (e) => {
    e.preventDefault();
    overDepth++;
    el.classList.add('drag-over');
  });
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });
  el.addEventListener('dragleave', () => {
    overDepth--;
    if (overDepth <= 0) {
      overDepth = 0;
      el.classList.remove('drag-over');
    }
  });
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    overDepth = 0;
    el.classList.remove('drag-over');
    const id = e.dataTransfer.getData('text/plain');
    if (!id || id === el.dataset.widget) return;
    const fromEl = document.querySelector(`[data-widget="${id}"]`);
    if (fromEl && fromEl.parentElement !== el.parentElement) return;
    moveWidgetBefore(id, el.dataset.widget);
  });
}

function applyWidgets() {
  const enabled = getWidgetsEnabled();
  let overlaysVisible = false;
  [document.querySelector('.widgets'), document.querySelector('.overlays')].forEach((container) => {
    if (!container) return;
    const anchor = container.querySelector(':scope > .widgets-actions');
    [...container.querySelectorAll(':scope > [data-widget]')]
      .sort((a, b) => enabled.indexOf(a.dataset.widget) - enabled.indexOf(b.dataset.widget))
      .forEach((el) => {
        if (anchor) container.insertBefore(el, anchor);
        else container.appendChild(el);
      });
  });

  document.querySelectorAll('[data-widget]').forEach((el) => {
    const on = enabled.includes(el.dataset.widget);
    el.hidden = !on;
    if (el.closest('.overlays') && on) overlaysVisible = true;
    if (!on) return;

    if (!el.querySelector('.widget-x')) {
      const x = document.createElement('button');
      x.className = 'widget-x';
      x.type = 'button';
      x.textContent = '×';
      x.title = 'Remove widget';
      x.setAttribute('aria-label', `Remove ${el.dataset.widget} widget`);
      x.addEventListener('click', () => removeWidget(el.dataset.widget));
      el.prepend(x);
    }

    if (!el.querySelector('.widget-grip')) {
      const grip = document.createElement('button');
      grip.className = 'widget-grip';
      grip.type = 'button';
      grip.title = 'Drag to reorder';
      grip.setAttribute('aria-label', 'Drag to reorder');
      el.prepend(grip);
      makeReorderable(el, grip);
    }
  });
  overlays.hidden = !overlaysVisible;
}

function removeWidget(id) {
  const cur = getWidgetsEnabled().filter((w) => w !== id);
  saveWidgets(cur);
  applyWidgets();
}

let editMode = false;

function setEditMode(on) {
  editMode = on;
  document.body.classList.toggle('widgets-editing', on);
  widgetEditBtn.classList.toggle('active', on);
  widgetEditBtn.title = on ? 'Done editing' : 'Edit widgets';
}

function openWidgetModal(mode) {
  const enabled = getWidgetsEnabled();
  const isAdd = mode === 'add';
  widgetModalTitle.textContent = isAdd ? 'Add widgets' : 'Edit widgets';
  widgetPicker.innerHTML = '';
  WIDGET_DEFS.forEach((w) => {
    const on = enabled.includes(w.id);
    if (isAdd && on) return;
    if (!isAdd && !on) return;
    const row = document.createElement('div');
    row.className = 'widget-pick';
    const info = document.createElement('div');
    info.className = 'widget-pick-info';
    const name = document.createElement('span');
    name.className = 'widget-pick-name';
    name.textContent = w.name;
    const desc = document.createElement('span');
    desc.className = 'widget-pick-desc';
    desc.textContent = w.desc;
    info.append(name, desc);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = isAdd ? 'Add' : 'Remove';
    btn.className = isAdd ? 'pick-add' : 'pick-remove';
    btn.addEventListener('click', () => {
      const cur = getWidgetsEnabled();
      if (isAdd) cur.push(w.id);
      else cur.splice(cur.indexOf(w.id), 1);
      saveWidgets(cur);
      applyWidgets();
      openWidgetModal(mode);
    });
    row.append(info, btn);
    widgetPicker.appendChild(row);
  });
  if (widgetPicker.children.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'widget-pick-empty';
    empty.textContent = isAdd ? 'All widgets are already on' : 'No widgets to remove';
    widgetPicker.appendChild(empty);
  }
  widgetModal.hidden = false;
}

widgetAddBtn.addEventListener('click', () => openWidgetModal('add'));
widgetEditBtn.addEventListener('click', () => setEditMode(!editMode));
widgetModalClose.addEventListener('click', () => {
  widgetModal.hidden = true;
});
widgetModal.addEventListener('click', (e) => {
  if (e.target === widgetModal) widgetModal.hidden = true;
});

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CAL_MONTHS = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
let calYear;
let calMonth;

function renderCalendar() {
  const first = new Date(calYear, calMonth, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  calTitle.textContent = CAL_MONTHS.format(first);

  calWeekdays.innerHTML = '';
  WEEKDAYS.forEach((d) => {
    const el = document.createElement('span');
    el.textContent = d;
    calWeekdays.appendChild(el);
  });

  calGrid.innerHTML = '';
  for (let i = 0; i < startDow; i++) {
    calGrid.appendChild(document.createElement('span'));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('span');
    el.textContent = d;
    if (calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate()) {
      el.classList.add('today');
    }
    calGrid.appendChild(el);
  }
}

calPrev.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }
  renderCalendar();
});

calNext.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  renderCalendar();
});

function initCalendar() {
  const today = new Date();
  calYear = today.getFullYear();
  calMonth = today.getMonth();
  renderCalendar();
}

let todos = JSON.parse(localStorage.getItem('solartab:todos') || '[]');

function saveTodos() {
  localStorage.setItem('solartab:todos', JSON.stringify(todos));
}

const DAYS = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0
};

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDue(input) {
  const lower = input.toLowerCase();
  const now = new Date();
  let dueDate = null;
  let rawLabel = '';
  const raws = [];

  let m = lower.match(/\bin\s+(\d+)\s+(day|week)s?\b/);
  if (m) {
    const n = parseInt(m[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() + (m[2] === 'week' ? n * 7 : n));
    dueDate = d;
    rawLabel = `In ${n} ${m[2]}${n > 1 ? 's' : ''}`;
    raws.push(m[0]);
  } else if (/\btoday\b/.test(lower)) {
    dueDate = new Date(now);
    rawLabel = 'Today';
    raws.push('today');
  } else if (/\btomorrow\b/.test(lower)) {
    dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 1);
    rawLabel = 'Tomorrow';
    raws.push('tomorrow');
  } else if (/\bnext week\b/.test(lower)) {
    dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);
    rawLabel = 'Next week';
    raws.push('next week');
  } else if (/\bthis week\b/.test(lower)) {
    dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + (6 - now.getDay()));
    rawLabel = 'This week';
    raws.push('this week');
  } else if (/\bnext month\b/.test(lower)) {
    dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + 1);
    rawLabel = 'Next month';
    raws.push('next month');
  } else {
    for (const [day, idx] of Object.entries(DAYS)) {
      if (new RegExp(`\\b${day}\\b`).test(lower)) {
        let offset = (idx - now.getDay() + 7) % 7;
        if (offset === 0) offset = 7;
        dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + offset);
        rawLabel = day.charAt(0).toUpperCase() + day.slice(1);
        raws.push(day);
        break;
      }
    }
  }

  if (!dueDate) return null;

  const tm = lower.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  let label;
  if (tm) {
    let h = parseInt(tm[1], 10);
    const min = parseInt(tm[2] || '0', 10);
    if (tm[3] === 'pm' && h < 12) h += 12;
    if (tm[3] === 'am' && h === 12) h = 0;
    dueDate.setHours(h, min, 0, 0);
    if (dueDate < now) dueDate.setDate(dueDate.getDate() + 1);
    raws.push(tm[0]);
    label = dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (rawLabel) label = `${label} · ${rawLabel}`;
  } else {
    dueDate.setHours(23, 59, 59, 0);
    label = rawLabel;
  }

  return { label, ts: dueDate, raws };
}

function parseTodo(input) {
  const due = parseDue(input);
  let text = input;
  if (due) {
    due.raws.forEach((raw) => {
      text = text.replace(new RegExp(escapeRe(raw), 'i'), ' ');
    });
    text = text.replace(/\s+/g, ' ').trim() || input;
  }
  return {
    text,
    due: due ? { label: due.label, ts: due.ts.toISOString() } : null
  };
}

function renderTodos() {
  todoList.innerHTML = '';
  if (todos.length === 0) {
    const li = document.createElement('li');
    li.className = 'todo-empty';
    li.textContent = 'No tasks yet';
    todoList.appendChild(li);
    return;
  }
  todos.forEach((todo, i) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!todo.done;
    cb.setAttribute('aria-label', `Mark "${todo.text}" done`);
    cb.addEventListener('change', () => {
      todos[i].done = cb.checked;
      saveTodos();
      renderTodos();
    });

    const label = document.createElement('span');
    label.className = 'todo-label';
    label.textContent = todo.text;

    let chip = null;
    if (todo.due) {
      const dueStr = toDateStr(new Date(todo.due.ts));
      chip = document.createElement('span');
      chip.className = 'todo-due';
      if (dueStr === todayStr) chip.classList.add('due-today');
      else if (dueStr < todayStr) chip.classList.add('due-overdue');
      chip.textContent = todo.due.label;
    }

    const del = document.createElement('button');
    del.className = 'todo-del';
    del.type = 'button';
    del.textContent = '×';
    del.title = 'Delete task';
    del.setAttribute('aria-label', `Delete "${todo.text}"`);
    del.addEventListener('click', () => {
      todos.splice(i, 1);
      saveTodos();
      renderTodos();
    });

    li.append(cb, label);
    if (chip) li.appendChild(chip);
    li.appendChild(del);
    todoList.appendChild(li);
  });
}

todoAdd.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  const parsed = parseTodo(text);
  todos.push({ text: parsed.text, done: false, due: parsed.due });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
});

async function fetchIss() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const lat = Number(data.latitude).toFixed(2);
    const lon = Number(data.longitude).toFixed(2);
    const vel = Math.round(data.velocity);
    let place = 'an unknown point';
    try {
      const g = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${data.latitude}&longitude=${data.longitude}&localityLanguage=en`
      );
      if (g.ok) {
        const gj = await g.json();
        if (gj.isOcean && gj.ocean) {
          place = gj.ocean;
        } else {
          place = gj.city || gj.locality || gj.principalSubdivision || gj.countryName || place;
        }
      }
    } catch {}
    issLoc.textContent = `Over ${place}`;
    issCoords.textContent = `${lat}° ${Number(lat) >= 0 ? 'N' : 'S'}, ${lon}° ${Number(lon) >= 0 ? 'E' : 'W'} · ${vel} km/h`;
  } catch {
    issLoc.textContent = 'ISS tracking unavailable';
    issCoords.textContent = '';
  }
}

function moonPhase(d) {
  const synodic = 29.53058867;
  const epoch = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((d.getTime() - epoch) / 86400000) % synodic;
  const illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / synodic)) / 2) * 100);
  const phases = [
    ['New Moon', '🌑'],
    ['Waxing Crescent', '🌒'],
    ['First Quarter', '🌓'],
    ['Waxing Gibbous', '🌔'],
    ['Full Moon', '🌕'],
    ['Waning Gibbous', '🌖'],
    ['Last Quarter', '🌗'],
    ['Waning Crescent', '🌘']
  ];
  const idx = Math.round((age / synodic) * 8) % 8;
  return { name: phases[idx][0], emoji: phases[idx][1], illum };
}

async function fetchNews() {
  try {
    const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=5&ordering=-published_at');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data.results || [];
    newsList.innerHTML = '';
    if (items.length === 0) {
      const li = document.createElement('li');
      li.className = 'news-empty';
      li.textContent = 'No articles right now';
      newsList.appendChild(li);
      return;
    }
    items.forEach((a) => {
      const li = document.createElement('li');
      li.className = 'news-item';
      const link = document.createElement('a');
      link.href = a.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = a.title;
      li.appendChild(link);
      newsList.appendChild(li);
    });
  } catch {
    newsList.innerHTML = '<li class="news-empty">News unavailable</li>';
  }
}

tickClock();
setInterval(tickClock, 1000);
renderDate();
dateInput.max = todayStr;
renderLinks();
initCalendar();
initWeather();
renderTodos();
renderRecents();
applyWidgets();
buildClockTzOptions();
const moon = moonPhase(new Date());
moonEl.textContent = `${moon.emoji} ${moon.name} · ${moon.illum}% illuminated`;
fetchIss();
setInterval(fetchIss, 60000);
fetchNews();
setInterval(fetchNews, 900000);
fetchApod(todayStr);
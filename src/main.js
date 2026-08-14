import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const API = 'https://api.nasa.gov/planetary/apod';
const MIN_DATE = '1995-06-16';

const todayEl = document.querySelector('#today');
const clockEl = document.querySelector('#clock');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchEngine = document.querySelector('#search-engine');
const luckyBtn = document.querySelector('#lucky-btn');
const searchWrap = document.querySelector('.search-wrap');
const suggest = document.querySelector('#suggest');
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
const modal = document.querySelector('#add-modal');
const addForm = document.querySelector('#add-form');
const addName = document.querySelector('#add-name');
const addUrl = document.querySelector('#add-url');
const addCancel = document.querySelector('#add-cancel');

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

const dateDisplay = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

function pad(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tickClock() {
  const d = new Date();
  clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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

function searchUrl(q, engine) {
  const urls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  };
  return urls[engine];
}

function luckyUrl(q, engine) {
  if (engine === 'google') return `https://www.google.com/search?q=${encodeURIComponent(q)}&btnI=1`;
  if (engine === 'duckduckgo') return `https://duckduckgo.com/?q=!ducky+${encodeURIComponent(q)}`;
  return searchUrl(q, engine);
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
    a.href = searchUrl(q, searchEngine.value);
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
  window.open(searchUrl(q, searchEngine.value), '_blank', 'noopener');
});

luckyBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (!q) return;
  addToHistory(q);
  window.open(luckyUrl(q, searchEngine.value), '_blank', 'noopener');
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

searchEngine.value = localStorage.getItem('solartab:engine') || 'google';
searchEngine.addEventListener('change', () => {
  localStorage.setItem('solartab:engine', searchEngine.value);
});

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

function initWeather() {
  const saved = JSON.parse(localStorage.getItem('solartab:weather') || 'null');
  if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number') {
    renderWeather(saved.city || 'Saved location', saved.lat, saved.lon);
    return;
  }
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
        saveWeather(city, lat, lon);
        renderWeather(city, lat, lon);
      },
      setLocationNone
    );
  } else {
    setLocationNone();
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

    li.append(cb, label, del);
    todoList.appendChild(li);
  });
}

todoAdd.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
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
todayEl.textContent = dateDisplay.format(now);
dateInput.max = todayStr;
renderLinks();
initCalendar();
initWeather();
renderTodos();
renderRecents();
const moon = moonPhase(new Date());
moonEl.textContent = `${moon.emoji} ${moon.name} · ${moon.illum}% illuminated`;
fetchIss();
setInterval(fetchIss, 60000);
fetchNews();
setInterval(fetchNews, 900000);
fetchApod(todayStr);
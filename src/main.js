import './style.css';

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const API = 'https://api.nasa.gov/planetary/apod';
const MIN_DATE = '1995-06-16';

const todayEl = document.querySelector('#today');
const clockEl = document.querySelector('#clock');
const greetingEl = document.querySelector('#greeting');
const dateEl = document.querySelector('#date');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchEngine = document.querySelector('#search-engine');
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
const modal = document.querySelector('#add-modal');
const addForm = document.querySelector('#add-form');
const addName = document.querySelector('#add-name');
const addUrl = document.querySelector('#add-url');
const addCancel = document.querySelector('#add-cancel');

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

function setGreeting() {
  const h = new Date().getHours();
  let msg = 'Good night';
  if (h >= 5 && h < 12) msg = 'Good morning';
  else if (h >= 12 && h < 17) msg = 'Good afternoon';
  else if (h >= 17 && h < 21) msg = 'Good evening';
  greetingEl.textContent = `${msg}, explorer`;
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

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  const urls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  };
  window.open(urls[searchEngine.value], '_blank', 'noopener');
});

searchEngine.value = localStorage.getItem('solartab:engine') || 'google';
searchEngine.addEventListener('change', () => {
  localStorage.setItem('solartab:engine', searchEngine.value);
});

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
      <span class="link-icon">${link.name.charAt(0).toUpperCase()}</span>
      <span class="link-name">${link.name}</span>
      <button class="link-remove" data-i="${i}" title="Remove ${link.name}" aria-label="Remove ${link.name}">×</button>
    `;
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

tickClock();
setInterval(tickClock, 1000);
setGreeting();
todayEl.textContent = dateDisplay.format(now);
dateEl.textContent = dateDisplay.format(now);
dateInput.max = todayStr;
renderLinks();
fetchApod(todayStr);
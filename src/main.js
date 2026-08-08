import './style.css';

const apiKeyStatus = import.meta.env.VITE_NASA_API_KEY ? 'Configured' : 'Missing';

document.querySelector('#app').innerHTML = `
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">SolarTab</p>
      <h1>NASA-ready Vite starter</h1>
      <p class="lead">
        The scaffold has been cleaned out and the app is ready for your NASA API work.
      </p>
      <div class="status-card" aria-label="API key status">
        <span>NASA API key</span>
        <strong>${apiKeyStatus}</strong>
      </div>
      <p class="hint">
        Restart the dev server any time you change <code>.env</code>.
      </p>
    </section>
  </main>
`;
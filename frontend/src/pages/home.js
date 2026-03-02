import { getTemples, getCategories } from '../api.js';
import { renderTempleCard } from '../components/templeCard.js';

const categoryMeta = {
  'Jyotirlinga': { icon: '🔱', desc: '12 Sacred Shiva Shrines', gradient: 'linear-gradient(135deg, #FF6B00, #FF9A3C, #C75500)' },
  'Shakti Peeth': { icon: '🔴', desc: '51 Sacred Goddess Sites', gradient: 'linear-gradient(135deg, #C0354B, #FF758C, #8B1A2E)' },
  'Char Dham': { icon: '🏔️', desc: '4 Sacred Pilgrimages', gradient: 'linear-gradient(135deg, #2E8B57, #56B870, #1B5E38)' },
  'Divya Desam': { icon: '🌟', desc: '108 Vishnu Temples', gradient: 'linear-gradient(135deg, #BF9B30, #FFD700, #A07850)' },
  'Major Shrine': { icon: '🛕', desc: 'Iconic Holy Places', gradient: 'linear-gradient(135deg, #A07850, #D4A574, #6B4E2E)' },
  'Sikh Shrine': { icon: '☬', desc: 'Sacred Gurudwaras', gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #CC8400)' },
  'Sai Baba': { icon: '🙏', desc: 'Sai Baba Temples', gradient: 'linear-gradient(135deg, #E0E0E0, #BDBDBD, #9E9E9E)' },
  'Buddhist Shrine': { icon: '☸️', desc: 'Buddhist Holy Sites', gradient: 'linear-gradient(135deg, #FFD700, #FFC107, #FF9800)' },
  'Pancha Bhoota': { icon: '🔥', desc: '5 Element Temples', gradient: 'linear-gradient(135deg, #FF4136, #FF6B6B, #CC3333)' },
  'UNESCO Heritage': { icon: '🏛️', desc: 'World Heritage Sites', gradient: 'linear-gradient(135deg, #4ECDC4, #44A08D, #2E8B7A)' },
  'Modern Temple': { icon: '✨', desc: 'Modern Wonders', gradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD, #7C5CD4)' }
};

// Search history helpers
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('dd_search_history') || '[]'); } catch { return []; }
}
function addToSearchHistory(term) {
  if (!term.trim()) return;
  let h = getSearchHistory().filter(x => x !== term);
  h.unshift(term);
  localStorage.setItem('dd_search_history', JSON.stringify(h.slice(0, 8)));
}
function clearSearchHistory() { localStorage.removeItem('dd_search_history'); }

function renderCategoryCard(cat) {
  const m = categoryMeta[cat] || { icon: '🛕', desc: 'Sacred Temples', gradient: 'linear-gradient(135deg, #FF6B00, #FFD700)' };
  return `<a href="#/search?category=${encodeURIComponent(cat)}" class="cat-showcase-card" style="background:${m.gradient};">
    <div class="cat-showcase-overlay">
      <div class="cat-showcase-icon">${m.icon}</div>
      <div class="cat-showcase-name">${cat}</div>
      <div class="cat-showcase-desc">${m.desc}</div>
    </div>
    <div class="cat-showcase-badge">Explore →</div>
  </a>`;
}

export async function renderHome() {
  let featuredTemples = [];
  let categories = [];
  try {
    const [data, catData] = await Promise.all([getTemples(), getCategories()]);
    featuredTemples = data.temples.slice(0, 6);
    categories = catData.categories || [];
  } catch (e) { console.warn('Fetch error:', e); }

  const history = getSearchHistory();

  return `
    <section class="hero" style="min-height:85vh;">
      <div class="hero-bg"><div></div></div>
      <div class="hero-content">
        <div class="hero-om animate-fade-in" style="font-size:80px;filter:drop-shadow(0 0 40px rgba(255,107,0,0.4));">🛕</div>
        <h1 class="hero-title animate-fade-in-up delay-1" style="font-size:clamp(36px,6vw,64px);line-height:1.15;">
          Your Sacred Journey<br><span style="background:var(--gradient-saffron);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Starts Here</span>
        </h1>
        <p class="hero-subtitle animate-fade-in-up delay-2" style="font-size:clamp(16px,2vw,20px);max-width:640px;margin:0 auto;">
          Explore <strong style="color:var(--gold);">39+</strong> famous temples across India — Live rush status, booking guides, dharamshalas & nearby places.
        </p>
        <div class="hero-search animate-fade-in-up delay-3" style="max-width:560px;margin:32px auto 0;position:relative;">
          <input type="text" id="heroSearch" placeholder="Search temples... Tirupati, Kedarnath, Shirdi..." autocomplete="off" style="padding-right:100px;" />
          <div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:8px;">
            <button id="micBtnHome" style="width:40px;height:40px;border-radius:50%;background:#F3F4F6;border:1px solid rgba(0,0,0,0.1);color:#FF6B00;font-size:18px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;" title="Search by Voice">🎤</button>
            <button id="heroSearchBtn" style="width:40px;height:40px;border-radius:50%;background:var(--gradient-saffron);border:none;color:#fff;font-size:18px;cursor:pointer;box-shadow:0 4px 15px rgba(255,107,0,0.3);transition:all 0.2s;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🔍</button>
          </div>
        </div>
        ${history.length > 0 ? `
        <div class="animate-fade-in-up delay-4" style="margin-top:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;">
          <span style="font-size:12px;color:var(--text-muted);">Recent:</span>
          ${history.slice(0, 5).map(h => `<a href="#/search?q=${encodeURIComponent(h)}" class="search-history-chip">${h}</a>`).join('')}
          <span id="clearHistoryBtn" class="search-history-clear">Clear</span>
        </div>` : ''}
        <div class="hero-stats animate-fade-in-up delay-5">
          <div class="hero-stat"><div class="hero-stat-number">39+</div><div class="hero-stat-label">Sacred Temples</div></div>
          <div class="hero-stat"><div class="hero-stat-number">${categories.length}</div><div class="hero-stat-label">Categories</div></div>
          <div class="hero-stat"><div class="hero-stat-number">24/7</div><div class="hero-stat-label">Live Status</div></div>
          <div class="hero-stat"><div class="hero-stat-number">150+</div><div class="hero-stat-label">Booking Links</div></div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);padding:60px 0;">
      <div class="container">
        <h2 class="section-title" style="text-align:center;font-size:clamp(28px,4vw,42px);">
          🙏 <span style="background:var(--gradient-sacred);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Browse by Pilgrimage Circuit</span>
        </h2>
        <p class="section-subtitle" style="text-align:center;margin:0 auto 48px;max-width:500px;">
          Explore India's most sacred temple circuits — each with its own divine significance
        </p>
        <div class="cat-showcase-grid">
          ${categories.map(cat => renderCategoryCard(cat)).join('')}
        </div>
      </div>
    </section>

    <section class="section" style="padding:60px 0;">
      <div class="container">
        <h2 class="section-title" style="text-align:center;">Plan Your <span style="color:var(--gold);">Pilgrimage</span></h2>
        <p class="section-subtitle" style="text-align:center;margin:0 auto 48px;">Everything you need for a smooth temple visit</p>
        <div class="how-it-works-grid">
          <div class="how-step"><div class="how-step-icon">🔍</div><div class="how-step-number">1</div><h3 class="how-step-title">Search Temple</h3><p class="how-step-desc">Smart search handles typos! Find by name, deity, city, or circuit.</p></div>
          <div class="how-step"><div class="how-step-icon">📊</div><div class="how-step-number">2</div><h3 class="how-step-title">Live Rush Status</h3><p class="how-step-desc">Real-time crowd levels + wait times before you visit.</p></div>
          <div class="how-step"><div class="how-step-icon">🎫</div><div class="how-step-number">3</div><h3 class="how-step-title">Book on Official Site</h3><p class="how-step-desc">Step-by-step guide + direct link to official booking.</p></div>
          <div class="how-step"><div class="how-step-icon">🏨</div><div class="how-step-number">4</div><h3 class="how-step-title">Stay & Explore</h3><p class="how-step-desc">Dharamshalas nearby + tourist places with Google Maps.</p></div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary);padding:60px 0;">
      <div class="container">
        <h2 class="section-title">🔥 <span style="color:var(--saffron-light);">Trending Temples</span></h2>
        <p class="section-subtitle">Most visited sacred shrines in India right now</p>
        <div class="temple-grid" id="featuredTemples">
          ${featuredTemples.length > 0 ? featuredTemples.map(t => renderTempleCard(t)).join('') : '<p style="color:var(--text-muted);">Loading...</p>'}
        </div>
        <div style="text-align:center;margin-top:40px;">
          <a href="#/search" class="btn btn-gold btn-lg" style="text-decoration:none;font-size:16px;">View All 39+ Temples →</a>
        </div>
      </div>
    </section>

    <section style="padding:40px 0;overflow:hidden;border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);background:rgba(255,107,0,0.02);">
      <div style="display:flex;gap:60px;animation:scroll-marquee 30s linear infinite;white-space:nowrap;">
        <span class="marquee-item">🛕 Tirumala: 50,000+ visitors daily</span>
        <span class="marquee-item">🔱 12 Jyotirlingas across India</span>
        <span class="marquee-item">🏔️ Kedarnath: 11,755 ft altitude</span>
        <span class="marquee-item">🙏 Golden Temple: Free Langar for 100K+</span>
        <span class="marquee-item">📿 Vaishno Devi: 13 km trek</span>
        <span class="marquee-item">🌊 Rameswaram: 22 sacred wells</span>
        <span class="marquee-item">⛰️ Amarnath: Natural ice Shivalinga</span>
        <span class="marquee-item">🎨 Konark: UNESCO chariot temple</span>
        <span class="marquee-item">🛕 Tirumala: 50,000+ visitors daily</span>
        <span class="marquee-item">🔱 12 Jyotirlingas across India</span>
        <span class="marquee-item">🏔️ Kedarnath: 11,755 ft altitude</span>
        <span class="marquee-item">🙏 Golden Temple: Free Langar for 100K+</span>
      </div>
    </section>

    <section class="section" style="text-align:center;padding:80px 0;">
      <div class="container">
        <div style="font-size:72px;margin-bottom:20px;filter:drop-shadow(0 0 20px rgba(255,107,0,0.3));">🙏</div>
        <h2 class="section-title" style="text-align:center;font-size:clamp(28px,4vw,42px);">Begin Your <span style="background:var(--gradient-sunset);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Sacred Journey</span></h2>
        <p style="color:var(--text-secondary);font-size:18px;margin:12px auto 32px;max-width:500px;">Temple guides, dharamshalas, nearby places — everything for your pilgrimage, in one place.</p>
        <a href="#/search" class="btn btn-gold btn-lg" style="text-decoration:none;font-size:17px;padding:16px 40px;">Explore Temples Now 🛕</a>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div>
            <div class="footer-brand" style="font-size:24px;">🛕 DivyaDarshan</div>
            <p class="footer-desc">India's temple travel companion. Booking guides, live status, dharamshalas & nearby places for 39+ famous temples.</p>
          </div>
          <div class="footer-section"><h4>Circuits</h4><ul>
            <li><a href="#/search?category=Jyotirlinga">🔱 Jyotirlingas</a></li>
            <li><a href="#/search?category=Char Dham">🏔️ Char Dham</a></li>
            <li><a href="#/search?category=Shakti Peeth">🔴 Shakti Peeths</a></li>
            <li><a href="#/search?category=Divya Desam">🌟 Divya Desams</a></li>
          </ul></div>
          <div class="footer-section"><h4>Popular</h4><ul>
            <li><a href="#/temple/tirupati-balaji">Tirupati Balaji</a></li>
            <li><a href="#/temple/vaishno-devi">Vaishno Devi</a></li>
            <li><a href="#/temple/kedarnath">Kedarnath</a></li>
            <li><a href="#/temple/golden-temple">Golden Temple</a></li>
          </ul></div>
          <div class="footer-section"><h4>Links</h4><ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/search">All Temples</a></li>
            <li><a href="#/login">Login</a></li>
          </ul></div>
        </div>
        <div class="footer-bottom">© 2026 DivyaDarshan. Made with 🙏 in India</div>
      </div>
    </footer>
  `;
}

export function initHome() {
  const searchInput = document.getElementById('heroSearch');
  const searchBtn = document.getElementById('heroSearchBtn');
  const clearBtn = document.getElementById('clearHistoryBtn');

  window.doSearch = () => {
    const v = (searchInput?.value || '').trim();
    if (v) {
      addToSearchHistory(v);
      window.location.hash = '#/search?q=' + encodeURIComponent(v);
    }
  };

  if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.doSearch(); });
  if (searchBtn) searchBtn.addEventListener('click', window.doSearch);
  if (clearBtn) clearBtn.addEventListener('click', () => { clearSearchHistory(); location.reload(); });

  initVoiceSearchHome();
}

function initVoiceSearchHome() {
  const micBtn = document.getElementById('micBtnHome');
  const searchInput = document.getElementById('heroSearch');

  if (!micBtn || !searchInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.style.display = 'none'; // Hide if unsupported
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Indian English works best for desi names

  let isListening = false;

  micBtn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    recognition.start();
  });

  recognition.onstart = () => {
    isListening = true;
    micBtn.innerHTML = '🔴'; // Change icon to indicate recording
    micBtn.style.background = '#FFE4E6';
    micBtn.style.color = '#E11D48';
    micBtn.style.border = '1px solid #FECDD3';
    searchInput.placeholder = 'Listening to your voice...';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;

    // Auto trigger search
    if (window.doSearch) window.doSearch();
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    resetMicUI();
  };

  recognition.onend = () => {
    isListening = false;
    resetMicUI();
  };

  function resetMicUI() {
    micBtn.innerHTML = '🎤';
    micBtn.style.background = '#F3F4F6';
    micBtn.style.color = '#FF6B00';
    micBtn.style.border = '1px solid rgba(0,0,0,0.1)';
    searchInput.placeholder = 'Search temples... Tirupati, Kedarnath, Shirdi...';
  }
}

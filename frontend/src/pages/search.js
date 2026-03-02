import { getTemples, getCategories } from '../api.js';
import { renderTempleCard } from '../components/templeCard.js';

// Search history functions
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('dd_search_history') || '[]'); } catch { return []; }
}
function addToSearchHistory(term) {
  if (!term.trim()) return;
  let history = getSearchHistory().filter(h => h !== term);
  history.unshift(term);
  if (history.length > 8) history = history.slice(0, 8);
  localStorage.setItem('dd_search_history', JSON.stringify(history));
}

export async function renderSearch(query = '') {
  let temples = [];
  let searchQuery = query;
  let activeCategory = '';
  let categories = [];

  // Parse from hash
  if (!searchQuery) {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      searchQuery = params.get('q') || '';
      activeCategory = params.get('category') || '';
    }
  }

  // Save to search history
  if (searchQuery) addToSearchHistory(searchQuery);

  try {
    const [data, catData] = await Promise.all([
      getTemples(searchQuery, activeCategory),
      getCategories()
    ]);
    temples = data.temples;
    categories = catData.categories || [];
  } catch (e) {
    console.error('Failed to fetch temples:', e);
  }

  const searchHistory = getSearchHistory();

  return `
    <div style="padding-top:100px;min-height:100vh;">
      <div class="container">
        <div style="margin-bottom:32px;" class="animate-fade-in-up">
          <h1 class="section-title" style="font-size:clamp(28px,4vw,42px);">
            Explore <span style="background:var(--gradient-saffron);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Sacred Temples</span>
          </h1>
          <p class="section-subtitle">Search with smart matching — even typos will find the right temple!</p>

          <div style="max-width:600px;position:relative;margin-top:20px;">
            <input type="text" class="input-field" id="searchInput" value="${searchQuery}"
              placeholder="Search by temple, deity, city... even with typos! 🔮"
              style="padding-right:100px;border-radius:var(--radius-full);padding-left:20px;font-size:16px;" />
            <div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);display:flex;gap:8px;">
              <button id="micBtn" style="width:40px;height:40px;border-radius:50%;background:#F3F4F6;border:1px solid rgba(0,0,0,0.1);color:#FF6B00;font-size:18px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;" title="Search by Voice">🎤</button>
              <button onclick="performSearch()" style="width:40px;height:40px;border-radius:50%;background:var(--gradient-saffron);border:none;color:#fff;font-size:18px;cursor:pointer;box-shadow:0 4px 15px rgba(255,107,0,0.3);transition:all 0.2s;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">🔍</button>
            </div>
          </div>

          ${searchHistory.length > 0 ? `
          <div style="margin-top:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:12px;color:var(--text-muted);">🕐 Recent:</span>
            ${searchHistory.slice(0, 6).map(h => `<a href="#/search?q=${encodeURIComponent(h)}" style="padding:4px 12px;border-radius:var(--radius-full);background:rgba(255,107,0,0.06);border:1px solid rgba(255,107,0,0.12);font-size:12px;color:var(--saffron-light);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,107,0,0.12)';this.style.borderColor='var(--saffron)'" onmouseout="this.style.background='rgba(255,107,0,0.06)';this.style.borderColor='rgba(255,107,0,0.12)'">${h}</a>`).join('')}
            <span onclick="localStorage.removeItem('dd_search_history');location.reload();" style="font-size:11px;color:var(--text-muted);cursor:pointer;text-decoration:underline;">Clear</span>
          </div>
          ` : ''}
        </div>

        <!-- Category Filter Chips -->
        <div class="category-chips animate-fade-in-up" id="categoryChips">
          <span class="category-chip ${!activeCategory ? 'active' : ''}" data-category="">All</span>
          ${categories.map(cat => `
            <span class="category-chip ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</span>
          `).join('')}
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <p style="color:var(--text-muted);font-size:14px;">
            ${temples.length > 0 ? `Showing <strong style="color:var(--saffron)">${temples.length}</strong> temples` : 'No temples found'}
            ${searchQuery ? ` for "<strong style="color:var(--text-primary)">${searchQuery}</strong>"` : ''}
            ${activeCategory ? ` in <strong style="color:var(--saffron)">${activeCategory}</strong>` : ''}
          </p>
          ${searchQuery || activeCategory ? `<a href="#/search" style="font-size:13px;color:var(--text-muted);text-decoration:none;" onmouseover="this.style.color='var(--saffron)'" onmouseout="this.style.color='var(--text-muted)'">Clear filters ✕</a>` : ''}
        </div>

        <div class="temple-grid" id="templeResults">
          ${temples.length > 0
      ? temples.map((t, i) => renderTempleCard(t, i + 1)).join('')
      : `<div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-state-icon">🛕</div>
                <h3>No temples found</h3>
                <p>${searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'Make sure backend is running on port 4000'}</p>
                ${searchQuery || activeCategory ? '<a href="#/search" class="btn btn-secondary" style="text-decoration:none;">View All Temples</a>' : ''}
              </div>`
    }
        </div>
      </div>
    </div>
  `;
}

export function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  window.performSearch = function () {
    const q = input.value.trim();
    if (q) addToSearchHistory(q);
    window.location.hash = '#/search?q=' + encodeURIComponent(q);
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') window.performSearch();
  });

  // Category chip clicks
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.category;
      const currentQ = input.value.trim();
      let hash = '#/search';
      const params = new URLSearchParams();
      if (currentQ) params.set('q', currentQ);
      if (cat) params.set('category', cat);
      if (params.toString()) hash += '?' + params.toString();
      window.location.hash = hash;
    });
  });

  initVoiceSearch();

  // Live search with debounce
  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const q = input.value.trim();
      try {
        const data = await getTemples(q);
        const grid = document.getElementById('templeResults');
        if (grid) {
          grid.innerHTML = data.temples.length > 0
            ? data.temples.map((t, i) => renderTempleCard(t, i + 1)).join('')
            : `<div class="empty-state" style="grid-column:1/-1;">
                            <div class="empty-state-icon">🛕</div>
                            <h3>No temples found</h3>
                            <p>Try a different search term</p>
                            </div>`;
        }
      } catch (err) { }
    }, 300);
  });
}

function initVoiceSearch() {
  const micBtn = document.getElementById('micBtn');
  const searchInput = document.getElementById('searchInput');

  if (!micBtn || !searchInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.style.display = 'none'; // Hide if unsupported
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Indian English

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
    micBtn.innerHTML = '🔴';
    micBtn.style.background = '#FFE4E6';
    micBtn.style.color = '#E11D48';
    micBtn.style.border = '1px solid #FECDD3';
    searchInput.placeholder = 'Listening to your voice...';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    window.performSearch(); // auto search!
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
    searchInput.placeholder = 'Search by temple, deity, city... even with typos! 🔮';
  }
}

import './styles/index.css';
import { renderNavbar, initNavbarScroll } from './components/navbar.js';
import { renderHome, initHome } from './pages/home.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderSearch, initSearch } from './pages/search.js';
import { renderTempleDetail, initTempleDetail, cleanupTempleDetail } from './pages/templeDetail.js';
import { renderBookings, initBookings } from './pages/bookings.js';

const app = document.getElementById('app');

// Cleanup function for previous page
let currentCleanup = null;

async function router() {
    // Cleanup previous page
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    const hash = window.location.hash || '#/';
    let content = '';
    let initFn = null;

    // Scroll to top on route change
    window.scrollTo(0, 0);

    if (hash === '#/' || hash === '' || hash === '#') {
        content = await renderHome();
        initFn = initHome;
    } else if (hash === '#/login') {
        content = renderLogin();
        initFn = initLogin;
    } else if (hash.startsWith('#/search')) {
        content = await renderSearch();
        initFn = initSearch;
    } else if (hash.startsWith('#/temple/')) {
        const templeId = hash.replace('#/temple/', '').split('?')[0];
        content = await renderTempleDetail(templeId);
        initFn = () => initTempleDetail(templeId);
        currentCleanup = cleanupTempleDetail;
    } else if (hash === '#/bookings') {
        content = await renderBookings();
        initFn = initBookings;
    } else {
        content = `
      <div class="container" style="padding-top:120px;text-align:center;">
        <div class="empty-state">
          <div class="empty-state-icon">🛕</div>
          <h3>Page Not Found</h3>
          <p>The path you seek leads elsewhere, O devotee.</p>
          <a href="#/" class="btn btn-primary">Return Home 🙏</a>
        </div>
      </div>`;
    }

    app.innerHTML = renderNavbar() + content;

    // Initialize page-specific JS
    initNavbarScroll();
    if (initFn) initFn();

    // Scroll to top button
    addScrollToTop();
}

function addScrollToTop() {
    let btn = document.getElementById('scrollTopBtn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'scrollTopBtn';
        btn.className = 'scroll-top';
        btn.innerHTML = '↑';
        btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

// Listen for hash changes
window.addEventListener('hashchange', router);

// Initial render
router();

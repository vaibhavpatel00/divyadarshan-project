import { isLoggedIn, getUser } from '../api.js';

export function renderNavbar() {
  const user = getUser();
  const loggedIn = isLoggedIn();

  return `
    <nav class="navbar" id="navbar">
      <div class="navbar-inner">
        <a class="navbar-logo" href="#/">
          🛕 <span>DivyaDarshan</span>
        </a>

        <div class="navbar-toggle" id="navToggle" onclick="document.getElementById('navLinks').classList.toggle('open')">
          <span></span><span></span><span></span>
        </div>

        <ul class="navbar-links" id="navLinks">
          <li><a href="#/" class="${location.hash === '#/' || location.hash === '' ? 'active' : ''}">Home</a></li>
          <li><a href="#/search" class="${location.hash.startsWith('#/search') ? 'active' : ''}">🔍 Temples</a></li>
        </ul>

        <div class="navbar-auth">
          ${loggedIn
      ? `<div class="navbar-user">
                <div class="navbar-avatar">${user?.name?.charAt(0)?.toUpperCase() || '🙏'}</div>
                <span>${user?.name || 'Devotee'}</span>
                <a href="#" onclick="event.preventDefault();import('/src/api.js').then(m=>m.logout())" style="color:var(--text-muted);font-size:13px;margin-left:8px;">Logout</a>
              </div>`
      : `<a href="#/login" class="btn btn-primary btn-sm">Login / Sign Up</a>`
    }
        </div>
      </div>
    </nav>
  `;
}

export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

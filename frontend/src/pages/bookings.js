import { getMyBookings, isLoggedIn } from '../api.js';

export async function renderBookings() {
    if (!isLoggedIn()) {
        return `
      <div class="auth-page">
        <div class="auth-container animate-fade-in-up" style="text-align:center;">
          <div style="font-size:64px;margin-bottom:20px;">🔐</div>
          <h2>Login Required</h2>
          <p style="color:var(--text-muted);margin-bottom:24px;">Please login to view your bookings</p>
          <a href="#/login" class="btn btn-primary btn-lg">Login Now 🙏</a>
        </div>
      </div>
    `;
    }

    let bookings = [];
    try {
        const data = await getMyBookings();
        bookings = data.bookings;
    } catch (e) {
        console.error('Failed to fetch bookings:', e);
    }

    return `
    <div class="bookings-page">
      <div class="container">
        <div class="animate-fade-in-up" style="margin-bottom:40px;">
          <h1 class="section-title">My Bookings</h1>
          <p class="section-subtitle">Your darshan ticket booking history</p>
        </div>

        ${bookings.length > 0
            ? bookings.map((b, i) => `
            <div class="booking-card animate-fade-in-up delay-${Math.min(i + 1, 5)}">
              <div class="booking-info">
                <h3>🛕 ${b.templeName}</h3>
                <p>📍 ${b.templeLocation} • ${b.darshanName}</p>
                <p>📅 ${new Date(b.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • 🎫 ${b.tickets} ticket${b.tickets > 1 ? 's' : ''}</p>
              </div>
              <div class="booking-meta">
                <div class="booking-ref">${b.bookingRef}</div>
                <div class="booking-price">${b.totalPrice === 0 ? 'FREE' : '₹' + b.totalPrice.toLocaleString()}</div>
                <div class="booking-status">✅ ${b.status.toUpperCase()}</div>
              </div>
            </div>
          `).join('')
            : `<div class="empty-state animate-fade-in-up">
              <div class="empty-state-icon">🎫</div>
              <h3>No Bookings Yet</h3>
              <p>You haven't booked any darshan tickets yet. Explore temples and book your first darshan!</p>
              <a href="#/search" class="btn btn-primary">Explore Temples 🛕</a>
            </div>`
        }
      </div>
    </div>
  `;
}

export function initBookings() {
    // Any post-render init for bookings page
}

import { getTempleById, getTempleStatus, getNearbyPlaces } from '../api.js';

let currentTemple = null;
let statusInterval = null;

export async function renderTempleDetail(templeId) {
  try {
    currentTemple = await getTempleById(templeId);
  } catch (e) {
    return `<div class="container" style="padding-top:120px;text-align:center;">
      <div class="empty-state"><div class="empty-state-icon">😔</div><h3>Temple Not Found</h3>
      <a href="#/search" class="btn btn-primary">Browse Temples</a></div></div>`;
  }

  const t = currentTemple;
  const status = t.liveStatus;
  const rushLabels = { low: '🟢 Low Rush', medium: '🟡 Moderate', high: '🟠 High Rush', extreme: '🔴 Extreme!' };
  const catClass = (t.category || '').toLowerCase().replace(/\s+/g, '-');

  return `
    <!-- Hero -->
    <div class="temple-detail-hero">
      <img src="${t.image}" alt="${t.name}" onerror="this.src='https://via.placeholder.com/1200x500/1A1A1A/E86A10?text=🛕';" />
      <div class="temple-detail-hero-overlay">
        <div class="animate-fade-in-up">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
            ${t.category ? `<span class="category-badge ${catClass}" style="position:static;">${t.category}</span>` : ''}
            <span class="badge ${status.isOpen ? 'badge-open' : 'badge-closed'}" id="liveOpenBadge">
              <span class="pulse-dot ${status.isOpen ? 'green' : 'red'}"></span> ${status.isOpen ? 'OPEN NOW' : 'CLOSED'}
            </span>
            <span class="badge badge-rush-${status.rushLevel}" id="liveRushBadge">${rushLabels[status.rushLevel] || ''}</span>
          </div>
          <h1 class="temple-detail-name">${t.name}</h1>
          <div class="temple-detail-deity">🙏 ${t.deity}</div>
          <div class="temple-detail-location">📍 ${t.location}</div>
        </div>
      </div>
    </div>

    <!-- Live Status Bar -->
    <div class="container">
      <div class="live-status-bar animate-fade-in-up">
        <div class="live-status-item"><div class="live-status-icon">🚦</div><div><div class="live-status-label">Rush Level</div><div class="live-status-value" id="liveRush" style="color:var(--saffron);">${status.rushLevel?.toUpperCase()}</div></div></div>
        <div class="live-status-item"><div class="live-status-icon">⏱️</div><div><div class="live-status-label">Est. Wait</div><div class="live-status-value" id="liveWait">${status.estimatedWait}</div></div></div>
        <div class="live-status-item"><div class="live-status-icon">👥</div><div><div class="live-status-label">Footfall</div><div class="live-status-value" id="liveFootfall">${(status.currentFootfall || 0).toLocaleString()}</div></div></div>
        <div class="live-status-item"><div class="live-status-icon">🔄</div><div><div class="live-status-label">Auto-Refresh</div><div class="live-status-value" style="font-size:13px;color:var(--sacred-green-light);" id="liveUpdated">Live</div></div></div>
      </div>
    </div>

    <div class="container" style="padding-bottom:80px;">
      <!-- About -->
      <div style="margin-bottom:48px;" class="animate-fade-in-up delay-1">
        <h2 style="font-size:28px;margin-bottom:16px;">About This Temple</h2>
        <p style="color:var(--text-secondary);line-height:1.8;font-size:16px;">${t.description}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">
          ${(t.highlights || []).map(h => `<span class="badge" style="background:rgba(232,106,16,0.08);color:var(--saffron-light);padding:6px 14px;font-size:13px;">✨ ${h}</span>`).join('')}
        </div>
      </div>

      <!-- Timings -->
      <div style="margin-bottom:48px;" class="animate-fade-in-up delay-2">
        <h2 style="font-size:28px;margin-bottom:20px;">🕐 Temple Timings</h2>
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);overflow:hidden;">
          <table class="timings-table">
            <thead><tr><th>Session</th><th>Opens</th><th>Closes</th></tr></thead>
            <tbody>
              <tr><td>🌅 Morning</td><td style="color:var(--sacred-green-light);font-weight:600;">${t.timings.morning.open}</td><td style="color:var(--vermillion);font-weight:600;">${t.timings.morning.close}</td></tr>
              <tr><td>🌆 Evening</td><td style="color:var(--sacred-green-light);font-weight:600;">${t.timings.evening.open}</td><td style="color:var(--vermillion);font-weight:600;">${t.timings.evening.close}</td></tr>
              <tr><td>⭐ Special</td><td colspan="2" style="color:var(--gold);">${t.timings.special}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Darshan Types -->
      <div style="margin-bottom:48px;" class="animate-fade-in-up delay-3">
        <h2 style="font-size:28px;margin-bottom:20px;">🎫 Darshan Types & Pricing</h2>
        <div class="darshan-grid">
          ${(t.darshanTypes || []).map(d => `
            <div class="darshan-card ${d.id} ${!d.available ? 'darshan-card-unavailable' : ''}">
              <div class="darshan-card-header">
                <div><span class="badge badge-${d.id}" style="margin-bottom:8px;">${d.id === 'free' ? '🆓 Free' : d.id === 'special' ? '⭐ Special' : '👑 VIP'}</span>
                  <div class="darshan-card-name">${d.name}</div></div>
                <div class="darshan-card-price ${d.price === 0 ? 'free-price' : ''}">${d.price === 0 ? 'FREE' : '₹' + d.price}</div>
              </div>
              <div class="darshan-card-desc">${d.description}</div>
              <div class="darshan-card-wait">⏱ Est. wait: <strong>${d.waitTime}</strong></div>
              ${d.available && d.price > 0
      ? `<a href="${t.bookingUrl}" target="_blank" rel="noopener" class="btn ${d.id === 'vip' ? 'btn-gold' : 'btn-primary'}" style="width:100%;text-decoration:none;">Book on Official Website ↗</a>`
      : d.available && d.price === 0
        ? `<div style="padding:10px 16px;background:rgba(107,142,107,0.1);border:1px solid rgba(107,142,107,0.2);border-radius:var(--radius-md);text-align:center;color:var(--sage-green);font-size:14px;font-weight:600;">✅ No Booking Required</div>`
        : `<button class="btn btn-secondary" style="width:100%;opacity:0.5;cursor:not-allowed;" disabled>Currently Unavailable</button>`}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- How to Book -->
      ${t.bookingProcess && t.bookingProcess.length > 0 ? `
      <div style="margin-bottom:48px;">
        <h2 style="font-size:28px;margin-bottom:20px;">📋 How to Book — Step by Step</h2>
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:32px;">
          <div style="display:flex;flex-direction:column;gap:0;">
            ${t.bookingProcess.map((step, i) => `
              <div style="display:flex;gap:16px;align-items:flex-start;${i < t.bookingProcess.length - 1 ? 'padding-bottom:20px;border-left:2px solid rgba(232,106,16,0.2);margin-left:17px;padding-left:28px;' : 'margin-left:17px;padding-left:28px;'}position:relative;">
                <div style="position:absolute;left:-13px;top:0;width:28px;height:28px;border-radius:50%;background:var(--gradient-saffron);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;">${i + 1}</div>
                <p style="color:var(--text-secondary);font-size:15px;line-height:1.6;padding-top:3px;">${step}</p>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--border-color);text-align:center;">
            <a href="${t.bookingUrl}" target="_blank" rel="noopener" class="btn btn-gold btn-lg" style="text-decoration:none;">🎫 Go to Official Booking Website ↗</a>
            <p style="color:var(--text-muted);font-size:13px;margin-top:12px;">You will be redirected to <strong>${t.bookingUrl.replace('https://', '').replace('http://', '').replace(/\/+$/, '')}</strong></p>
          </div>
        </div>
      </div>` : ''}

      <!-- Important Notes -->
      ${t.importantNotes && t.importantNotes.length > 0 ? `
      <div style="margin-bottom:48px;">
        <h2 style="font-size:28px;margin-bottom:20px;">⚠️ Important Notes</h2>
        <div style="background:rgba(199,91,57,0.06);border:1px solid rgba(199,91,57,0.15);border-radius:var(--radius-lg);padding:28px;">
          ${t.importantNotes.map(note => `
            <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">
              <span style="color:var(--terracotta);font-size:16px;flex-shrink:0;margin-top:2px;">⚡</span>
              <p style="color:var(--text-secondary);font-size:15px;line-height:1.5;">${note}</p>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Dharamshalas & Stay -->
      ${t.dharamshalas && t.dharamshalas.length > 0 ? `
      <div style="margin-bottom:48px;">
        <h2 style="font-size:28px;margin-bottom:20px;">🏨 Dharamshalas & Stay</h2>
        <div class="dharamshala-grid">
          ${t.dharamshalas.map(d => `
            <div class="dharamshala-card">
              <div class="dharamshala-name">${d.name}</div>
              <div class="dharamshala-info">
                <div class="dharamshala-info-row">📍 <span>${d.distance} from temple</span></div>
                <div class="dharamshala-info-row">💰 <span class="dharamshala-price">${d.priceRange}</span></div>
                ${d.phone ? `<div class="dharamshala-info-row">📞 <span>${d.phone}</span></div>` : ''}
              </div>
              ${d.bookingLink ? `<a href="${d.bookingLink}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration:none;">Book / Enquire ↗</a>` : '<span style="font-size:13px;color:var(--text-muted);">Contact directly for booking</span>'}
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Nearby Places to Visit -->
      ${t.nearbyPlaces && t.nearbyPlaces.length > 0 ? `
      <div style="margin-bottom:48px;">
        <h2 style="font-size:28px;margin-bottom:12px;">📍 Nearby Places to Visit</h2>
        <div class="radius-selector">
          <label>🎯 Show places within:</label>
          <select id="radiusSelect">
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50" selected>50 km</option>
            <option value="100">100 km</option>
          </select>
          <span style="font-size:13px;color:var(--text-muted);" id="nearbyCount">${t.nearbyPlaces.length} places found</span>
        </div>
        <div class="nearby-grid" id="nearbyGrid">
          ${t.nearbyPlaces.map(p => `
            <div class="nearby-card" data-distance="${p.distance}">
              <div class="nearby-card-header">
                <div class="nearby-card-name">${p.name}</div>
                <span class="nearby-distance-badge">${p.distance} km</span>
              </div>
              <span class="nearby-type-badge ${p.type}">${p.type === 'temple' ? '🛕' : p.type === 'nature' ? '🌿' : p.type === 'heritage' ? '🏛️' : '🏪'} ${p.type}</span>
              <div class="nearby-card-desc">${p.description}</div>
              <a href="${p.mapLink}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration:none;width:fit-content;">Open in Google Maps ↗</a>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Festivals -->
      <div style="margin-bottom:48px;">
        <h2 style="font-size:28px;margin-bottom:20px;">🎉 Major Festivals</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${(t.festivals || []).map(f => `<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:14px 20px;font-size:15px;">🪔 ${f}</div>`).join('')}
        </div>
      </div>

      <!-- Official Website -->
      <div style="text-align:center;padding:40px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
        <h3 style="margin-bottom:12px;">Official Temple Website</h3>
        <p style="color:var(--text-muted);margin-bottom:16px;">Visit for more information and booking</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="${t.officialWebsite}" target="_blank" rel="noopener" class="btn btn-secondary">Visit ${t.officialWebsite.replace('https://', '').replace('http://', '')} ↗</a>
          <a href="${t.bookingUrl}" target="_blank" rel="noopener" class="btn btn-primary">🎫 Book Darshan ↗</a>
        </div>
      </div>
    </div>
  `;
}

export function initTempleDetail(templeId) {
  // Radius selector for nearby places
  const radiusSelect = document.getElementById('radiusSelect');
  if (radiusSelect) {
    radiusSelect.addEventListener('change', async () => {
      const radius = parseInt(radiusSelect.value);
      try {
        const data = await getNearbyPlaces(templeId, radius);
        const grid = document.getElementById('nearbyGrid');
        const count = document.getElementById('nearbyCount');
        if (grid) {
          if (data.nearbyPlaces.length > 0) {
            grid.innerHTML = data.nearbyPlaces.map(p => `
              <div class="nearby-card">
                <div class="nearby-card-header">
                  <div class="nearby-card-name">${p.name}</div>
                  <span class="nearby-distance-badge">${p.distance} km</span>
                </div>
                <span class="nearby-type-badge ${p.type}">${p.type === 'temple' ? '🛕' : p.type === 'nature' ? '🌿' : p.type === 'heritage' ? '🏛️' : '🏪'} ${p.type}</span>
                <div class="nearby-card-desc">${p.description}</div>
                <a href="${p.mapLink}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration:none;width:fit-content;">Open in Google Maps ↗</a>
              </div>
            `).join('');
          } else {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No places found within ${radius} km. Try a larger radius.</div>`;
          }
        }
        if (count) count.textContent = `${data.nearbyPlaces.length} places found`;
      } catch (e) { console.error('Nearby error:', e); }
    });
  }

  // Auto-refresh live status
  if (statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(async () => {
    try {
      const status = await getTempleStatus(templeId);
      const rushLabels = { low: '🟢 Low Rush', medium: '🟡 Moderate', high: '🟠 High Rush', extreme: '🔴 Extreme!' };
      const el = (id) => document.getElementById(id);
      if (el('liveRush')) el('liveRush').textContent = status.rushLevel?.toUpperCase();
      if (el('liveWait')) el('liveWait').textContent = status.estimatedWait;
      if (el('liveFootfall')) el('liveFootfall').textContent = (status.currentFootfall || 0).toLocaleString();
      if (el('liveUpdated')) el('liveUpdated').textContent = new Date().toLocaleTimeString();
      if (el('liveOpenBadge')) {
        el('liveOpenBadge').className = `badge ${status.isOpen ? 'badge-open' : 'badge-closed'}`;
        el('liveOpenBadge').innerHTML = `<span class="pulse-dot ${status.isOpen ? 'green' : 'red'}"></span> ${status.isOpen ? 'OPEN NOW' : 'CLOSED'}`;
      }
      if (el('liveRushBadge')) {
        el('liveRushBadge').className = `badge badge-rush-${status.rushLevel}`;
        el('liveRushBadge').textContent = rushLabels[status.rushLevel] || '';
      }
    } catch (e) { console.warn('Status failed:', e); }
  }, 15000);
}

export function cleanupTempleDetail() {
  if (statusInterval) { clearInterval(statusInterval); statusInterval = null; }
}

export function renderTempleCard(temple, index = 0) {
  const rushLabels = { low: 'Low Rush', medium: 'Moderate', high: 'High Rush', extreme: 'Extreme!' };
  const rushColors = { low: 'green', medium: 'yellow', high: 'orange', extreme: 'red' };
  const categoryIcons = { 'Jyotirlinga': '🔱', 'Shakti Peeth': '🔴', 'Char Dham': '🏔️', 'Divya Desam': '🌟', 'Major Shrine': '🛕', 'Sikh Shrine': '☬', 'Sai Baba': '🙏', 'Buddhist Shrine': '☸️', 'UNESCO Heritage': '🏛️', 'Modern Temple': '✨', 'Pancha Bhoota': '🔥' };

  const status = temple.liveStatus || {};
  const dotColor = rushColors[status.rushLevel] || 'green';
  const catClass = (temple.category || '').toLowerCase().replace(/\s+/g, '-');
  const catIcon = categoryIcons[temple.category] || '🛕';

  const fallbackImg = `https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop&q=80`;
  const finalImage = temple.image ? temple.image : fallbackImg;

  const delayClass = index > 0 ? `delay-${Math.min(index, 5)}` : '';

  return `
    <div class="temple-card animate-fade-in-up ${delayClass}" onclick="window.location.hash='#/temple/${temple.id}'">
      <div class="temple-card-image-wrapper">
        <img class="temple-card-image" src="${finalImage}" alt="${temple.name}" onerror="this.onerror=null; this.src='${fallbackImg}';" loading="lazy" />
        ${temple.category ? `<span class="category-badge ${catClass}">${catIcon} ${temple.category}</span>` : ''}
        <div class="temple-card-status">
          <span class="badge ${status.isOpen ? 'badge-open' : 'badge-closed'}">
            <span class="pulse-dot ${status.isOpen ? 'green' : 'red'}"></span>
            ${status.isOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      </div>
      <div class="temple-card-body">
        <div class="temple-card-name">${temple.name}</div>
        <div class="temple-card-deity">🙏 ${temple.deity}</div>
        <div class="temple-card-location">📍 ${temple.location}</div>
        ${temple.highlights ? `
          <div class="temple-card-highlights">
            ${temple.highlights.slice(0, 3).map(h => `<span class="temple-card-highlight">${h}</span>`).join('')}
          </div>
        ` : ''}
        <div class="temple-card-footer">
          <div class="temple-card-rush">
            <span class="pulse-dot ${dotColor}"></span>
            <span class="badge badge-rush-${status.rushLevel || 'low'}">${rushLabels[status.rushLevel] || 'Unknown'}</span>
          </div>
          <span style="font-size:12px;color:var(--text-muted);font-weight:600;">⏱ ${status.estimatedWait || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

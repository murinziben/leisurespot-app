function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h} hour${h !== 1 ? 's' : ''}`;
}


function renderListingCard(listing, view = 'grid') {
  const img = listing.primary_image || listing.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1577971132997-c10be9372519?w=600&h=400&fit=crop&auto=format';
  const fallback = 'https://images.unsplash.com/photo-1577971132997-c10be9372519?w=600&h=400&fit=crop&auto=format';
  const catName  = listing.category?.name || '';
  const rating   = Number(listing.avg_rating) || 0;
  const reviews  = listing.review_count || 0;
  const isNew    = reviews === 0;
  const duration = formatDuration(listing.duration_minutes);
  const priceUnit = (listing.price_unit || 'per person').replace(/^per /, '');
  const city     = listing.city || 'Botswana';

  const starsHtml = `
    <div class="lc-stars">
      ${isNew
        ? '<span class="lc-new-badge">New</span>'
        : renderStars(rating, reviews)}
    </div>`;

  const metaHtml = `
    <div class="lc-meta">
      ${duration ? `<span class="lc-meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${duration}
      </span>` : ''}
    </div>`;

  const footerHtml = `
    <div class="lc-footer">
      <div class="lc-price">
        <span class="lc-price-amount">BWP ${Number(listing.price).toLocaleString()}</span>
        <span class="lc-price-unit">/ ${priceUnit}</span>
      </div>
      <span class="lc-view-btn">View &rarr;</span>
    </div>`;

  if (view === 'list') {
    return `
      <a class="lc-list" href="/listing/${listing.id}">
        <div class="lc-list-img-wrap">
          <img src="${img}" alt="${esc(listing.title)}" loading="lazy"
            onerror="this.src='${fallback}'">
          ${catName ? `<span class="lc-badge lc-badge-cat">${esc(catName)}</span>` : ''}
        </div>
        <div class="lc-list-body">
          ${listing.is_featured ? `<span class="lc-feat-pill">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Featured
          </span>` : ''}
          <div class="lc-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            ${esc(city)}
          </div>
          <div class="lc-title">${esc(listing.title)}</div>
          ${listing.short_description ? `<div class="lc-desc">${esc(listing.short_description)}</div>` : ''}
          ${starsHtml}
          ${metaHtml}
          ${footerHtml}
        </div>
      </a>`;
  }

  // Grid view (default)
  return `
    <a class="lc" href="/listing/${listing.id}">
      <div class="lc-img-wrap">
        <img class="lc-img" src="${img}" alt="${esc(listing.title)}" loading="lazy"
          onerror="this.src='${fallback}'">
        ${catName ? `<span class="lc-badge lc-badge-cat">${esc(catName)}</span>` : ''}
        ${listing.is_featured
          ? `<span class="lc-badge lc-badge-feat">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Featured
            </span>`
          : ''}
      </div>
      <div class="lc-body">
        <div class="lc-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${esc(city)}
        </div>
        <div class="lc-title">${esc(listing.title)}</div>
        ${listing.short_description ? `<div class="lc-desc">${esc(listing.short_description)}</div>` : ''}
        ${starsHtml}
        ${metaHtml}
        ${footerHtml}
      </div>
    </a>`;
}

function renderPagination(page, pages, onPageChange) {
  if (pages <= 1) return '';
  let html = '<div class="pagination">';
  html += `<button class="page-btn" ${page <= 1 ? 'disabled' : ''}
    onclick="${onPageChange}(${page - 1})">&#8249;</button>`;
  let lastPrinted = 0;
  for (let i = 1; i <= pages; i++) {
    const near = i === 1 || i === pages || Math.abs(i - page) <= 2;
    if (near) {
      if (lastPrinted && i - lastPrinted > 1) {
        html += '<span style="padding:0 0.4rem;color:var(--text-secondary)">…</span>';
      }
      html += `<button class="page-btn ${i === page ? 'active' : ''}"
        onclick="scrollTo({top:0,behavior:'smooth'});${onPageChange}(${i})">${i}</button>`;
      lastPrinted = i;
    }
  }
  html += `<button class="page-btn" ${page >= pages ? 'disabled' : ''}
    onclick="${onPageChange}(${page + 1})">&#8250;</button>`;
  html += '</div>';
  return html;
}


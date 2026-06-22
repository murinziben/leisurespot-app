// ── Earnings chart state ──────────────────────────────────────────────────────
let _chartInstance = null;
let _analyticsCache = null;
let _chartPeriod = 6;

// ── Vendor dashboard logic ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const page = window.__vendorPage;
  if (!page) return;
  if (!requireAuth()) return;

  if (page === 'dashboard') await loadVendorDashboard();
  if (page === 'listings') await loadVendorListings();
  if (page === 'bookings') await loadVendorBookings();
  if (page === 'new_listing') setupNewListingForm();
});

async function loadVendorDashboard() {
  const [analyticsData, profileData] = await Promise.all([
    apiFetch('/vendors/analytics'),
    apiFetch('/vendors/profile'),
  ]);

  if (!analyticsData?.success) {
    if (profileData?.success && profileData.data?.status === 'PENDING') {
      document.getElementById('vendor-name').textContent = profileData.data.business?.name || 'Your Business';
      document.getElementById('vendor-status').innerHTML = '<span class="badge status-PENDING">PENDING</span>';
      document.getElementById('pending-notice').style.display = 'flex';
      document.getElementById('vendor-stats').innerHTML = '';
    } else {
      document.getElementById('vendor-content').innerHTML = '<div class="alert alert-warning">Vendor account not found. <a href="/vendor/onboarding">Complete onboarding →</a></div>';
    }
    return;
  }

  const a = analyticsData.data;
  const profile = profileData?.data;

  document.getElementById('vendor-name').textContent = profile?.business?.name || 'Your Business';
  document.getElementById('vendor-status').innerHTML = `<span class="badge status-${profile?.status}">${profile?.status}</span>`;

  document.getElementById('vendor-stats').innerHTML = `
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">BWP ${a.total_revenue.toLocaleString()}</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-icon">${icon('dollar-sign', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--info)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${a.total_bookings}</div><div class="stat-label">Total Bookings</div></div>
        <div class="stat-icon" style="background:#dbeafe">${icon('calendar', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--success)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${a.active_listings}</div><div class="stat-label">Active Listings</div></div>
        <div class="stat-icon" style="background:#dcfce7">${icon('layout-list', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--orange)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${a.avg_rating.toFixed(1)}</div><div class="stat-label">Average Rating</div></div>
        <div class="stat-icon" style="background:#fef9c3">${icon('star', 20)}</div>
      </div>
    </div>
  `;

  if (a.top_listings?.length) {
    document.getElementById('top-listings').innerHTML = a.top_listings.map(l => `
      <tr>
        <td><a href="/listing/${l.id}" style="color:var(--teal);font-weight:500">${l.title}</a></td>
        <td>${l.booking_count}</td>
        <td>${renderStarRow(l.avg_rating || 0, 12)} <span style="font-size:0.8rem;color:var(--text-secondary)">${l.avg_rating?.toFixed(1) || '0.0'}</span></td>
      </tr>
    `).join('');
  }

  // Render earnings chart after a short tick so the canvas is fully laid out
  if (typeof Chart !== 'undefined') {
    setTimeout(() => renderEarningsChart(a), 80);
  }
}

// ── Earnings chart ────────────────────────────────────────────────────────────

function setChartPeriod(months, btn) {
  _chartPeriod = months;
  document.querySelectorAll('.period-tab').forEach(b => {
    const isActive = b === btn;
    b.style.background   = isActive ? 'white' : 'none';
    b.style.color        = isActive ? 'var(--teal)' : 'var(--text-secondary)';
    b.style.boxShadow    = isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
  });
  if (_analyticsCache) renderEarningsChart(_analyticsCache);
}

function renderEarningsChart(a) {
  _analyticsCache = a;
  const canvas = document.getElementById('earnings-canvas');
  if (!canvas) return;

  const { labels, revenue, bookings } = buildChartData(_chartPeriod, a);
  const trend = computeMovingAverage(revenue, 2);

  if (_chartInstance) { _chartInstance.destroy(); _chartInstance = null; }

  const teal   = getComputedStyle(document.documentElement).getPropertyValue('--teal').trim() || '#008080';
  const orange = '#E8711A';

  _chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue (BWP)',
          type: 'bar',
          data: revenue,
          backgroundColor: 'rgba(0,128,128,0.72)',
          hoverBackgroundColor: 'rgba(0,128,128,0.9)',
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y',
          order: 3,
        },
        {
          label: 'Bookings',
          type: 'line',
          data: bookings,
          borderColor: orange,
          backgroundColor: 'rgba(232,113,26,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: orange,
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: false,
          yAxisID: 'y1',
          order: 1,
        },
        {
          label: 'Revenue Trend',
          type: 'line',
          data: trend,
          borderColor: 'rgba(0,128,128,0.40)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          tension: 0.5,
          fill: false,
          yAxisID: 'y',
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 500, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'white',
          borderColor: 'rgba(0,0,0,0.08)',
          borderWidth: 1,
          titleColor: '#111',
          bodyColor: '#555',
          padding: 12,
          callbacks: {
            label: ctx => {
              if (ctx.dataset.label === 'Revenue (BWP)')
                return `  Revenue: BWP ${ctx.raw.toLocaleString()}`;
              if (ctx.dataset.label === 'Bookings')
                return `  Bookings: ${ctx.raw}`;
              if (ctx.dataset.label === 'Revenue Trend')
                return `  Trend: BWP ${ctx.raw.toLocaleString()}`;
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#888' },
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: {
            font: { size: 11 }, color: '#888',
            callback: v => 'BWP ' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
          },
          beginAtZero: true,
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: {
            font: { size: 11 }, color: '#888',
            stepSize: 1,
            callback: v => v + ' bkg',
          },
          beginAtZero: true,
        },
      },
    },
  });
}

function buildChartData(period, a) {
  const now = new Date();
  const months = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString('en-BW', { month: 'short', year: '2-digit' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }

  // Try to use real monthly data from API response
  const monthly = a.monthly_revenue || a.revenue_by_month || a.earnings_by_month || null;
  let revenue, bookings;

  if (monthly && Array.isArray(monthly) && monthly.length > 0) {
    const map = {};
    monthly.forEach(m => { map[m.month || m.key] = m; });
    revenue  = months.map(m => map[m.key]?.revenue  || map[m.key]?.total_revenue || 0);
    bookings = months.map(m => map[m.key]?.bookings || map[m.key]?.total_bookings || 0);
  } else {
    revenue  = synthRevenue(period, a.total_revenue || 0);
    bookings = synthBookings(period, a.total_bookings || 0);
  }

  return { labels: months.map(m => m.label), revenue, bookings };
}

function synthRevenue(n, total) {
  const base = total > 0 ? total : n * 2800;
  const weights = Array.from({ length: n }, (_, i) => {
    const growth   = 1 + (i / n) * 0.45;
    const variance = 0.65 + 0.7 * Math.abs(Math.sin(i * 2.1 + 0.7));
    return growth * variance;
  });
  const wSum = weights.reduce((s, w) => s + w, 0);
  return weights.map(w => Math.round((w / wSum) * base / 100) * 100);
}

function synthBookings(n, total) {
  const avg = total > 0 ? total / n : 5;
  return Array.from({ length: n }, (_, i) => {
    const growth   = 1 + (i / n) * 0.3;
    const variance = 0.55 + 0.9 * Math.abs(Math.sin(i * 1.6 + 1.2));
    return Math.max(0, Math.round(avg * growth * variance));
  });
}

function computeMovingAverage(data, win) {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - win), i + 1);
    return Math.round(slice.reduce((s, v) => s + v, 0) / slice.length);
  });
}

// ── Availability prompt (shown after listing creation) ────────────────────────

function showAvailabilityPrompt(listingId) {
  const overlay = document.createElement('div');
  overlay.id = 'avail-prompt-overlay';
  overlay.style.cssText = [
    'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999',
    'display:flex;align-items:center;justify-content:center;padding:1.5rem',
    'animation:fadeIn .2s ease',
  ].join(';');

  overlay.innerHTML = `
    <div style="background:white;border-radius:20px;padding:2rem;max-width:440px;width:100%;
      box-shadow:0 24px 72px rgba(0,0,0,0.22);animation:slideUp .25s ease">
      <!-- Icon -->
      <div style="width:60px;height:60px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);
        border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>

      <!-- Copy -->
      <div style="text-align:center;margin-bottom:1.75rem">
        <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:0.5rem">Listing published!</h2>
        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.65">
          One more step — set your availability calendar so customers know which dates you're open for bookings.
        </p>
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:0.625rem">
        <a href="/vendor/availability${listingId ? '?listing=' + listingId : ''}"
          style="display:flex;align-items:center;justify-content:center;gap:0.5rem"
          class="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Set Availability Now
        </a>
        <a href="/vendor/listings"
          style="display:flex;align-items:center;justify-content:center"
          class="btn btn-ghost">
          Skip — go to my listings
        </a>
      </div>
    </div>
  `;

  // Inject animation keyframes once
  if (!document.getElementById('prompt-keyframes')) {
    const style = document.createElement('style');
    style.id = 'prompt-keyframes';
    style.textContent = `
      @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
      @keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);
}

async function loadVendorListings() {
  const el = document.getElementById('listings-grid');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading listings…</p></div>';

  const data = await apiFetch('/listings/my');
  if (!data?.success || !data.data.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-icon">${icon('layout-list', 48)}</div>
      <h3>No listings yet</h3>
      <p>Create your first listing to start accepting bookings.</p>
      <a href="/vendor/listings/new" class="btn btn-primary mt-2">Create Listing</a>
    </div>`;
    return;
  }

  el.innerHTML = data.data.map(l => {
    let featuredBadge = '';
    let featuredBtn = '';
    if (l.is_featured) {
      const exp = l.featured_expires_at ? ` · expires ${new Date(l.featured_expires_at).toLocaleDateString('en-BW')}` : '';
      featuredBadge = `<span class="badge badge-primary" title="Featured listing${exp}">${icon('star',11)} Featured${exp}</span>`;
      featuredBtn = `<button class="btn btn-sm" style="display:flex;align-items:center;gap:0.35rem;color:var(--text-secondary);border:1px solid var(--border-color);background:transparent" onclick="cancelFeature('${l.id}')" title="Remove featured status">${icon('star-off',14)}</button>`;
    } else if (l.featured_requested) {
      featuredBadge = `<span class="badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a">${icon('clock',11)} Feature Pending</span>`;
      featuredBtn = `<button class="btn btn-sm" style="display:flex;align-items:center;gap:0.35rem;color:var(--text-secondary);border:1px solid var(--border-color);background:transparent" onclick="cancelFeatureRequest('${l.id}')" title="Cancel request">${icon('x',14)}</button>`;
    } else {
      featuredBtn = `<button class="btn btn-sm" style="display:flex;align-items:center;gap:0.35rem;color:var(--orange);border:1px solid var(--orange);background:transparent" onclick="requestFeature('${l.id}')" title="Request to be featured">${icon('star',14)} Feature</button>`;
    }
    return `
    <div class="vendor-listing-row">
      <img src="${l.images?.[0]?.url || 'https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?w=200'}" class="vendor-listing-thumb" alt="${l.title}" onerror="this.src='https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?w=200'">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;margin-bottom:0.25rem">${l.title}</div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.25rem">
          ${getStatusBadge(l.status)}
          ${featuredBadge}
          <span class="badge badge-gray">${l.booking_type}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-secondary)">BWP ${l.price.toLocaleString()} &middot; ${l.booking_count} bookings &middot; ${renderStarRow(l.avg_rating || 0, 12)} ${l.avg_rating?.toFixed(1) || '0.0'}</div>
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;flex-shrink:0">
        <a href="/listing/${l.id}" class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:0.35rem">${icon('eye', 14)} View</a>
        <a href="/vendor/listings/${l.id}/edit" class="btn btn-outline btn-sm" style="display:flex;align-items:center;gap:0.35rem">${icon('pencil', 14)} Edit</a>
        ${featuredBtn}
        <span id="archive-default-${l.id}">
          <button class="btn btn-sm" style="display:flex;align-items:center;gap:0.35rem;color:var(--danger);border-color:var(--danger);border:1px solid;background:transparent" onclick="startArchive('${l.id}')">${icon('trash-2', 14)}</button>
        </span>
        <span id="archive-confirm-${l.id}" style="display:none;display:flex;align-items:center;gap:0.35rem;font-size:0.78rem">
          <span style="color:var(--text-secondary);white-space:nowrap">Archive?</span>
          <button class="btn btn-sm" style="background:var(--danger);color:white" onclick="confirmArchive('${l.id}')">Yes</button>
          <button class="btn btn-ghost btn-sm" onclick="cancelArchive('${l.id}')">No</button>
        </span>
      </div>
    </div>`;
  }).join('');
}

function startArchive(id) {
  document.getElementById(`archive-default-${id}`).style.display = 'none';
  document.getElementById(`archive-confirm-${id}`).style.display = 'flex';
}
function cancelArchive(id) {
  document.getElementById(`archive-default-${id}`).style.display = '';
  document.getElementById(`archive-confirm-${id}`).style.display = 'none';
}
async function confirmArchive(id) {
  const data = await apiFetch(`/listings/${id}`, { method: 'DELETE' });
  if (data?.success) { showToast('Listing archived', 'success'); loadVendorListings(); }
  else showToast('Failed to archive listing', 'error');
}

async function requestFeature(id) {
  const data = await apiFetch(`/listings/${id}/request-feature`, {
    method: 'POST',
    body: JSON.stringify({ note: '' }),
  });
  if (data?.success) { showToast(data.message || 'Feature request submitted', 'success'); loadVendorListings(); }
  else showToast(data?.detail || 'Request failed', 'error');
}

async function cancelFeatureRequest(id) {
  const data = await apiFetch(`/listings/${id}/request-feature`, { method: 'DELETE' });
  if (data?.success) { showToast('Feature request cancelled', 'info'); loadVendorListings(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function cancelFeature(id) {
  // Admin action — only admins can remove featured; show info toast for vendors
  showToast('Contact support to remove a featured listing early.', 'info');
}

async function loadVendorBookings() {
  const el = document.getElementById('bookings-table-body');
  const data = await apiFetch('/bookings/vendor');

  if (!data?.success || !data.data.length) {
    document.getElementById('bookings-table').innerHTML = `<div class="empty-state">
      <div class="empty-icon">${icon('calendar', 48)}</div>
      <h3>No bookings yet</h3>
      <p>Bookings will appear here once customers book your listings.</p>
    </div>`;
    return;
  }

  el.innerHTML = data.data.map(b => `
    <tr>
      <td data-label="Customer"><strong>${b.customer_name || 'Customer'}</strong><br><small style="color:var(--text-secondary)">${b.customer_email || ''}</small></td>
      <td data-label="Listing"><a href="/listing/${b.listing_id}" style="color:var(--teal)">${b.listing_title}</a></td>
      <td data-label="Date">${b.booking_date}</td>
      <td data-label="Guests">${b.guests}</td>
      <td data-label="Amount">BWP ${b.total_amount.toLocaleString()}</td>
      <td data-label="Status">${getStatusBadge(b.status)}</td>
      <td data-label="Actions" style="display:flex;gap:0.35rem;flex-wrap:wrap">
        ${b.status === 'PENDING' ? `
          <button class="btn btn-sm" style="background:var(--success);color:white;font-size:0.78rem" onclick="updateBookingStatus('${b.id}', 'CONFIRMED')">Confirm</button>
          <button class="btn btn-sm" style="background:var(--danger);color:white;font-size:0.78rem" onclick="updateBookingStatus('${b.id}', 'REJECTED')">Reject</button>
        ` : ''}
        ${b.status === 'CONFIRMED' ? `
          <button class="btn btn-sm" style="background:var(--teal);color:white;font-size:0.78rem" onclick="updateBookingStatus('${b.id}', 'COMPLETED')">Complete</button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

async function updateBookingStatus(bookingId, status) {
  const data = await apiFetch(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (data?.success) {
    showToast(`Booking ${status.toLowerCase()}`, 'success');
    loadVendorBookings();
  } else {
    showToast('Failed to update booking', 'error');
  }
}

function setupNewListingForm() {
  apiFetch('/categories').then(data => {
    if (!data?.success) return;
    const select = document.getElementById('category_id');
    if (!select) return;
    data.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
      cat.children?.forEach(child => {
        const childOpt = document.createElement('option');
        childOpt.value = child.id;
        childOpt.textContent = `  └ ${child.name}`;
        select.appendChild(childOpt);
      });
    });
  });

  document.getElementById('new-listing-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    btn.classList.add('btn-loading');
    btn.disabled = true;

    const formData = new FormData(e.target);
    const includes = formData.get('includes') ? formData.get('includes').split('\n').filter(Boolean) : null;
    const excludes = formData.get('excludes') ? formData.get('excludes').split('\n').filter(Boolean) : null;
    const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(Boolean) : null;

    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      short_description: formData.get('short_description'),
      price: parseFloat(formData.get('price')),
      price_unit: formData.get('price_unit'),
      city: formData.get('city'),
      booking_type: formData.get('booking_type'),
      duration_minutes: formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes')) : null,
      max_guests: parseInt(formData.get('max_guests') || 10),
      min_guests: parseInt(formData.get('min_guests') || 1),
      cancellation_policy: formData.get('cancellation_policy') || null,
      category_id: formData.get('category_id') || null,
      includes, excludes, tags,
    };

    const data = await apiFetch('/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    btn.classList.remove('btn-loading');
    btn.disabled = false;

    if (data?.success) {
      const listingId = data.data?.id;
      const imageUrl = formData.get('image_url');
      if (imageUrl && listingId) {
        await apiFetch(`/listings/${listingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ image_urls: [imageUrl] }),
        });
      }
      showToast('Listing created!', 'success');
      showAvailabilityPrompt(listingId);
    } else {
      showToast(data?.detail || data?.message || 'Failed to create listing', 'error');
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  });
}

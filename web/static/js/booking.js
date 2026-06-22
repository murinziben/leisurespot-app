// Booking page logic
document.addEventListener('DOMContentLoaded', async () => {
  const listingId = window.__listingId;
  if (!listingId) return;
  if (!requireAuth()) return;

  let listing = null;
  let guests = 1;
  let _blockedDates = new Set();

  async function loadListing() {
    const data = await apiFetch(`/listings/${listingId}`);
    if (!data?.success) { showToast('Listing not found', 'error'); return; }
    listing = data.data;
    renderSummary();
    renderForm();
    // Load blackout dates after listing data is available
    loadBlockedDates();
  }

  async function loadBlockedDates() {
    const res = await apiFetch(`/listings/${listingId}/availability`);
    _blockedDates = new Set(res?.data?.blocked_dates || []);
  }

  function renderSummary() {
    const img = listing.primary_image || listing.images?.[0]?.url || '';
    document.getElementById('booking-summary').innerHTML = `
      ${img ? `<img src="${img}" alt="${listing.title}" class="booking-summary-img">` : ''}
      <div class="booking-summary-body">
        <h3 style="margin-bottom:0.5rem;font-size:1rem">${listing.title}</h3>
        <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${listing.city || 'Botswana'} &nbsp;·&nbsp; <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#E8711A" stroke="#E8711A" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${listing.avg_rating?.toFixed(1)} (${listing.review_count})
        </div>
        <div class="divider"></div>
        <div class="price-breakdown" id="price-breakdown">
          <!-- updated dynamically -->
        </div>
      </div>
    `;
    updatePriceBreakdown();
  }

  function updatePriceBreakdown() {
    if (!listing) return;
    const base = listing.price * guests;
    const fee = base * 0.10;
    const total = base + fee;
    document.getElementById('price-breakdown').innerHTML = `
      <div class="price-row">
        <span>BWP ${listing.price.toLocaleString()} × ${guests} guest${guests > 1 ? 's' : ''}</span>
        <span>BWP ${base.toLocaleString()}</span>
      </div>
      <div class="price-row">
        <span>Platform fee (10%)</span>
        <span>BWP ${fee.toLocaleString('en-BW', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="price-row total">
        <span>Total</span>
        <span>BWP ${total.toLocaleString('en-BW', { minimumFractionDigits: 2 })}</span>
      </div>
    `;
  }

  function renderForm() {
    document.getElementById('booking-title').textContent = `Book: ${listing.title}`;
    document.getElementById('booking-type-info').innerHTML = listing.booking_type === 'INSTANT'
      ? `<div class="alert alert-success" style="display:flex;align-items:center;gap:0.5rem"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span><strong>Instant booking</strong> — your booking is confirmed immediately.</span></div>`
      : `<div class="alert alert-warning" style="display:flex;align-items:center;gap:0.5rem"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg><span><strong>Request booking</strong> — the vendor will confirm within 24 hours.</span></div>`;
  }

  // Blackout date validation on date picker change
  document.getElementById('date-input')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const errEl = document.getElementById('date-blocked-error');
    if (!val || !_blockedDates.size) { if (errEl) errEl.style.display = 'none'; return; }
    if (_blockedDates.has(val)) {
      e.target.value = '';
      if (errEl) {
        errEl.style.display = '';
      } else {
        const msg = document.createElement('p');
        msg.id = 'date-blocked-error';
        msg.style.cssText = 'color:var(--danger);font-size:0.8rem;margin-top:0.35rem;display:flex;align-items:center;gap:0.35rem';
        msg.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg> This date is unavailable — please choose another.`;
        e.target.closest('.form-group').appendChild(msg);
      }
    } else {
      if (errEl) errEl.style.display = 'none';
    }
  });

  document.getElementById('guests-input')?.addEventListener('input', (e) => {
    guests = Math.max(1, Math.min(listing?.max_guests || 20, parseInt(e.target.value) || 1));
    e.target.value = guests;
    updatePriceBreakdown();
  });

  document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;

    const btn = e.target.querySelector('[type="submit"]');
    btn.classList.add('btn-loading');
    btn.disabled = true;

    const formData = new FormData(e.target);
    const payload = {
      listing_id: listingId,
      booking_date: formData.get('booking_date'),
      start_time: formData.get('start_time') || null,
      guests: parseInt(formData.get('guests') || 1),
      special_requests: formData.get('special_requests') || null,
    };

    const data = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    btn.classList.remove('btn-loading');
    btn.disabled = false;

    if (data?.success) {
      showToast('Booking created! Proceeding to payment…', 'success');
      // Email notification simulation
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const email = user.email || 'your email';
      setTimeout(() => showToast(`📧 Booking details sent to ${email}`, 'info'), 900);
      setTimeout(() => window.location.href = `/pay/${data.data.id}`, 1600);
    } else {
      showToast(data?.detail || data?.message || 'Booking failed. Please try again.', 'error');
    }
  });

  await loadListing();
});

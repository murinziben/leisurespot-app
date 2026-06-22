// LeisureSpot — Payment page (mock DPO Pay provider)
// To switch to real DPO Pay: set PAYMENT_PROVIDER=dpo in env and implement DPOPaymentProvider

const BID = window.__bookingId;
let _booking = null;
let _method = 'orange';
let _grandTotal = 0;
let _paying = false;

// Preserve inputs across method switches
const _saved = { phone: '' };

const METHODS = [
  {
    id: 'orange',
    name: 'Orange Money',
    desc: 'Pay via your Orange Money wallet',
    badge: 'Most popular',
    iconBg: '#fff3ec',
    iconBorder: '#ffe0cc',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6900" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="17" x2="12" y2="17.01" stroke-linecap="round" stroke-width="3"/><line x1="9" y1="7" x2="15" y2="7"/></svg>`,
  },
  {
    id: 'myzaka',
    name: 'MyZaka by Mascom',
    desc: 'Pay via your MyZaka (Mascom) wallet',
    badge: null,
    iconBg: '#edf2fb',
    iconBorder: '#c3d4f2',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003087" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="15" r="1.5" fill="#003087"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="10" x2="13" y2="10"/></svg>`,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    desc: 'Visa or Mastercard — local and international',
    badge: null,
    iconBg: '#f1f5f9',
    iconBorder: '#cbd5e1',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
];

// Decline triggers (simulation)
const DECLINES = {
  orange: '75000002',
  myzaka: '72000002',
  card:   '4000000000000002',
};

function showState(s) {
  ['loading', 'form', 'processing', 'success', 'error'].forEach(id => {
    const el = document.getElementById('state-' + id);
    if (el) el.style.display = s === id ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  document.getElementById('pay-btn')?.addEventListener('click', handlePay);

  const res = await apiFetch('/bookings/' + BID);
  if (!res?.success) {
    showState('error');
    document.getElementById('error-msg').textContent = 'Booking not found or access denied.';
    return;
  }

  _booking = res.data;
  renderMethods();
  selectMethod('orange');
  showState('form');
  renderSummary(); // after form is visible so pay-btn-amount is in the live DOM
});

// ── Order summary ───────────────────────────────────────────────────────────

function renderSummary() {
  const b = _booking;
  const base = +(b.total_amount || 0);
  const fee  = +((base * 0.10).toFixed(2));
  _grandTotal = +((base + fee).toFixed(2));

  const img = b.listing_image || b.primary_image || '';
  const dateStr = b.booking_date ? fmtDate(b.booking_date) : '—';
  const pricePerGuest = b.guests ? (base / b.guests) : base;

  document.getElementById('order-summary').innerHTML = `
    ${img
      ? `<img src="${esc(img)}" alt="${esc(b.listing_title || '')}" class="summary-img"
           onerror="this.style.display='none'">`
      : `<div style="height:168px;background:linear-gradient(135deg,var(--teal) 0%,#2a8ea6 100%);display:flex;align-items:center;justify-content:center">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`
    }
    <div class="summary-body">
      <div class="summary-eyebrow">Your booking</div>
      <div class="summary-title">${esc(b.listing_title || 'Experience')}</div>
      <div class="summary-meta">
        <div class="summary-meta-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>${dateStr}</span>
        </div>
        <div class="summary-meta-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>${b.guests} guest${b.guests !== 1 ? 's' : ''}</span>
        </div>
        ${b.start_time ? `<div class="summary-meta-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${b.start_time}</span>
        </div>` : ''}
      </div>
      <div class="price-line">
        <span>BWP ${fmtN(pricePerGuest)} × ${b.guests} guest${b.guests !== 1 ? 's' : ''}</span>
        <span>BWP ${fmtN(base)}</span>
      </div>
      <div class="price-line">
        <span>Platform fee (10%)</span>
        <span>BWP ${fmtN(fee)}</span>
      </div>
      <div class="price-line-total">
        <span>Total</span>
        <span class="price-total-val">BWP ${fmtN(_grandTotal)}</span>
      </div>
      <div class="guarantee-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Booking guaranteed — instant confirmation
      </div>
    </div>
  `;

  document.getElementById('pay-btn-amount').textContent = 'BWP ' + fmtN(_grandTotal);
}

// ── Method cards ────────────────────────────────────────────────────────────

function renderMethods() {
  document.getElementById('method-list').innerHTML = METHODS.map(m => `
    <div class="pm-card${m.id === _method ? ' selected' : ''}"
         id="pm-${m.id}"
         onclick="selectMethod('${m.id}')"
         role="radio"
         aria-checked="${m.id === _method}"
         tabindex="0"
         onkeydown="if(event.key==='Enter'||event.key===' ')selectMethod('${m.id}')">
      <div class="pm-icon-wrap" style="background:${m.iconBg};border:1px solid ${m.iconBorder}">${m.icon}</div>
      <div class="pm-info">
        <div class="pm-name">
          ${esc(m.name)}
          ${m.badge ? `<span class="pm-badge">${esc(m.badge)}</span>` : ''}
        </div>
        <div class="pm-desc">${esc(m.desc)}</div>
      </div>
      <div class="pm-radio" id="pm-radio-${m.id}">
        ${m.id === _method ? `<svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill="white"/></svg>` : ''}
      </div>
    </div>
  `).join('');
}

function selectMethod(id) {
  // Save current phone value before switching away
  const prev = document.getElementById('phone-input');
  if (prev) _saved.phone = prev.value;

  _method = id;
  METHODS.forEach(m => {
    const card  = document.getElementById('pm-' + m.id);
    const radio = document.getElementById('pm-radio-' + m.id);
    if (!card) return;
    card.classList.toggle('selected', m.id === id);
    card.setAttribute('aria-checked', m.id === id);
    radio.innerHTML = m.id === id
      ? `<svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill="white"/></svg>`
      : '';
  });

  const area = document.getElementById('pay-form-area');
  if (id === 'card') area.innerHTML = cardForm();
  else {
    area.innerHTML = mmForm(id);
    // Restore saved phone value
    const inp = document.getElementById('phone-input');
    if (inp && _saved.phone) inp.value = _saved.phone;
  }
}

// ── Mobile money form ───────────────────────────────────────────────────────

function mmForm(id) {
  const isOrange  = id === 'orange';
  const color     = isOrange ? '#ff6900' : '#003087';
  const name      = isOrange ? 'Orange Money' : 'MyZaka';
  const testOk    = isOrange ? '+267 75 123 456' : '+267 72 123 456';
  const testFail  = isOrange ? '+267 75 000 002' : '+267 72 000 002';

  return `
    <div class="mm-how" style="background:${color}0d;border:1px solid ${color}28">
      <div class="mm-how-title" style="color:${color}">${name} checkout — how it works</div>
      <ol>
        <li>Enter your ${name}-registered phone number below</li>
        <li>Click <strong>Pay</strong> — a push notification is sent to your phone</li>
        <li>Approve the payment on your device to complete the booking</li>
      </ol>
    </div>

    <div class="form-group" style="margin-bottom:.875rem">
      <label class="form-label">${name} phone number</label>
      <div class="phone-wrap" id="phone-wrap">
        <div class="phone-prefix">+267</div>
        <input
          type="tel"
          id="phone-input"
          class="phone-inner"
          placeholder="7X XXX XXX"
          maxlength="11"
          oninput="fmtPhone(this)"
          autocomplete="tel-national"
          inputmode="tel"
        >
      </div>
    </div>

    <div class="push-hint">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      A push notification will be sent to your ${isOrange ? 'Orange' : 'Mascom'} number to authorise this payment
    </div>

    <div class="test-creds">
      <div class="test-creds-title">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
        Test credentials — simulation only
      </div>
      <div class="test-creds-row"><span class="badge-ok">SUCCESS</span> Any number, e.g. <code>${testOk}</code></div>
      <div class="test-creds-row"><span class="badge-fail">DECLINE</span> <code>${testFail}</code></div>
    </div>
  `;
}

// ── Card form ───────────────────────────────────────────────────────────────

function cardForm() {
  return `
    <div class="form-group" style="margin-bottom:.875rem">
      <label class="form-label">Card number</label>
      <div class="card-num-wrap">
        <input
          type="text"
          id="card-number"
          placeholder="0000  0000  0000  0000"
          maxlength="19"
          oninput="fmtCard(this)"
          autocomplete="cc-number"
          inputmode="numeric"
          style="padding-right:4.5rem"
        >
        <div id="card-type-tag" class="card-type-tag">CARD</div>
      </div>
    </div>

    <div class="card-row" style="margin-bottom:.875rem">
      <div class="form-group" style="margin:0">
        <label class="form-label">Expiry date</label>
        <input type="text" id="card-expiry" placeholder="MM / YY" maxlength="7"
          oninput="fmtExpiry(this)" autocomplete="cc-exp" inputmode="numeric">
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" style="display:flex;align-items:center;gap:.3rem">
          CVV
          <span title="3-digit code on the back of your card" style="cursor:help;display:flex;align-items:center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </span>
        </label>
        <input type="text" id="card-cvv" placeholder="•••" maxlength="4"
          oninput="this.value=this.value.replace(/\\D/g,'')" autocomplete="cc-csc" inputmode="numeric">
      </div>
    </div>

    <div class="form-group" style="margin-bottom:1.125rem">
      <label class="form-label">Name on card</label>
      <input type="text" id="card-name" placeholder="KEFILWE MOETI"
        autocomplete="cc-name" style="text-transform:uppercase">
    </div>

    <div class="test-creds">
      <div class="test-creds-title">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
        Test credentials — simulation only
      </div>
      <div class="test-creds-row"><span class="badge-ok">SUCCESS</span> <code>4111 1111 1111 1111</code> · any expiry &amp; CVV</div>
      <div class="test-creds-row"><span class="badge-fail">DECLINE</span> <code>4000 0000 0000 0002</code></div>
    </div>
  `;
}

// ── Input formatters ────────────────────────────────────────────────────────

function fmtPhone(input) {
  const d = input.value.replace(/\D/g, '').slice(0, 9);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ' ' + d.slice(2, 5);
  if (d.length > 5) out += ' ' + d.slice(5, 9);
  input.value = out;
}

function fmtCard(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
  const tag = document.getElementById('card-type-tag');
  if (!tag) return;
  if (/^4/.test(v))              tag.textContent = 'VISA';
  else if (/^5[1-5]|^2[2-7]/.test(v)) tag.textContent = 'MC';
  else                           tag.textContent = 'CARD';
}

function fmtExpiry(input) {
  const d = input.value.replace(/\D/g, '').slice(0, 4);
  // Always zero-pad month so "1/25" becomes "01 / 25" and passes length check
  const month = d.slice(0, 2).padStart(d.length >= 1 ? 2 : 0, '0');
  input.value = d.length > 2 ? month + ' / ' + d.slice(2) : month;
}

// ── Pay handler ─────────────────────────────────────────────────────────────

async function handlePay() {
  if (_paying) return;
  const details = collectDetails();
  if (!details) return;

  _paying = true;
  showState('processing');
  await sleep(2800);

  if (isDeclined(details)) {
    _paying = false;
    showState('error');
    document.getElementById('error-msg').textContent =
      'Your payment was declined by the payment network. Please check your details or try a different method.';
    return;
  }

  // Confirm booking
  const res = await apiFetch('/bookings/' + BID + '/status', {
    method: 'PATCH',
    body: JSON.stringify({ status: 'CONFIRMED' }),
  });

  if (!res?.success) {
    _paying = false;
    showState('error');
    document.getElementById('error-msg').textContent =
      'Payment was processed but booking confirmation failed. Please contact support with your booking reference.';
    return;
  }

  showSuccess(details);
}

function collectDetails() {
  if (_method === 'orange' || _method === 'myzaka') {
    const raw = (document.getElementById('phone-input')?.value || '').replace(/\D/g, '');
    if (raw.length < 8) { showToast('Please enter a valid phone number', 'error'); return null; }
    return { method: _method, phone: raw };
  }
  const num    = (document.getElementById('card-number')?.value  || '').replace(/\D/g, '');
  const expiry = (document.getElementById('card-expiry')?.value  || '').trim();
  const cvv    = (document.getElementById('card-cvv')?.value     || '').trim();
  if (num.length < 16) { showToast('Please enter a valid 16-digit card number', 'error'); return null; }
  if (expiry.length < 7) { showToast('Please enter a valid expiry date (MM / YY)', 'error'); return null; }
  if (cvv.length < 3)    { showToast('Please enter the CVV', 'error'); return null; }
  return { method: 'card', number: num, expiry, cvv };
}

function isDeclined(d) {
  if (d.method === 'card')   return d.number === DECLINES.card;
  return (d.phone || '').replace(/\s/g, '') === DECLINES[d.method];
}

// ── Success display ─────────────────────────────────────────────────────────

function showSuccess(details) {
  let methodLabel;
  if (details.method === 'card') {
    methodLabel = `Card ending ···· ${details.number.slice(-4)}`;
  } else {
    const digits = fmtPhoneDisplay(details.phone);
    methodLabel  = details.method === 'orange'
      ? `Orange Money (+267 ${digits})`
      : `MyZaka — Mascom (+267 ${digits})`;
  }

  const ref = '#' + BID.replace(/-/g, '').slice(0, 8).toUpperCase();

  document.getElementById('success-amount').textContent = `BWP ${fmtN(_grandTotal)} charged`;
  document.getElementById('success-method').textContent = `via ${methodLabel}`;
  document.getElementById('success-ref').innerHTML =
    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px;vertical-align:-2px" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>Booking ref: <strong>${ref}</strong>`;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('success-email').textContent = user.email
    ? `Confirmation email sent to ${user.email}`
    : 'Check your email for booking confirmation.';

  document.getElementById('view-booking-btn').href = '/dashboard/bookings/' + BID;
  showState('success');

  let n = 5;
  const cdEl = document.getElementById('redirect-cd');
  cdEl.textContent = `Redirecting to your booking in ${n}…`;
  const timer = setInterval(() => {
    n--;
    if (n <= 0) { clearInterval(timer); window.location.href = '/dashboard/bookings/' + BID; }
    else cdEl.textContent = `Redirecting to your booking in ${n}…`;
  }, 1000);
}

// ── Cancel booking ──────────────────────────────────────────────────────────

async function cancelBooking(e) {
  e.preventDefault();
  if (_paying) return; // don't allow cancel mid-payment
  const link = e.currentTarget;
  if (link.dataset.confirming) {
    // Second click — actually cancel
    await apiFetch('/bookings/' + BID + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    window.location.href = '/dashboard';
  } else {
    // First click — ask for confirmation inline
    link.dataset.confirming = '1';
    link.textContent = 'Are you sure? Click again to cancel';
    link.style.fontWeight = '600';
    setTimeout(() => {
      delete link.dataset.confirming;
      link.textContent = 'Cancel booking';
      link.style.fontWeight = '';
    }, 4000);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fmtN(n) {
  return (+n).toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPhoneDisplay(digits) {
  let v = (digits || '').replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2) + ' ' + v.slice(2);
  if (v.length > 5) v = v.slice(0, 6) + ' ' + v.slice(6);
  return v;
}

function fmtDate(str) {
  try {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-BW', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return str; }
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

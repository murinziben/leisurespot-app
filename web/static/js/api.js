const API = window.API_BASE || 'http://localhost:4000/api/v1';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  let res = await fetch(API + path, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = localStorage.getItem('access_token');
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(API + path, { ...options, headers });
    } else {
      clearAuth();
      window.location.href = '/login';
      return null;
    }
  }

  return res.json();
}

async function tryRefreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastIcons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    error:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    info:    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${toastIcons[type] || toastIcons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Renders a category icon — Lucide name stored in DB, falls back to a layers SVG
function catIcon(icon, size = 14) {
  const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`;
  if (!icon || !icon.trim()) return fallback;
  // Lucide icon names are lowercase letters and hyphens only
  if (/^[a-z][a-z0-9-]+$/.test(icon.trim())) {
    return `<i data-lucide="${icon.trim()}" style="width:${size}px;height:${size}px;display:block"></i>`;
  }
  return fallback;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBWP(amount) {
  return `BWP ${Number(amount).toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderStars(rating, count = null) {
  const poly = 'points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"';
  const svg = (fill, stroke) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.5" style="display:inline-block;vertical-align:middle"><polygon ${poly}/></svg>`;
  let html = '';
  for (let i = 0; i < 5; i++) {
    const full = rating >= i + 1;
    const half = !full && rating >= i + 0.5;
    if (full) {
      html += svg('#E8711A', '#E8711A');
    } else if (half) {
      html += `<span style="position:relative;display:inline-block;width:13px;height:13px;vertical-align:middle">${svg('#d1d5db','#d1d5db')}<span style="position:absolute;inset:0;overflow:hidden;width:50%">${svg('#E8711A','#E8711A')}</span></span>`;
    } else {
      html += svg('none', '#d1d5db');
    }
  }
  return `<span class="stars">${html}</span>${count !== null ? `<span class="rating-text" style="font-size:0.75rem;color:var(--text-secondary);margin-left:3px">(${count})</span>` : ''}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-BW');
}

function getStatusBadge(status) {
  const labels = {
    PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed',
    CANCELLED: 'Cancelled', REJECTED: 'Rejected', APPROVED: 'Approved',
    ACTIVE: 'Active', INACTIVE: 'Inactive',
  };
  return `<span class="badge status-${status}">${labels[status] || status}</span>`;
}

function buildQueryString(params) {
  const q = Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '');
  return q.length ? '?' + q.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
}

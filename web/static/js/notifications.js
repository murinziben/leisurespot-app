// LeisureSpot — In-app notification system
// localStorage-backed with best-effort API sync.
// Only active when a user is logged in (access_token present).

(function () {
  'use strict';

  const STORE_KEY = 'ls_notifs';
  const MAX_ITEMS = 60;

  // ── Store ─────────────────────────────────────────────────────────────────────

  const NotifStore = {
    get() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
      catch { return []; }
    },

    save(items) {
      localStorage.setItem(STORE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    },

    add(opts) {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);

      const notif = {
        id,
        type:       opts.type    || 'info',
        message:    opts.message || '',
        link:       opts.link    || null,
        read:       false,
        created_at: new Date().toISOString(),
      };

      const items = this.get();
      items.unshift(notif);
      this.save(items);

      // Best-effort persist to backend
      if (typeof apiFetch === 'function') {
        apiFetch('/notifications', {
          method: 'POST',
          body: JSON.stringify(notif),
        }).catch(() => {});
      }

      return notif;
    },

    markRead(id) {
      const items = this.get().map(n => n.id === id ? { ...n, read: true } : n);
      this.save(items);
      if (typeof apiFetch === 'function') {
        apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
      }
    },

    markAllRead() {
      this.save(this.get().map(n => ({ ...n, read: true })));
      if (typeof apiFetch === 'function') {
        apiFetch('/notifications/read-all', { method: 'PATCH' }).catch(() => {});
      }
    },

    async sync() {
      try {
        if (typeof apiFetch !== 'function') return this.get();
        const res = await apiFetch('/notifications');
        if (res?.success && Array.isArray(res.data) && res.data.length) {
          const apiIds  = new Set(res.data.map(n => n.id));
          const localOnly = this.get().filter(n => !apiIds.has(n.id));
          this.save([...res.data, ...localOnly]);
        }
      } catch {}
      return this.get();
    },
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function timeAgo(dateStr) {
    const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (secs < 60)     return 'Just now';
    if (secs < 3600)   return Math.floor(secs / 60) + 'm ago';
    if (secs < 86400)  return Math.floor(secs / 3600) + 'h ago';
    if (secs < 604800) return Math.floor(secs / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString('en-BW', { day: 'numeric', month: 'short' });
  }

  function typeIcon(type) {
    const map = {
      booking_new: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      booking_confirmed: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`,
      booking_rejected:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      booking_cancelled: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      booking_completed: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      payment_confirmed: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      review_new:        `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      review_prompt:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      featured_approved: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      featured_rejected: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
      listing_published: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
      vendor_approved:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      admin_vendor:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      admin_listing:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
      admin_featured:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      admin_booking:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      info:              `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    };
    return map[type] || map.info;
  }

  function typeColor(type) {
    if (['booking_confirmed','booking_completed','payment_confirmed','vendor_approved','featured_approved','listing_published'].includes(type))
      return 'var(--success)';
    if (['booking_rejected','booking_cancelled','featured_rejected'].includes(type))
      return 'var(--danger)';
    if (['review_new','review_prompt'].includes(type))
      return 'var(--orange)';
    return 'var(--teal)';
  }

  // ── Badge ─────────────────────────────────────────────────────────────────────

  function updateBadge(items) {
    const count = items.filter(n => !n.read).length;
    const label = count > 99 ? '99+' : String(count);

    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = label;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Mobile badge inside the nav link
    const mobileBadge = document.getElementById('mobile-notif-badge');
    if (mobileBadge) {
      mobileBadge.textContent = label;
      mobileBadge.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────────

  function buildPanelItems(items) {
    const slice = items.slice(0, 8);
    if (!slice.length) {
      return `
        <div style="padding:2.5rem 1rem;text-align:center;color:var(--text-secondary)">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
            style="margin:0 auto 0.75rem;display:block;opacity:0.3">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style="font-size:0.8rem;margin:0">No notifications yet</p>
        </div>`;
    }
    return slice.map(n => `
      <div onclick="window.__notifClick('${n.id}','${(n.link || '').replace(/'/g, '')}')"
        style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.875rem 1rem;
          cursor:pointer;border-bottom:1px solid var(--border-color);
          transition:background .12s;background:${n.read ? 'transparent' : 'rgba(0,128,128,0.04)'}">
        <div style="width:32px;height:32px;border-radius:8px;flex-shrink:0;
          background:${n.read ? '#f3f4f6' : 'rgba(0,128,128,0.1)'};
          display:flex;align-items:center;justify-content:center;
          color:${typeColor(n.type)}">
          ${typeIcon(n.type)}
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-size:0.8rem;color:var(--text-primary);margin:0 0 0.2rem;
            line-height:1.45;font-weight:${n.read ? '400' : '500'}">${escapeHtml(n.message)}</p>
          <span style="font-size:0.72rem;color:var(--text-secondary)">${timeAgo(n.created_at)}</span>
        </div>
        ${!n.read ? `<div style="width:7px;height:7px;border-radius:50%;background:var(--teal);flex-shrink:0;margin-top:5px"></div>` : ''}
      </div>`).join('');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Public surface ────────────────────────────────────────────────────────────

  window.__notifClick = function (id, link) {
    NotifStore.markRead(id);
    refreshUI(NotifStore.get());
    if (link) window.location.href = link;
    else document.getElementById('notif-panel')?.classList.remove('open');
  };

  window.toggleNotifPanel = function () {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
      document.getElementById('user-dropdown')?.classList.remove('open');
      const items = NotifStore.get();
      const body  = document.getElementById('notif-panel-body');
      if (body) body.innerHTML = buildPanelItems(items);
    }
  };

  window.notifMarkAllRead = function () {
    NotifStore.markAllRead();
    refreshUI(NotifStore.get());
  };

  // Push a notification (called from other JS files on action success)
  window.pushNotification = function (opts) {
    if (!localStorage.getItem('access_token')) return;
    NotifStore.add(opts);
    refreshUI(NotifStore.get());
  };

  // Expose for notifications page
  window.__NotifStore = NotifStore;

  function refreshUI(items) {
    updateBadge(items);
    const body = document.getElementById('notif-panel-body');
    if (body && document.getElementById('notif-panel')?.classList.contains('open')) {
      body.innerHTML = buildPanelItems(items);
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) return;

    const items = await NotifStore.sync();
    updateBadge(items);

    // Poll every 45 seconds for new server-side notifications
    setInterval(async () => {
      const latest = await NotifStore.sync();
      refreshUI(latest);
    }, 45000);
  });

  // Close panel on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#notif-bell-wrap')) {
      document.getElementById('notif-panel')?.classList.remove('open');
    }
  });

  // Close panel on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.getElementById('notif-panel')?.classList.remove('open');
  });
})();

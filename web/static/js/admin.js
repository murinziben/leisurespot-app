/* admin.js — all admin page logic */

function requireAdminRole() {
  const user = window.__currentUser || (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  if (!user) {
    window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  if (user.role !== 'ADMIN') {
    window.location.href = '/';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  const page = window.__adminPage;
  if (!page) return;
  if (!requireAuth()) return;
  if (!requireAdminRole()) return;

  if (page === 'dashboard')  await loadAdminDashboard();
  if (page === 'users')      await loadAdminUsers();
  if (page === 'vendors')    await loadAdminVendors();
  if (page === 'bookings')   await loadAdminBookings();
  if (page === 'listings')   { await loadFeatureRequests(); await loadAdminListings(); }
  if (page === 'reviews')    await loadAdminReviews();
  if (page === 'categories') await loadAdminCategories();
  if (page === 'revenue')    await loadAdminRevenue();
});

// ─── Dashboard ────────────────────────────────────────────────────────
async function loadAdminDashboard() {
  const data = await apiFetch('/admin/dashboard');
  if (!data?.success) return;
  const d = data.data;

  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_users.toLocaleString()}</div><div class="stat-label">Total Users</div></div>
        <div class="stat-icon">${icon('users', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--info)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_vendors}</div><div class="stat-label">Vendors <span style="font-size:0.7rem;color:var(--warning)">(${d.pending_vendors} pending)</span></div></div>
        <div class="stat-icon" style="background:#dbeafe">${icon('store', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--success)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_listings}</div><div class="stat-label">Active Listings</div></div>
        <div class="stat-icon" style="background:#dcfce7">${icon('layout-list', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--orange)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">BWP ${d.total_revenue.toLocaleString()}</div><div class="stat-label">Platform Revenue</div></div>
        <div class="stat-icon" style="background:#fef9c3">${icon('dollar-sign', 20)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_bookings.toLocaleString()}</div><div class="stat-label">Total Bookings</div></div>
        <div class="stat-icon">${icon('calendar', 20)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_reviews || 0}</div><div class="stat-label">Reviews <span style="font-size:0.7rem;color:var(--warning)">(${d.unpublished_reviews || 0} hidden)</span></div></div>
        <div class="stat-icon">${icon('star', 20)}</div>
      </div>
    </div>
  `;

  const pvData = await apiFetch('/admin/vendors/pending');
  const el = document.getElementById('pending-vendors-preview');
  if (!pvData?.success || !pvData.data.length) {
    el.innerHTML = '<p style="color:var(--text-secondary);font-size:0.875rem;text-align:center;padding:1rem">No pending applications</p>';
    return;
  }
  el.innerHTML = pvData.data.slice(0, 4).map(v => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid var(--border-color)">
      <div>
        <div style="font-weight:600;font-size:0.875rem">${v.business_name || '—'}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary)">${v.user_email}</div>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-sm" style="background:var(--success);color:white;padding:0.25rem 0.75rem;font-size:0.78rem" onclick="quickApprove('${v.id}', true, this)">Approve</button>
        <button class="btn btn-sm" style="background:var(--danger);color:white;padding:0.25rem 0.75rem;font-size:0.78rem"  onclick="quickApprove('${v.id}', false, this)">Reject</button>
      </div>
    </div>
  `).join('') + (pvData.data.length > 4 ? `<div style="text-align:center;padding:0.75rem;font-size:0.8rem;color:var(--text-secondary)">+${pvData.data.length - 4} more — <a href="/admin/vendors" style="color:var(--teal)">View all</a></div>` : '');
}

async function quickApprove(vendorId, approved, btn) {
  const row = btn.closest('div[style*="display:flex"]');
  const data = await apiFetch(`/admin/vendors/${vendorId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approved }),
  });
  if (data?.success) { row.remove(); showToast(`Vendor ${approved ? 'approved' : 'rejected'}`, 'success'); }
}


// ─── Users ────────────────────────────────────────────────────────────
async function loadAdminUsers(page = 1) {
  const el = document.getElementById('users-table-body');
  el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  const search = document.getElementById('user-search')?.value || '';
  const role   = document.getElementById('user-role-filter')?.value || '';
  const qs = buildQueryString({ page, per_page: 20, search, role });
  const data = await apiFetch(`/admin/users${qs}`);
  if (!data?.success) return;

  if (!data.data.items.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)">No users found</td></tr>';
    return;
  }

  el.innerHTML = data.data.items.map(u => `
    <tr>
      <td><strong>${u.name || '—'}</strong><br><small style="color:var(--text-secondary)">${u.email}</small></td>
      <td><span class="badge badge-${u.role === 'ADMIN' ? 'danger' : u.role === 'VENDOR' ? 'info' : 'gray'}">${u.role}</span></td>
      <td>${u.is_verified ? 'Verified' : 'Unverified'}</td>
      <td>${u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}</td>
      <td><span class="badge badge-${u.is_active ? 'success' : 'danger'}">${u.is_active ? 'Active' : 'Suspended'}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="toggleUserStatus('${u.id}', ${!u.is_active})">${u.is_active ? 'Suspend' : 'Activate'}</button>
      </td>
    </tr>
  `).join('');

  const pag = document.getElementById('users-pagination');
  if (pag) pag.innerHTML = renderPagination(data.data.page, Math.ceil(data.data.total / 20), 'loadAdminUsers');
}

async function toggleUserStatus(userId, isActive) {
  const data = await apiFetch(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  if (data?.success) { showToast('User status updated', 'success'); loadAdminUsers(); }
  else showToast(data?.detail || 'Failed to update user', 'error');
}


// ─── Vendors ──────────────────────────────────────────────────────────
async function loadAdminVendors(page = 1) {
  const el = document.getElementById('vendors-table-body');
  el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  const status = document.getElementById('vendor-status-filter')?.value || '';
  const search = document.getElementById('vendor-search')?.value || '';
  const qs = buildQueryString({ page, per_page: 20, status, search });
  const data = await apiFetch(`/admin/vendors${qs}`);
  if (!data?.success) return;

  if (!data.data.items.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)">No vendors found</td></tr>';
    return;
  }

  const statusColor = { APPROVED: 'success', PENDING: 'warning', REJECTED: 'danger' };
  el.innerHTML = data.data.items.map(v => `
    <tr>
      <td><strong>${v.business_name || '—'}</strong></td>
      <td>${v.user_email}</td>
      <td>${v.business_city || '—'}</td>
      <td>${v.listing_count}</td>
      <td><span class="badge badge-${statusColor[v.status] || 'gray'}">${v.status}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
        ${v.status === 'PENDING' ? `
          <button class="btn btn-sm" style="background:var(--success);color:white;font-size:0.78rem" onclick="approveVendor('${v.id}', true)">Approve</button>
          <button class="btn btn-sm" style="background:var(--danger);color:white;font-size:0.78rem"  onclick="approveVendor('${v.id}', false)">Reject</button>` : ''}
        ${v.status === 'APPROVED' ? `<button class="btn btn-ghost btn-sm" onclick="suspendVendor('${v.id}')">Suspend</button>` : ''}
        ${v.status === 'REJECTED' ? `<button class="btn btn-sm" style="background:var(--teal);color:white;font-size:0.78rem" onclick="approveVendor('${v.id}', true)">Re-approve</button>` : ''}
      </td>
    </tr>
  `).join('');

  const pag = document.getElementById('vendors-pagination');
  if (pag) pag.innerHTML = renderPagination(data.data.page, Math.ceil(data.data.total / 20), 'loadAdminVendors');
}

async function approveVendor(vendorId, approved) {
  const reason = !approved ? prompt('Rejection reason (optional):') : null;
  const data = await apiFetch(`/admin/vendors/${vendorId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approved, reason }),
  });
  if (data?.success) { showToast(`Vendor ${approved ? 'approved' : 'rejected'}`, 'success'); loadAdminVendors(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function suspendVendor(vendorId) {
  if (!confirm('Suspend this vendor?')) return;
  const data = await apiFetch(`/admin/vendors/${vendorId}/suspend`, { method: 'PATCH' });
  if (data?.success) { showToast('Vendor suspended', 'success'); loadAdminVendors(); }
  else showToast(data?.detail || 'Failed', 'error');
}


// ─── Listings ─────────────────────────────────────────────────────────
async function loadAdminListings(page = 1) {
  const el = document.getElementById('listings-table-body');
  el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  const search = document.getElementById('listing-search')?.value || '';
  const status = document.getElementById('listing-status-filter')?.value || '';
  const qs = buildQueryString({ page, per_page: 20, search, status });
  const data = await apiFetch(`/admin/listings${qs}`);
  if (!data?.success) return;

  if (!data.data.items.length) {
    el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary)">No listings found</td></tr>';
    return;
  }

  const statusColor = { ACTIVE: 'success', DRAFT: 'gray', ARCHIVED: 'danger', INACTIVE: 'warning' };
  el.innerHTML = data.data.items.map(l => `
    <tr>
      <td>
        ${l.primary_image ? `<img src="${l.primary_image}" style="width:48px;height:36px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px" onerror="this.style.display='none'">` : ''}
        <strong>${l.title}</strong>
        ${l.is_featured ? ` <span style="display:inline-flex;align-items:center;gap:3px;font-size:0.7rem;color:var(--orange);font-weight:600">${icon('star', 11, 'fill:#E8711A;stroke:#E8711A')} Featured</span>` : ''}
      </td>
      <td>${l.vendor_business || l.vendor_email || '—'}</td>
      <td>${l.category_name || '—'}</td>
      <td>BWP ${Number(l.price).toLocaleString()}</td>
      <td>${l.booking_count || 0}</td>
      <td><span class="badge badge-${statusColor[l.status] || 'gray'}">${l.status}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="toggleFeatured('${l.id}', ${!l.is_featured})">${l.is_featured ? 'Unfeature' : 'Feature'}</button>
        ${l.status !== 'ARCHIVED'
          ? `<button class="btn btn-sm" style="background:var(--danger);color:white;font-size:0.78rem" onclick="setListingStatus('${l.id}','ARCHIVED')">Archive</button>`
          : `<button class="btn btn-sm" style="background:var(--success);color:white;font-size:0.78rem" onclick="setListingStatus('${l.id}','ACTIVE')">Restore</button>`}
      </td>
    </tr>
  `).join('');

  const pag = document.getElementById('listings-pagination');
  if (pag) pag.innerHTML = renderPagination(data.data.page, Math.ceil(data.data.total / 20), 'loadAdminListings');
}

async function loadFeatureRequests() {
  const el = document.getElementById('feature-requests-list');
  const countEl = document.getElementById('feature-request-count');
  if (!el) return;
  const data = await apiFetch('/admin/feature-requests');
  if (!data?.success || !data.data.length) {
    el.innerHTML = '<p style="font-size:0.875rem;color:var(--text-secondary);padding:0.5rem 0">No pending feature requests.</p>';
    if (countEl) countEl.style.display = 'none';
    return;
  }
  if (countEl) { countEl.textContent = data.data.length; countEl.style.display = 'inline'; }
  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:0.75rem">` +
    data.data.map(r => `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;padding:1rem;background:white;border:1px solid var(--border-color);border-radius:10px;box-shadow:var(--shadow-card)">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;margin-bottom:0.2rem">${esc(r.title)}</div>
          <div style="font-size:0.8rem;color:var(--text-secondary)">${esc(r.vendor_name)} &middot; ${r.city} &middot; BWP ${Number(r.price).toLocaleString()}</div>
          ${r.note ? `<div style="font-size:0.8rem;margin-top:0.3rem;color:var(--text-primary);font-style:italic">"${esc(r.note)}"</div>` : ''}
        </div>
        <div style="display:flex;gap:0.5rem;flex-shrink:0">
          <button class="btn btn-sm btn-primary" onclick="approveFeature('${r.id}')">Approve (30 days)</button>
          <button class="btn btn-sm btn-ghost" onclick="rejectFeature('${r.id}')">Reject</button>
        </div>
      </div>`).join('') + `</div>`;
}

async function approveFeature(listingId) {
  const days = prompt('Feature duration in days? (default: 30)', '30');
  if (days === null) return;
  const data = await apiFetch(`/admin/listings/${listingId}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ is_featured: true, days: parseInt(days) || 30 }),
  });
  if (data?.success) { showToast('Listing featured successfully', 'success'); loadFeatureRequests(); loadAdminListings(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function rejectFeature(listingId) {
  const data = await apiFetch(`/admin/listings/${listingId}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ is_featured: false }),
  });
  if (data?.success) { showToast('Feature request rejected', 'info'); loadFeatureRequests(); loadAdminListings(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function toggleFeatured(listingId, featured) {
  const data = await apiFetch(`/admin/listings/${listingId}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ is_featured: featured }),
  });
  if (data?.success) { showToast(featured ? 'Listing featured' : 'Removed from featured', 'success'); loadFeatureRequests(); loadAdminListings(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function setListingStatus(listingId, status) {
  if (status === 'ARCHIVED' && !confirm('Archive this listing?')) return;
  const data = await apiFetch(`/admin/listings/${listingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (data?.success) { showToast('Listing updated', 'success'); loadAdminListings(); }
  else showToast(data?.detail || 'Failed', 'error');
}


// ─── Bookings ─────────────────────────────────────────────────────────
async function loadAdminBookings(page = 1) {
  const el = document.getElementById('bookings-table-body');
  el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  const status = document.getElementById('booking-status-filter')?.value || '';
  const qs = buildQueryString({ page, per_page: 20, status });
  const data = await apiFetch(`/admin/bookings${qs}`);
  if (!data?.success) return;

  if (!data.data.items.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)">No bookings found</td></tr>';
    return;
  }

  el.innerHTML = data.data.items.map(b => `
    <tr>
      <td><small style="font-family:monospace">${b.id.slice(0, 8)}…</small></td>
      <td>${b.customer_name || b.customer_email || '—'}<br><small style="color:var(--text-secondary)">${b.customer_email || ''}</small></td>
      <td>${b.listing_title || '—'}</td>
      <td>${b.booking_date || '—'}</td>
      <td>BWP ${Number(b.total_amount || 0).toLocaleString()}</td>
      <td>${getStatusBadge(b.status)}</td>
    </tr>
  `).join('');

  const pag = document.getElementById('bookings-pagination');
  if (pag) pag.innerHTML = renderPagination(data.data.page, Math.ceil(data.data.total / 20), 'loadAdminBookings');
}


// ─── Reviews ──────────────────────────────────────────────────────────
async function loadAdminReviews(page = 1) {
  const el = document.getElementById('reviews-table-body');
  el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  const filter = document.getElementById('review-filter')?.value;
  const is_published = filter === 'published' ? true : filter === 'hidden' ? false : null;
  const search = document.getElementById('review-search')?.value || '';
  const qs = buildQueryString({ page, per_page: 20, is_published: is_published !== null ? is_published : '', search });
  const data = await apiFetch(`/admin/reviews${qs}`);
  if (!data?.success) return;

  if (!data.data.items.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)">No reviews found</td></tr>';
    return;
  }

  el.innerHTML = data.data.items.map(r => `
    <tr>
      <td><strong>${r.author_name || r.author_email || '—'}</strong><br><small style="color:var(--text-secondary)">${r.author_email || ''}</small></td>
      <td><a href="/listing/${r.listing_id}" style="color:var(--teal)">${r.listing_title || '—'}</a></td>
      <td>${renderStarRow(r.rating, 12)} <span style="font-size:0.8rem;color:var(--text-secondary)">${r.rating}/5</span></td>
      <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.comment || '—'}</td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
      <td style="display:flex;gap:0.4rem">
        <button class="btn btn-sm btn-ghost" style="display:flex;align-items:center;gap:0.35rem" onclick="toggleReviewPublish('${r.id}', ${!r.is_published})">
          ${r.is_published ? `${icon('eye-off', 14)} Hide` : `${icon('eye', 14)} Show`}
        </button>
        <button class="btn btn-sm" style="background:var(--danger);color:white;font-size:0.78rem;display:flex;align-items:center;gap:0.35rem" onclick="deleteReview('${r.id}')">${icon('trash-2', 14)}</button>
      </td>
    </tr>
  `).join('');

  const pag = document.getElementById('reviews-pagination');
  if (pag) pag.innerHTML = renderPagination(data.data.page, Math.ceil(data.data.total / 20), 'loadAdminReviews');
}

async function toggleReviewPublish(reviewId, published) {
  const data = await apiFetch(`/admin/reviews/${reviewId}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ is_published: published }),
  });
  if (data?.success) { showToast(published ? 'Review published' : 'Review hidden', 'success'); loadAdminReviews(); }
  else showToast(data?.detail || 'Failed', 'error');
}

async function deleteReview(reviewId) {
  if (!confirm('Permanently delete this review?')) return;
  const data = await apiFetch(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
  if (data?.success) { showToast('Review deleted', 'success'); loadAdminReviews(); }
  else showToast(data?.detail || 'Failed', 'error');
}


// ─── Categories ───────────────────────────────────────────────────────
async function loadAdminCategories() {
  const el = document.getElementById('categories-list');
  el.innerHTML = '<div class="spinner" style="margin:2rem auto"></div>';

  const data = await apiFetch('/admin/categories');
  if (!data?.success) return;

  if (!data.data.length) {
    el.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem">No categories yet. Create one above.</p>';
    return;
  }

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:var(--secondary);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.05em">
          <th style="padding:0.75rem 1rem;text-align:left">Name</th>
          <th style="padding:0.75rem 1rem;text-align:left">Slug</th>
          <th style="padding:0.75rem 1rem;text-align:left">Icon</th>
          <th style="padding:0.75rem 1rem;text-align:left">Listings</th>
          <th style="padding:0.75rem 1rem;text-align:left">Status</th>
          <th style="padding:0.75rem 1rem;text-align:left">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data.data.map(c => `
          <tr style="border-bottom:1px solid var(--border-color)">
            <td style="padding:0.875rem 1rem;font-weight:600">${c.name}</td>
            <td style="padding:0.875rem 1rem;font-family:monospace;font-size:0.8rem;color:var(--text-secondary)">${c.slug}</td>
            <td style="padding:0.875rem 1rem">${c.icon || '—'}</td>
            <td style="padding:0.875rem 1rem">${c.listing_count}</td>
            <td style="padding:0.875rem 1rem"><span class="badge badge-${c.is_active ? 'success' : 'gray'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
            <td style="padding:0.875rem 1rem;display:flex;gap:0.4rem">
              <button class="btn btn-ghost btn-sm" onclick="editCategory('${c.id}','${c.name}','${c.icon || ''}','${c.slug}')">Edit</button>
              <button class="btn btn-sm" style="background:var(--danger);color:white;font-size:0.78rem" onclick="deleteCategory('${c.id}','${c.listing_count}')">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function editCategory(id, name, icon, slug) {
  document.getElementById('cat-modal-title').textContent = 'Edit Category';
  document.getElementById('cat-id').value = id;
  document.getElementById('cat-name').value = name;
  document.getElementById('cat-icon').value = icon;
  document.getElementById('cat-slug').value = slug;
  document.getElementById('cat-modal').style.display = 'flex';
}

function openAddCategoryModal() {
  document.getElementById('cat-modal-title').textContent = 'New Category';
  document.getElementById('cat-id').value = '';
  document.getElementById('cat-form').reset();
  document.getElementById('cat-modal').style.display = 'flex';
}

function closeCategoryModal() {
  document.getElementById('cat-modal').style.display = 'none';
}

async function saveCategoryForm(e) {
  e.preventDefault();
  const id = document.getElementById('cat-id').value;
  const body = {
    name: document.getElementById('cat-name').value,
    icon: document.getElementById('cat-icon').value,
    slug: document.getElementById('cat-slug').value,
  };
  const url = id ? `/admin/categories/${id}` : '/admin/categories';
  const method = id ? 'PATCH' : 'POST';
  const data = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (data?.success) {
    showToast(id ? 'Category updated' : 'Category created', 'success');
    closeCategoryModal();
    loadAdminCategories();
  } else {
    showToast(data?.detail || 'Failed', 'error');
  }
}

async function deleteCategory(id, count) {
  if (count > 0) { showToast(`Cannot delete: ${count} listings use this category`, 'error'); return; }
  if (!confirm('Delete this category?')) return;
  const data = await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
  if (data?.success) { showToast('Category deleted', 'success'); loadAdminCategories(); }
  else showToast(data?.detail || 'Failed', 'error');
}


// ─── Revenue ──────────────────────────────────────────────────────────
async function loadAdminRevenue() {
  const data = await apiFetch('/admin/revenue');
  if (!data?.success) return;
  const d = data.data;

  document.getElementById('revenue-stats').innerHTML = `
    <div class="stat-card" style="border-color:var(--orange)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">BWP ${d.total_gross.toLocaleString()}</div><div class="stat-label">Gross Revenue</div></div>
        <div class="stat-icon" style="background:#fef9c3">${icon('credit-card', 20)}</div>
      </div>
    </div>
    <div class="stat-card" style="border-color:var(--teal)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">BWP ${d.total_commission.toLocaleString()}</div><div class="stat-label">Platform Commission</div></div>
        <div class="stat-icon">${icon('dollar-sign', 20)}</div>
      </div>
    </div>
    <div class="stat-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div><div class="stat-value">${d.total_paid_bookings}</div><div class="stat-label">Paid Bookings</div></div>
        <div class="stat-icon">${icon('calendar', 20)}</div>
      </div>
    </div>
  `;

  const topVendorEl = document.getElementById('top-vendors-table');
  topVendorEl.innerHTML = d.top_vendors.length
    ? d.top_vendors.map((v, i) => `
        <tr>
          <td style="padding:0.75rem 1rem">${i + 1}</td>
          <td style="padding:0.75rem 1rem"><strong>${v.name || v.email}</strong></td>
          <td style="padding:0.75rem 1rem">${v.bookings}</td>
          <td style="padding:0.75rem 1rem;font-weight:600;color:var(--teal)">BWP ${v.revenue.toLocaleString()}</td>
        </tr>`).join('')
    : '<tr><td colspan="4" style="text-align:center;padding:1.5rem;color:var(--text-secondary)">No revenue data yet</td></tr>';

  const byCatEl = document.getElementById('by-category-table');
  byCatEl.innerHTML = d.by_category.length
    ? d.by_category.map(c => `
        <tr>
          <td style="padding:0.75rem 1rem"><strong>${c.name}</strong></td>
          <td style="padding:0.75rem 1rem">${c.bookings}</td>
          <td style="padding:0.75rem 1rem;font-weight:600;color:var(--teal)">BWP ${c.revenue.toLocaleString()}</td>
        </tr>`).join('')
    : '<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--text-secondary)">No data yet</td></tr>';
}


// ─── Shared helpers ───────────────────────────────────────────────────
function getStatusBadge(status) {
  const map = {
    CONFIRMED: 'badge-success', COMPLETED: 'badge-success',
    PENDING: 'badge-warning',   PENDING_PAYMENT: 'badge-warning',
    CANCELLED: 'badge-danger',  REJECTED: 'badge-danger', FAILED: 'badge-danger',
    ACTIVE: 'badge-success',    DRAFT: 'badge-gray', ARCHIVED: 'badge-danger',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

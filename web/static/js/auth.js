// Auth state management — runs on every page load
(function initAuth() {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      // Show logged-in elements, hide logged-out ones
      document.querySelectorAll('.auth-show').forEach(el => el.style.display = 'flex');
      document.querySelectorAll('.auth-hide').forEach(el => el.style.display = 'none');

      const initial = (user.profile?.first_name || user.email || '?')[0].toUpperCase();
      document.querySelectorAll('#nav-avatar-initials').forEach(el => el.textContent = initial);

      window.__userRole = user.role;
      window.__userId = user.id;
      window.__currentUser = user;

      if (user.role === 'VENDOR' || user.role === 'ADMIN') {
        document.querySelectorAll('.vendor-only').forEach(el => el.style.display = 'flex');
      }
      if (user.role === 'ADMIN') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
      }
    } catch {
      clearAuth();
    }
  }
})();

async function loadCurrentUser() {
  const data = await apiFetch('/auth/me');
  if (data?.success) {
    localStorage.setItem('user', JSON.stringify(data.data));
    window.__userRole = data.data.role;
    window.__userId = data.data.id;
    window.__currentUser = data.data;
    return data.data;
  }
  return null;
}

function requireAuth(redirectTo = '/login') {
  if (!localStorage.getItem('access_token')) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function requireRole(role) {
  const userStr = localStorage.getItem('user');
  if (!userStr) { window.location.href = '/login'; return false; }
  const user = JSON.parse(userStr);
  if (user.role !== role) { window.location.href = '/'; return false; }
  return true;
}

async function logout() {
  const refresh = localStorage.getItem('refresh_token');
  if (refresh) {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => {});
  }
  clearAuth();
  window.location.href = '/';
}

// Dropdown toggle for user menu
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('[data-dropdown]');
  dropdownToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = document.getElementById(btn.dataset.dropdown);
      if (!target) return;
      const parent = target.closest('.dropdown');
      parent?.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  });

  const logoutBtns = document.querySelectorAll('[data-action="logout"]');
  logoutBtns.forEach(btn => btn.addEventListener('click', logout));
});

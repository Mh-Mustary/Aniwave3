// ============================================================
// Auth — Supabase login / signup / logout
// Depends on: Supabase JS CDN, config.js
// ============================================================

let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// Returns the current session token for API calls
async function getAuthToken() {
  const { data } = await getSupabase().auth.getSession();
  return data?.session?.access_token || null;
}

// Returns the current user object or null
async function getCurrentUser() {
  const { data } = await getSupabase().auth.getUser();
  return data?.user || null;
}

// Sign up with email + password
async function signUp(email, password) {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Log in with email + password
async function logIn(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Log out
async function logOut() {
  await getSupabase().auth.signOut();
  updateAuthUI(null);
}

// Called on page load and after login/logout
async function initAuth() {
  const user = await getCurrentUser();
  updateAuthUI(user);

  // Listen for auth state changes
  getSupabase().auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session?.user || null);
  });
}

function updateAuthUI(user) {
  const loginBtn = document.getElementById('loginBtn');
  const userBadge = document.getElementById('userBadge');
  const membersOnlyItems = document.querySelectorAll('[data-members-only]');

  if (user) {
    if (loginBtn) loginBtn.textContent = 'Log out';
    if (loginBtn) loginBtn.onclick = logOut;
    if (userBadge) {
      userBadge.textContent = user.email[0].toUpperCase();
      userBadge.title = user.email;
    }
    membersOnlyItems.forEach(el => el.classList.remove('locked'));
  } else {
    if (loginBtn) loginBtn.textContent = 'Log in';
    if (loginBtn) loginBtn.onclick = showAuthModal;
    if (userBadge) userBadge.textContent = '川';
    membersOnlyItems.forEach(el => el.classList.add('locked'));
  }
}

// Simple modal for login/signup
function showAuthModal(mode = 'login') {
  const existing = document.getElementById('authModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  `;
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 28px; width: 320px; max-width: 90vw; position: relative;">
      <button onclick="document.getElementById('authModal').remove()"
        style="position:absolute;top:12px;right:14px;background:none;border:none;font-size:18px;cursor:pointer;color:#888;">✕</button>
      <h2 style="font-size:18px;font-weight:500;margin-bottom:4px;" id="modalTitle">${mode === 'login' ? 'Welcome back' : 'Join AnimeWave'}</h2>
      <p style="font-size:13px;color:#888;margin-bottom:20px;">${mode === 'login' ? 'Log in to vote and access exclusive content.' : 'Free account — no credit card needed.'}</p>
      <input type="email" id="authEmail" placeholder="Email" style="width:100%;margin-bottom:10px;padding:9px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;">
      <input type="password" id="authPassword" placeholder="Password" style="width:100%;margin-bottom:14px;padding:9px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;">
      <div id="authError" style="color:#c0392b;font-size:12px;margin-bottom:10px;display:none;"></div>
      <button id="authSubmit" onclick="handleAuthSubmit('${mode}')"
        style="width:100%;padding:10px;background:#FBEAF0;border:1px solid #ED93B1;border-radius:8px;font-size:14px;font-weight:500;color:#993556;cursor:pointer;">
        ${mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <p style="font-size:12px;color:#aaa;text-align:center;margin-top:12px;">
        ${mode === 'login'
          ? `No account? <a href="#" onclick="showAuthModal('signup');return false;" style="color:#D4537E;">Sign up free</a>`
          : `Already a member? <a href="#" onclick="showAuthModal('login');return false;" style="color:#D4537E;">Log in</a>`}
      </p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

async function handleAuthSubmit(mode) {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const errEl = document.getElementById('authError');
  const btn = document.getElementById('authSubmit');

  errEl.style.display = 'none';
  btn.textContent = 'Please wait...';
  btn.disabled = true;

  try {
    if (mode === 'signup') await signUp(email, password);
    else await logIn(email, password);
    document.getElementById('authModal').remove();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.textContent = mode === 'login' ? 'Log in' : 'Create account';
    btn.disabled = false;
  }
}

(() => {
  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM elements
  const loginSection = document.getElementById('loginSection');
  const adminConsoleSection = document.getElementById('adminConsoleSection');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  const logoutBtn = document.getElementById('logoutBtn');
  const pageTitle = document.getElementById('pageTitle');
  const messageEl = document.getElementById('adminMessage');
  const form = document.getElementById('createAdminForm');

  // Show/hide sections based on auth state
  const showLogin = () => {
    if (loginSection) loginSection.classList.remove('hidden');
    if (adminConsoleSection) adminConsoleSection.classList.add('hidden');
    if (pageTitle) pageTitle.textContent = 'Secure Access';
  };

  const showAdminConsole = () => {
    if (loginSection) loginSection.classList.add('hidden');
    if (adminConsoleSection) adminConsoleSection.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = 'Admin management';
  };

  // Session management using localStorage
  const setSession = (superAdminData) => {
    localStorage.setItem('superadmin_session', JSON.stringify({
      email: superAdminData.email,
      name: superAdminData.name,
      id: superAdminData.id,
      timestamp: Date.now()
    }));
  };

  const getSession = () => {
    const sessionData = localStorage.getItem('superadmin_session');
    if (!sessionData) return null;
    try {
      const session = JSON.parse(sessionData);
      // Check if session is still valid (24 hours)
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('superadmin_session');
        return null;
      }
      return session;
    } catch {
      return null;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('superadmin_session');
  };

  // Check authentication status
  const checkAuth = async () => {
    const session = getSession();
    if (session) {
      // Verify session is still valid by checking table
      const { data, error } = await supabase
        .from('Superadmin')
        .select('id, email, name, is_active')
        .eq('email', session.email)
        .eq('id', session.id)
        .single();

      if (error || !data || !data.is_active) {
        clearSession();
        showLogin();
        return;
      }

      showAdminConsole();
    } else {
      showLogin();
    }
  };

  // Login handler - verify against Superadmin table
  const handleLogin = async (evt) => {
    evt.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value || '';

    if (!email || !password) {
      showLoginMessage('Please enter email and password.', 'error');
      return;
    }

    showLoginMessage('Signing in...');

    // Query Superadmin table to verify credentials
    const { data, error } = await supabase
      .from('Superadmin')
      .select('id, email, name, password, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      showLoginMessage('Invalid email or password.', 'error');
      return;
    }

    // Note: In production, passwords should be hashed. For now, we'll do a simple comparison
    // You should use bcrypt or similar for production
    if (data.password !== password) {
      showLoginMessage('Invalid email or password.', 'error');
      return;
    }

    // Set session
    setSession({
      id: data.id,
      email: data.email,
      name: data.name
    });

    showLoginMessage('Login successful!', 'success');
    setTimeout(() => {
      showAdminConsole();
    }, 500);
  };

  // Logout handler
  const handleLogout = async () => {
    clearSession();
    showLogin();
    if (loginForm) loginForm.reset();
    if (loginMessage) {
      loginMessage.textContent = '';
      loginMessage.classList.add('hidden');
    }
  };

  // Message handlers
  const showLoginMessage = (text, type = 'info') => {
    if (!loginMessage) return;
    loginMessage.textContent = text;
    loginMessage.classList.remove('hidden', 'success', 'error');
    if (type === 'success') loginMessage.classList.add('success');
    if (type === 'error') loginMessage.classList.add('error');
  };

  // Admin mode switching (only for buttons with data-mode, not links)
  const modeButtons = document.querySelectorAll('.admin-mode-switch .mode-btn[data-mode]');
  const modeSections = document.querySelectorAll('.admin-mode');

  const switchMode = (mode) => {
    modeButtons.forEach(btn => {
      const btnMode = btn.getAttribute('data-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      }
    });

    modeSections.forEach(section => {
      const sectionMode = section.getAttribute('data-mode');
      if (sectionMode === mode) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });
  };

  if (modeButtons.length > 0) {
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-mode');
        switchMode(mode);
      });
    });
  }

  const showMessage = (text, type = 'info') => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden', 'success', 'error');
    if (type === 'success') messageEl.classList.add('success');
    if (type === 'error') messageEl.classList.add('error');
  };

  const clearMessage = () => {
    if (!messageEl) return;
    messageEl.textContent = '';
    messageEl.classList.add('hidden');
    messageEl.classList.remove('success', 'error');
  };

  // Create admin handler
  const handleCreateAdmin = async (evt) => {
    evt.preventDefault();
    clearMessage();
    const name = document.getElementById('adminName')?.value?.trim();
    const email = document.getElementById('adminEmail')?.value?.trim();
    const username = document.getElementById('adminUsername')?.value?.trim();
    const role = document.getElementById('adminRole')?.value;
    const password = document.getElementById('adminPassword')?.value || '';
    const confirm = document.getElementById('adminPasswordConfirm')?.value || '';
    const pin = document.getElementById('adminPin')?.value?.trim() || null;

    if (!name || !email || !username || !role || !password || !confirm) {
      showMessage('Please fill all required fields.', 'error');
      return;
    }
    if (password !== confirm) {
      showMessage('Passwords do not match.', 'error');
      return;
    }

    showMessage('Creating admin...');

    // Create user in Supabase Auth (using signUp for regular flow)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      showMessage(authError.message || 'Unable to create admin user.', 'error');
      return;
    }

    if (!authData.user) {
      showMessage('Failed to create user account.', 'error');
      return;
    }

    // Insert admin record into admin table
    const { data, error } = await supabase
      .from('admin')
      .insert([{ 
        name, 
        email, 
        username,
        password, // Note: In production, hash this password
        pin,
        role,
        is_active: true
      }]);

    if (error) {
      showMessage(error.message || 'Admin created but failed to save details.', 'error');
      return;
    }

    showMessage('Admin created successfully!', 'success');
    console.info('Supabase insert result:', data);
    form?.reset();
  };

  // Event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (form) {
    form.addEventListener('submit', handleCreateAdmin);
  }

  // Manage admins link with confirmation

  // Check auth on page load
  checkAuth();
})();


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

  // State for OTP
  let pendingAdminData = null;
  let currentOtp = null;

  // Login handler - verify against Superadmin table
  const handleLogin = async (evt) => {
    evt.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value || '';

    if (!email || !password) {
      showLoginMessage('Please enter email and password.', 'error');
      return;
    }

    showLoginMessage('Verifying credentials...');

    // Query Superadmin table to verify credentials including phone
    const { data, error } = await supabase
      .from('Superadmin')
      .select('id, email, name, password, is_active, phone')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      showLoginMessage('Invalid email or password.', 'error');
      return;
    }

    // Password verification
    if (data.password !== password) {
      showLoginMessage('Invalid email or password.', 'error');
      return;
    }

    // Credentials valid, initiate OTP flow
    pendingAdminData = data;
    initiateOtpFlow();
  };

  // OTP Logic
  const initiateOtpFlow = async () => {
    const otpPopup = document.getElementById('otpPopup');
    if (!otpPopup) return;

    // Generate 4-digit OTP
    currentOtp = Math.floor(1000 + Math.random() * 9000).toString();
    // Send OTP using Notification Service
    const result = await NotificationService.sendOtp(
      pendingAdminData.email,
      pendingAdminData.phone,
      currentOtp,
      pendingAdminData.name
    );

    // Show user feedback
    let msg = `Code sent to ${pendingAdminData.email}`;
    if (result.sms) {
      msg += ` and ${pendingAdminData.phone}`;
    } else if (pendingAdminData.phone) {
      console.log('SMS could not be sent (No provider configured)');
    }

    document.querySelector('.popup-message').textContent = msg;

    // Show popup
    otpPopup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Reset OTP inputs
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => input.value = '');
    inputs[0]?.focus();
    setupOtpInputs();
  };

  const setupOtpInputs = () => {
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach((input, index) => {
      // Auto-focus next input and check for completion
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          } else {
            // Last digit entered, trigger verification
            const allFilled = Array.from(inputs).every(i => i.value.length === 1);
            if (allFilled) {
              // Call verify directly
              verifyOtpLogic();
            }
          }
        }
      });

      // Handle backspace
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
          if (index > 0) inputs[index - 1].focus();
        }
      });

      // Paste handler
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^\d{4}$/.test(text)) return;
        const digits = text.split('');
        inputs.forEach((inp, i) => inp.value = digits[i] || '');
        inputs[3]?.focus();
      });
    });
  };

  const showOtpMessage = (text, type = 'info') => {
    const el = document.getElementById('otpMessage');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden', 'success', 'error');
    el.style.color = type === 'error' ? '#ef4444' : (type === 'success' ? '#10b981' : 'inherit');
  };

  // Core Verification Logic
  const verifyOtpLogic = () => {
    const inputs = document.querySelectorAll('.otp-digit');
    const enteredOtp = Array.from(inputs).map(i => i.value).join('');

    if (enteredOtp.length !== 4) {
      showOtpMessage('Please enter the complete 4-digit code.', 'error');
      return;
    }

    if (enteredOtp !== currentOtp) {
      showOtpMessage('Invalid code. Please try again.', 'error');
      inputs.forEach(i => i.classList.add('error-shake'));
      setTimeout(() => inputs.forEach(i => i.classList.remove('error-shake')), 500);
      return;
    }

    // OTP Verified
    showOtpMessage('Verified! Logging in...', 'success');

    // Complete Login
    setSession({
      id: pendingAdminData.id,
      email: pendingAdminData.email,
      name: pendingAdminData.name
    });

    setTimeout(() => {
      document.getElementById('otpPopup').classList.add('hidden');
      document.body.style.overflow = '';
      showAdminConsole();
    }, 1000);
  };

  // Legacy/Form Handler
  const handleOtpVerify = (e) => {
    if (e) e.preventDefault();
    verifyOtpLogic();
  };

  // Close OTP Popup
  document.getElementById('closeOtpPopup')?.addEventListener('click', () => {
    document.getElementById('otpPopup').classList.add('hidden');
    document.body.style.overflow = '';
    showLoginMessage('Login cancelled.', 'info');
    pendingAdminData = null;
    currentOtp = null;
  });

  // Resend OTP
  document.getElementById('resendOtpBtn')?.addEventListener('click', () => {
    currentOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[DEV MODE] Resent OTP: ${currentOtp}`);
    showOtpMessage('New code sent.', 'success');
    // Clear inputs
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => input.value = '');
    inputs[0]?.focus();
  });

  // Attach OTP form listener
  const otpForm = document.getElementById('otpForm');
  if (otpForm) otpForm.addEventListener('submit', handleOtpVerify);

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


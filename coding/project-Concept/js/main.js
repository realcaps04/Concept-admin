(() => {
  const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
  const modeSections = Array.from(document.querySelectorAll('.login-mode'));
  const messageEl = document.getElementById('loginMessage');
  const signInButton = document.getElementById('signInButton');

  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

  // Show inactive admin popup
  const showInactivePopup = (email, name) => {
    const inactivePopup = document.getElementById('inactivePopup');
    const activationMessage = document.getElementById('activationMessage');
    if (inactivePopup) {
      inactivePopup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      // Store email for activation request
      inactivePopup.dataset.adminEmail = email;
      inactivePopup.dataset.adminName = name || '';
      if (activationMessage) {
        activationMessage.textContent = '';
      }
    }
  };

  // Hide inactive popup
  const hideInactivePopup = () => {
    const inactivePopup = document.getElementById('inactivePopup');
    if (inactivePopup) {
      inactivePopup.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  // Handle activation request
  const handleActivationRequest = async () => {
    const inactivePopup = document.getElementById('inactivePopup');
    const activationMessage = document.getElementById('activationMessage');
    const sendBtn = document.getElementById('sendActivationRequestBtn');
    
    if (!inactivePopup) return;

    const email = inactivePopup.dataset.adminEmail;
    const name = inactivePopup.dataset.adminName || '';

    if (!email) {
      if (activationMessage) {
        activationMessage.textContent = 'Error: Email not found.';
        activationMessage.style.color = '#ef4444';
      }
      return;
    }

    // Disable button
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span>Sending Request...</span>';
    }

    if (activationMessage) {
      activationMessage.textContent = 'Sending activation request...';
      activationMessage.style.color = '#4a84e8';
    }

    try {
      // Insert activation request into database
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .insert([{
          admin_email: email,
          admin_name: name,
          status: 'pending',
          requested_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error sending activation request:', error);
        if (activationMessage) {
          activationMessage.textContent = 'Failed to send request. Please try again.';
          activationMessage.style.color = '#ef4444';
        }
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.innerHTML = '<span>Send Activation Request</span><span class="glow"></span>';
        }
        return;
      }

      // Success
      if (activationMessage) {
        activationMessage.textContent = 'Activation request sent successfully! The super admin will review your request.';
        activationMessage.style.color = '#10b981';
      }
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span>Request Sent</span>';
      }

      // Auto-close popup after 3 seconds
      setTimeout(() => {
        hideInactivePopup();
        // Clear form
        document.getElementById('emailInput')?.value && (document.getElementById('emailInput').value = '');
        document.getElementById('passwordInput')?.value && (document.getElementById('passwordInput').value = '');
        document.getElementById('usernameInput')?.value && (document.getElementById('usernameInput').value = '');
        document.getElementById('pinInput')?.value && (document.getElementById('pinInput').value = '');
      }, 3000);

    } catch (err) {
      console.error('Error:', err);
      if (activationMessage) {
        activationMessage.textContent = 'An error occurred. Please try again later.';
        activationMessage.style.color = '#ef4444';
      }
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span>Send Activation Request</span><span class="glow"></span>';
      }
    }
  };

  const setActiveMode = (mode) => {
    modeButtons.forEach((btn) => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    modeSections.forEach((section) => {
      const isMatch = section.dataset.mode === mode;
      section.classList.toggle('hidden', !isMatch);
    });

    clearMessage();
  };

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => setActiveMode(btn.dataset.mode));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveMode(btn.dataset.mode);
      }
    });
  });

  const getActiveMode = () => {
    const active = modeButtons.find((btn) => btn.classList.contains('active'));
    return active ? active.dataset.mode : 'email';
  };

  const handleEmailPasswordLogin = async () => {
    const email = document.getElementById('emailInput')?.value?.trim();
    const password = document.getElementById('passwordInput')?.value || '';
    if (!email || !password) {
      showMessage('Enter email and password to continue.', 'error');
      return;
    }
    showMessage('Signing in...');
    
    // Query admin table to verify credentials (without checking is_active first)
    const { data, error } = await supabase
      .from('admin')
      .select('id, name, email, username, role, is_active')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      showMessage('Invalid email or password.', 'error');
      return;
    }

    // Check if admin is inactive
    if (!data.is_active) {
      showMessage('', 'info'); // Clear any existing message
      showInactivePopup(email, data.name);
      return;
    }

    // Store session data
    localStorage.setItem('adminSession', JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      loginTime: new Date().toISOString()
    }));

    showMessage('Signed in successfully. Redirecting...', 'success');
    
    // Redirect to admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1000);
  };

  const handleUsernamePinLogin = async () => {
    const username = document.getElementById('usernameInput')?.value?.trim();
    const pin = document.getElementById('pinInput')?.value || '';
    if (!username || !pin) {
      showMessage('Enter username and PIN to continue.', 'error');
      return;
    }
    showMessage('Signing in...');
    
    // Query admin table to verify credentials (without checking is_active first)
    const { data, error } = await supabase
      .from('admin')
      .select('id, name, email, username, role, is_active')
      .eq('username', username)
      .eq('pin', pin)
      .single();

    if (error || !data) {
      showMessage('Invalid username or PIN.', 'error');
      return;
    }

    // Check if admin is inactive
    if (!data.is_active) {
      showMessage('', 'info'); // Clear any existing message
      showInactivePopup(data.email, data.name);
      return;
    }

    // Store session data
    localStorage.setItem('adminSession', JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      loginTime: new Date().toISOString()
    }));

    showMessage('Signed in successfully. Redirecting...', 'success');
    
    // Redirect to admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1000);
  };

  const handleFingerprintLogin = () => {
    showMessage('Fingerprint flow not implemented in web demo.', 'info');
  };

  const handleLogin = () => {
    const mode = getActiveMode();
    if (mode === 'email') return handleEmailPasswordLogin();
    if (mode === 'username') return handleUsernamePinLogin();
    if (mode === 'fingerprint') return handleFingerprintLogin();
  };

  if (signInButton) {
    signInButton.addEventListener('click', handleLogin);
  }

  // Add Enter key support for form submission
  const passwordInput = document.getElementById('passwordInput');
  const pinInput = document.getElementById('pinInput');
  
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && getActiveMode() === 'email') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && getActiveMode() === 'username') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  // Event listener for activation request button
  const sendActivationRequestBtn = document.getElementById('sendActivationRequestBtn');
  if (sendActivationRequestBtn) {
    sendActivationRequestBtn.addEventListener('click', handleActivationRequest);
  }

  // Close inactive popup with ESC key
  document.addEventListener('keydown', (e) => {
    const inactivePopup = document.getElementById('inactivePopup');
    if (e.key === 'Escape' && inactivePopup && !inactivePopup.classList.contains('hidden')) {
      hideInactivePopup();
    }
  });

  // Close popup when clicking outside
  const inactivePopup = document.getElementById('inactivePopup');
  if (inactivePopup) {
    inactivePopup.addEventListener('click', (e) => {
      if (e.target === inactivePopup) {
        hideInactivePopup();
      }
    });
  }
})();


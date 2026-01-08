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

  // Check for rejected activation requests
  const checkRejectedRequest = async (email) => {
    try {
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .select('id, notes, processed_at, status')
        .eq('admin_email', email)
        .eq('status', 'rejected')
        .order('processed_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error checking rejected request:', err);
      return null;
    }
  };

  // Check for pending activation requests
  const checkPendingRequest = async (email) => {
    try {
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .select('id, status, requested_at')
        .eq('admin_email', email)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error checking pending request:', err);
      return null;
    }
  };

  // Fetch admin details from admin table
  const fetchAdminDetails = async (email) => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('id, name, email, phone, address, city, state, zip_code, country')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching admin details:', err);
      return null;
    }
  };

  // Show inactive admin popup
  const showInactivePopup = async (email, name) => {
    const inactivePopup = document.getElementById('inactivePopup');
    const activationMessage = document.getElementById('activationMessage');
    const rejectionDetails = document.getElementById('rejectionDetails');
    const rejectionNotes = document.getElementById('rejectionNotes');
    const rejectionDate = document.getElementById('rejectionDate');

    if (inactivePopup) {
      inactivePopup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      // Store email for activation request
      inactivePopup.dataset.adminEmail = email;
      inactivePopup.dataset.adminName = name || '';
      if (activationMessage) {
        activationMessage.textContent = '';
        activationMessage.classList.add('hidden');
      }

      // Check for pending request first (prevent duplicates)
      const pendingRequest = await checkPendingRequest(email);
      if (pendingRequest) {
        // Show message that request is already pending
        if (activationMessage) {
          activationMessage.textContent = 'You already have a pending activation request. Please wait for it to be processed.';
          activationMessage.style.color = '#f97316';
          activationMessage.classList.remove('hidden');
        }
        if (rejectionDetails) {
          rejectionDetails.classList.add('hidden');
        }
        const activationForm = document.getElementById('activationRequestForm');
        if (activationForm) {
          activationForm.classList.add('hidden');
        }
        return;
      }

      // Check for rejected request
      const rejectedRequest = await checkRejectedRequest(email);
      const activationForm = document.getElementById('activationRequestForm');

      if (rejectedRequest && rejectedRequest.notes) {
        // Show rejection details and hide form
        if (rejectionDetails) {
          rejectionDetails.classList.remove('hidden');
        }
        if (activationForm) {
          activationForm.classList.add('hidden');
        }
        if (rejectionNotes) {
          rejectionNotes.textContent = rejectedRequest.notes || 'No reason provided';
        }
        if (rejectionDate && rejectedRequest.processed_at) {
          const processedDate = new Date(rejectedRequest.processed_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          rejectionDate.textContent = `Rejected on: ${processedDate}`;
        }
      } else {
        // Hide rejection details and show form if no rejected request
        if (rejectionDetails) {
          rejectionDetails.classList.add('hidden');
        }
        if (activationForm) {
          activationForm.classList.remove('hidden');
        }

        // Load existing admin details from database
        const adminDetails = await fetchAdminDetails(email);
        if (adminDetails) {
          // Populate form fields with existing admin data
          const nameInput = document.getElementById('requestName');
          const phoneInput = document.getElementById('requestPhone');
          const addressInput = document.getElementById('requestAddress');
          const cityInput = document.getElementById('requestCity');
          const stateInput = document.getElementById('requestState');
          const zipCodeInput = document.getElementById('requestZipCode');
          const countryInput = document.getElementById('requestCountry');

          if (nameInput) nameInput.value = adminDetails.name || '';
          if (phoneInput) phoneInput.value = adminDetails.phone || '';
          if (addressInput) addressInput.value = adminDetails.address || '';
          if (cityInput) cityInput.value = adminDetails.city || '';
          if (stateInput) stateInput.value = adminDetails.state || '';
          if (zipCodeInput) zipCodeInput.value = adminDetails.zip_code || '';
          if (countryInput) countryInput.value = adminDetails.country || '';
        }
      }
    }
  };

  // Handle "Request Again" button click
  const handleRequestAgain = async () => {
    const rejectionDetails = document.getElementById('rejectionDetails');
    const activationForm = document.getElementById('activationRequestForm');
    const inactivePopup = document.getElementById('inactivePopup');

    if (rejectionDetails) {
      rejectionDetails.classList.add('hidden');
    }
    if (activationForm) {
      activationForm.classList.remove('hidden');
    }

    // Load existing admin details when showing form
    const email = inactivePopup?.dataset.adminEmail;
    if (email) {
      const adminDetails = await fetchAdminDetails(email);
      if (adminDetails) {
        // Populate form fields with existing admin data
        const nameInput = document.getElementById('requestName');
        const phoneInput = document.getElementById('requestPhone');
        const addressInput = document.getElementById('requestAddress');
        const cityInput = document.getElementById('requestCity');
        const stateInput = document.getElementById('requestState');
        const zipCodeInput = document.getElementById('requestZipCode');
        const countryInput = document.getElementById('requestCountry');

        if (nameInput) nameInput.value = adminDetails.name || '';
        if (phoneInput) phoneInput.value = adminDetails.phone || '';
        if (addressInput) addressInput.value = adminDetails.address || '';
        if (cityInput) cityInput.value = adminDetails.city || '';
        if (stateInput) stateInput.value = adminDetails.state || '';
        if (zipCodeInput) zipCodeInput.value = adminDetails.zip_code || '';
        if (countryInput) countryInput.value = adminDetails.country || '';
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

  // Close button event listener
  const closeInactivePopupBtn = document.getElementById('closeInactivePopup');
  if (closeInactivePopupBtn) {
    closeInactivePopupBtn.addEventListener('click', hideInactivePopup);
  }

  // Upload file to Supabase Storage
  const uploadIdentityProof = async (file, email) => {
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${email}_${Date.now()}.${fileExt}`;
      const filePath = `identity-proofs/${fileName}`;

      // Convert file to base64 for storage (alternative: use Supabase Storage bucket)
      // For now, we'll store as base64 in the database
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result, // Base64 data URL
            filename: fileName
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  // Handle activation request form submission
  const handleActivationRequest = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const inactivePopup = document.getElementById('inactivePopup');
    const activationMessage = document.getElementById('activationMessage');
    const sendBtn = document.getElementById('sendActivationRequestBtn');
    const activationForm = document.getElementById('activationRequestForm');

    if (!inactivePopup) return;

    const email = inactivePopup.dataset.adminEmail;

    // Check for pending request before allowing submission
    const pendingRequest = await checkPendingRequest(email);
    if (pendingRequest) {
      if (activationMessage) {
        activationMessage.textContent = 'You already have a pending activation request. Please wait for it to be processed.';
        activationMessage.style.color = '#f97316';
        activationMessage.classList.remove('hidden');
      }
      return;
    }

    const name = document.getElementById('requestName')?.value?.trim() || inactivePopup.dataset.adminName || '';
    const phone = document.getElementById('requestPhone')?.value?.trim() || null;
    const address = document.getElementById('requestAddress')?.value?.trim() || null;
    const city = document.getElementById('requestCity')?.value?.trim() || null;
    const state = document.getElementById('requestState')?.value?.trim() || null;
    const zipCode = document.getElementById('requestZipCode')?.value?.trim() || null;
    const country = document.getElementById('requestCountry')?.value?.trim() || null;
    const identityProof = document.getElementById('identityProof')?.files[0];
    const additionalNotes = document.getElementById('requestNotes')?.value?.trim() || null;

    if (!email) {
      if (activationMessage) {
        activationMessage.textContent = 'Error: Email not found.';
        activationMessage.style.color = '#ef4444';
        activationMessage.classList.remove('hidden');
      }
      return;
    }

    // Validate required fields
    if (!name || !phone || !identityProof) {
      if (activationMessage) {
        activationMessage.textContent = 'Please fill all required fields (Name, Phone, and Identity Proof).';
        activationMessage.style.color = '#ef4444';
        activationMessage.classList.remove('hidden');
      }
      return;
    }

    // Validate file size (max 5MB)
    if (identityProof.size > 5 * 1024 * 1024) {
      if (activationMessage) {
        activationMessage.textContent = 'File size must be less than 5MB.';
        activationMessage.style.color = '#ef4444';
        activationMessage.classList.remove('hidden');
      }
      return;
    }

    // Disable button
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span>Uploading & Sending Request...</span>';
    }

    if (activationMessage) {
      activationMessage.textContent = 'Uploading identity proof and sending request...';
      activationMessage.style.color = '#4a84e8';
      activationMessage.classList.remove('hidden');
    }

    try {
      // Upload identity proof
      let identityProofUrl = null;
      let identityProofFilename = null;

      if (identityProof) {
        const uploadResult = await uploadIdentityProof(identityProof, email);
        identityProofUrl = uploadResult.url;
        identityProofFilename = uploadResult.filename;
      }

      // Update admin table with contact information
      const adminUpdateData = {};
      if (name) adminUpdateData.name = name;
      if (phone) adminUpdateData.phone = phone;
      if (address) adminUpdateData.address = address;
      if (city) adminUpdateData.city = city;
      if (state) adminUpdateData.state = state;
      if (zipCode) adminUpdateData.zip_code = zipCode;
      if (country) adminUpdateData.country = country;

      if (Object.keys(adminUpdateData).length > 0) {
        const { error: adminUpdateError } = await supabase
          .from('admin')
          .update(adminUpdateData)
          .eq('email', email);

        if (adminUpdateError) {
          console.error('Error updating admin details:', adminUpdateError);
          // Continue with request submission even if admin update fails
        }
      }

      // Insert activation request into database
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .insert([{
          admin_email: email,
          admin_name: name,
          admin_phone: phone,
          admin_address: address,
          admin_city: city,
          admin_state: state,
          admin_zip_code: zipCode,
          admin_country: country,
          identity_proof_url: identityProofUrl,
          identity_proof_filename: identityProofFilename,
          additional_notes: additionalNotes,
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

      // Hide rejection details and form since new request is sent
      const rejectionDetails = document.getElementById('rejectionDetails');
      if (rejectionDetails) {
        rejectionDetails.classList.add('hidden');
      }
      if (activationForm) {
        activationForm.classList.add('hidden');
      }

      // Reset form
      if (activationForm) {
        activationForm.reset();
        document.getElementById('filePreview').textContent = '';
      }

      // Auto-close popup after 3 seconds
      setTimeout(() => {
        hideInactivePopup();
        // Clear login form
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

  // Handle file preview
  const handleFilePreview = () => {
    const fileInput = document.getElementById('identityProof');
    const filePreview = document.getElementById('filePreview');

    if (fileInput && filePreview) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileSize = (file.size / 1024 / 1024).toFixed(2);
          filePreview.textContent = `Selected: ${file.name} (${fileSize} MB)`;
          filePreview.style.color = '#10b981';
        } else {
          filePreview.textContent = '';
        }
      });
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

  // State for OTP
  let pendingAdminData = null;
  let currentOtp = null;

  const completeLogin = (data) => {
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
    document.getElementById('otpPopup').classList.add('hidden'); // Hide OTP popup

    // Redirect to admin dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'admin-dashboard.html';
    }, 1000);
  };

  const initiateOtpFlow = async () => {
    const otpPopup = document.getElementById('otpPopup');
    if (!otpPopup) return;

    // Generate 4-digit OTP
    currentOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Send OTP (Type = 'admin')
    const result = await NotificationService.sendOtp(
      pendingAdminData.email,
      pendingAdminData.phone, // Might be undefined, handled by service
      currentOtp,
      pendingAdminData.name,
      'admin' // Specify Admin type for template
    );

    // Show feedback
    let msg = `Code sent to ${pendingAdminData.email}`;
    // Since SMS is not active, we don't need to overcomplicate the feedback
    document.querySelector('.popup-message').textContent = msg;

    otpPopup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Reset OTP inputs
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach(input => input.value = '');
    inputs[0]?.focus();
    setupOtpInputs();

    // Hide main login message
    clearMessage();
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
            // Last digit entered, verify
            const allFilled = Array.from(inputs).every(i => i.value.length === 1);
            if (allFilled) verifyOtpLogic();
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
        verifyOtpLogic();
      });
    });
  };

  const verifyOtpLogic = () => {
    const inputs = document.querySelectorAll('.otp-digit');
    const enteredOtp = Array.from(inputs).map(i => i.value).join('');
    const otpMsg = document.getElementById('otpMessage');

    const showOtpError = (text) => {
      if (otpMsg) {
        otpMsg.textContent = text;
        otpMsg.classList.remove('hidden');
        otpMsg.classList.add('error');
        otpMsg.classList.remove('success');
      }
    };

    if (enteredOtp.length !== 4) return;

    if (enteredOtp !== currentOtp) {
      showOtpError('Invalid code. Please try again.');
      inputs.forEach(i => i.classList.add('error-shake'));
      setTimeout(() => inputs.forEach(i => i.classList.remove('error-shake')), 500);
      return;
    }

    if (otpMsg) {
      otpMsg.textContent = 'Verified!';
      otpMsg.classList.remove('hidden', 'error');
      otpMsg.classList.add('success');
    }

    completeLogin(pendingAdminData);
  };

  // Close OTP
  document.getElementById('closeOtpPopup')?.addEventListener('click', () => {
    document.getElementById('otpPopup').classList.add('hidden');
    document.body.style.overflow = '';
  });

  // Resend OTP
  document.getElementById('resendOtpBtn')?.addEventListener('click', () => {
    if (!pendingAdminData) return;
    initiateOtpFlow();
  });

  const handleEmailPasswordLogin = async () => {
    const email = document.getElementById('emailInput')?.value?.trim();
    const password = document.getElementById('passwordInput')?.value || '';
    if (!email || !password) {
      showMessage('Enter email and password to continue.', 'error');
      return;
    }
    showMessage('Verifying credentials...');

    // Query admin table to verify credentials
    const { data, error } = await supabase
      .from('admin')
      .select('id, name, email, username, role, is_active, phone')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      showMessage('Invalid email or password.', 'error');
      return;
    }

    // Check if admin is inactive
    if (!data.is_active) {
      showMessage('', 'info');
      showInactivePopup(email, data.name);
      return;
    }

    // Credentials valid, start OTP
    pendingAdminData = data;
    initiateOtpFlow();
  };

  const handleUsernamePinLogin = async () => {
    const username = document.getElementById('usernameInput')?.value?.trim();
    const pin = document.getElementById('pinInput')?.value || '';
    if (!username || !pin) {
      showMessage('Enter username and PIN to continue.', 'error');
      return;
    }
    showMessage('Verifying credentials...');

    // Query admin table to verify credentials
    const { data, error } = await supabase
      .from('admin')
      .select('id, name, email, username, role, is_active, phone')
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

    // Credentials valid, start OTP
    pendingAdminData = data;
    initiateOtpFlow();
  };

  const handleLogin = () => {
    const mode = getActiveMode();
    if (mode === 'email') return handleEmailPasswordLogin();
    if (mode === 'username') return handleUsernamePinLogin();
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

  // Event listener for activation request form
  const activationRequestForm = document.getElementById('activationRequestForm');
  if (activationRequestForm) {
    activationRequestForm.addEventListener('submit', handleActivationRequest);
  }

  // Event listener for "Request Again" button
  const requestAgainBtn = document.getElementById('requestAgainBtn');
  if (requestAgainBtn) {
    requestAgainBtn.addEventListener('click', handleRequestAgain);
  }

  // Initialize file preview
  handleFilePreview();

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
  // Interactive Background Bubbles
  const initInteractiveBubbles = () => {
    const container = document.querySelector('.cursor-animation-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Configuration
    const numBubbles = 20;
    const colors = ['#1e40af', '#6b21a8', '#166534', '#3730a3', '#1f2937'];
    const bubbles = [];

    // Create bubbles
    for (let i = 0; i < numBubbles; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('floating-bubble');

      // Varied size for depth
      const size = Math.random() * 60 + 15; // 15px to 75px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Visual styling
      const color = colors[Math.floor(Math.random() * colors.length)];
      bubble.style.background = color;
      bubble.style.borderRadius = '50%';
      bubble.style.position = 'absolute';
      bubble.style.pointerEvents = 'none';

      // Depth effects
      const isBackground = Math.random() > 0.5;
      bubble.style.opacity = isBackground ? '0.05' : '0.15';
      bubble.style.filter = `blur(${Math.random() * 3 + 1}px)`;
      bubble.style.zIndex = isBackground ? '-1' : '0';

      // Initial random position
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      container.appendChild(bubble);

      bubbles.push({
        el: bubble,
        x: x,
        y: y,
        baseX: x, // Store base position for relative movement
        baseY: y,
        vx: 0,
        vy: 0,
        friction: Math.random() * 0.05 + 0.92, // Smooth ease out
        spring: Math.random() * 0.002 + 0.001, // Gentleness of pull
        noiseSpeed: Math.random() * 0.005 + 0.002, // Drifting speed
        noiseOffset: Math.random() * 1000 // Unique random seed equivalent
      });
    }

    // Mouse tracking
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    // Smooth mouse interpolation
    const updateMouse = () => {
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      requestAnimationFrame(updateMouse);
    };
    updateMouse();

    // Animation loop
    const animate = () => {
      const time = Date.now();

      bubbles.forEach((bubble, index) => {
        // Calculate distance from mouse
        const dx = mouseX - bubble.x;
        const dy = mouseY - bubble.y;

        // Stronger Mouse Interaction
        // Bubbles are attracted to the mouse but keep a "orbit" feel
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Interaction radius covering most of the screen for global feel
        const maxDist = window.innerWidth * 0.8;

        if (dist < maxDist) {
          // Stronger pull factor
          const force = (maxDist - dist) / maxDist;

          // Different layers move at different speeds (parallax)
          // index 0 = fast (close), index N = slow (far)
          const depthFactor = (numBubbles - index) / numBubbles;

          // Move towards mouse velocity
          bubble.vx += dx * force * 0.002 * depthFactor;
          bubble.vy += dy * force * 0.002 * depthFactor;
        }

        // Continuous gentle noise movement (drifting)
        bubble.vx += Math.sin(time * bubble.noiseSpeed + bubble.noiseOffset) * 0.01;
        bubble.vy += Math.cos(time * bubble.noiseSpeed + bubble.noiseOffset) * 0.01;

        // Apply velocity with friction (dampening)
        bubble.vx *= 0.94;
        bubble.vy *= 0.94;

        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Soft screen wrapping
        const margin = 100;
        if (bubble.x < -margin) bubble.x = window.innerWidth + margin;
        if (bubble.x > window.innerWidth + margin) bubble.x = -margin;
        if (bubble.y < -margin) bubble.y = window.innerHeight + margin;
        if (bubble.y > window.innerHeight + margin) bubble.y = -margin;

        bubble.el.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`;
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  initInteractiveBubbles();
})();


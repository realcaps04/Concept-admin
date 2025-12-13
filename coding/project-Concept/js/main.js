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
})();


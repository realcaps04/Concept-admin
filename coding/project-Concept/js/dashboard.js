(() => {
  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Check if user is logged in
  const checkAuth = () => {
    const sessionData = localStorage.getItem('adminSession');
    if (!sessionData) {
      // Redirect to login if no session
      window.location.href = 'index.html';
      return null;
    }
    return JSON.parse(sessionData);
  };

  // DOM elements
  const profilePopup = document.getElementById('manageProfilePopup');
  const profileForm = document.getElementById('manageProfileForm');
  const closeProfilePopup = document.getElementById('closeProfilePopup');
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  const profileMessage = document.getElementById('profileMessage');
  const manageProfileCard = document.getElementById('manageProfileCard');

  // Show profile popup
  const showProfilePopup = () => {
    if (profilePopup) {
      profilePopup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      loadProfileData();
      // Re-initialize password toggles for dynamically loaded popup
      setTimeout(() => {
        if (window.initPasswordToggles) {
          window.initPasswordToggles();
        } else {
          // Trigger initialization by dispatching a custom event
          document.dispatchEvent(new Event('passwordTogglesInit'));
        }
      }, 100);
    }
  };

  // Hide profile popup
  const hideProfilePopup = () => {
    if (profilePopup) {
      profilePopup.classList.add('hidden');
      document.body.style.overflow = '';
      profileForm?.reset();
      if (profileMessage) {
        profileMessage.textContent = '';
        profileMessage.classList.add('hidden');
      }
    }
  };

  // Show message in profile form
  const showProfileMessage = (text, type = 'info') => {
    if (!profileMessage) return;
    profileMessage.textContent = text;
    profileMessage.classList.remove('hidden', 'success', 'error');
    if (type === 'success') profileMessage.classList.add('success');
    if (type === 'error') profileMessage.classList.add('error');
  };

  // Load profile data
  const loadProfileData = async () => {
    const session = checkAuth();
    if (!session) return;

    try {
      // Fetch latest admin data from Supabase
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('id', session.id)
        .single();

      if (error || !data) {
        showProfileMessage('Error loading profile data.', 'error');
        return;
      }

      // Check if admin is still active
      if (!data.is_active) {
        hideProfilePopup();
        showInactiveStatusPopup(data);
        return;
      }

      // Populate form fields
      document.getElementById('profileName').value = data.name || '';
      document.getElementById('profileUsername').value = data.username || '';
      document.getElementById('profileEmail').value = data.email || '';
      document.getElementById('profilePassword').value = ''; // Clear password field
      document.getElementById('profilePin').value = data.pin || '';
      // Populate contact info fields
      document.getElementById('profilePhone').value = data.phone || '';
      document.getElementById('profileAddress').value = data.address || '';
      document.getElementById('profileCity').value = data.city || '';
      document.getElementById('profileState').value = data.state || '';
      document.getElementById('profileZipCode').value = data.zip_code || '';
      document.getElementById('profileCountry').value = data.country || '';

      // Load Avatar
      if (data.avatar_url) {
        document.getElementById('profileAvatarPreview').src = data.avatar_url;
      } else {
        document.getElementById('profileAvatarPreview').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Admin')}&background=random`;
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      showProfileMessage('Error loading profile data.', 'error');
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (evt) => {
    evt.preventDefault();
    const session = checkAuth();
    if (!session) return;

    // Check admin status before submitting
    const adminData = await checkAdminStatus();
    if (adminData && !adminData.is_active) {
      hideProfilePopup();
      showInactiveStatusPopup(adminData);
      return;
    }

    showProfileMessage('Saving changes...');

    const name = document.getElementById('profileName')?.value?.trim();
    const username = document.getElementById('profileUsername')?.value?.trim();
    const email = document.getElementById('profileEmail')?.value?.trim();
    const password = document.getElementById('profilePassword')?.value?.trim();
    const pin = document.getElementById('profilePin')?.value?.trim() || null;
    // Get contact info fields
    const phone = document.getElementById('profilePhone')?.value?.trim() || null;
    const address = document.getElementById('profileAddress')?.value?.trim() || null;
    const city = document.getElementById('profileCity')?.value?.trim() || null;
    const state = document.getElementById('profileState')?.value?.trim() || null;
    const zipCode = document.getElementById('profileZipCode')?.value?.trim() || null;
    const country = document.getElementById('profileCountry')?.value?.trim() || null;

    if (!name || !username || !email) {
      showProfileMessage('Please fill all required fields.', 'error');
      return;
    }

    let avatarUrl = null;
    const avatarInput = document.getElementById('profileAvatarInput');

    if (avatarInput && avatarInput.files && avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        showProfileMessage('Failed to upload avatar: ' + uploadError.message, 'error');
        return;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    try {
      // Build update object - only include password if provided
      const updateData = {
        name,
        username,
        email,
        pin,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        country
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      // Only update password if a new one is provided
      if (password && password.length > 0) {
        updateData.password = password;
      }

      const { error } = await supabase
        .from('admin')
        .update(updateData)
        .eq('id', session.id);

      if (error) {
        showProfileMessage('Error updating profile: ' + error.message, 'error');
        return;
      }

      // Update session data
      const updatedSession = {
        ...session,
        name,
        username,
        email
      };
      localStorage.setItem('adminSession', JSON.stringify(updatedSession));

      showProfileMessage('Profile updated successfully!', 'success');
      setTimeout(() => {
        hideProfilePopup();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      showProfileMessage('An error occurred while updating profile.', 'error');
    }
  };

  // Check admin status from database
  const checkAdminStatus = async () => {
    const session = checkAuth();
    if (!session) return false;

    try {
      const { data, error } = await supabase
        .from('admin')
        .select('id, email, name, is_active')
        .eq('id', session.id)
        .single();

      if (error || !data) {
        return false;
      }

      return data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
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

  // Show inactive status popup and logout
  const showInactiveStatusPopup = async (adminData) => {
    const inactivePopup = document.getElementById('inactiveStatusPopup');
    const inactiveMessage = document.getElementById('inactiveStatusMessage');
    const sendRequestBtn = document.getElementById('sendInactiveRequestBtn');
    const closeInactiveBtn = document.getElementById('closeInactivePopupBtn');
    const rejectionDetails = document.getElementById('inactiveRejectionDetails');
    const rejectionNotes = document.getElementById('inactiveRejectionNotes');
    const rejectionDate = document.getElementById('inactiveRejectionDate');

    if (!inactivePopup) return;

    // Store admin data for activation request
    inactivePopup.dataset.adminEmail = adminData.email;
    inactivePopup.dataset.adminName = adminData.name || '';

    // Clear any existing messages
    if (inactiveMessage) {
      inactiveMessage.textContent = '';
      inactiveMessage.classList.add('hidden');
    }

    // Check for rejected request
    const rejectedRequest = await checkRejectedRequest(adminData.email);
    if (rejectedRequest && rejectedRequest.notes) {
      // Show rejection details
      if (rejectionDetails) {
        rejectionDetails.classList.remove('hidden');
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
      // Hide rejection details if no rejected request
      if (rejectionDetails) {
        rejectionDetails.classList.add('hidden');
      }
    }

    // Show popup
    inactivePopup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Logout immediately
    localStorage.removeItem('adminSession');

    // Populate form with existing admin data if available
    if (adminData.name) {
      const nameInput = document.getElementById('inactiveRequestName');
      if (nameInput) nameInput.value = adminData.name;
    }
    if (adminData.phone) {
      const phoneInput = document.getElementById('inactiveRequestPhone');
      if (phoneInput) phoneInput.value = adminData.phone;
    }
    if (adminData.address) {
      const addressInput = document.getElementById('inactiveRequestAddress');
      if (addressInput) addressInput.value = adminData.address;
    }
    if (adminData.city) {
      const cityInput = document.getElementById('inactiveRequestCity');
      if (cityInput) cityInput.value = adminData.city;
    }
    if (adminData.state) {
      const stateInput = document.getElementById('inactiveRequestState');
      if (stateInput) stateInput.value = adminData.state;
    }
    if (adminData.zip_code) {
      const zipInput = document.getElementById('inactiveRequestZipCode');
      if (zipInput) zipInput.value = adminData.zip_code;
    }
    if (adminData.country) {
      const countryInput = document.getElementById('inactiveRequestCountry');
      if (countryInput) countryInput.value = adminData.country;
    }

    // Initialize file preview
    const fileInput = document.getElementById('inactiveIdentityProof');
    const filePreview = document.getElementById('inactiveFilePreview');
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

    // Handle form submission
    const inactiveForm = document.getElementById('inactiveActivationRequestForm');
    if (inactiveForm) {
      inactiveForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = inactivePopup.dataset.adminEmail;
        const name = document.getElementById('inactiveRequestName')?.value?.trim() || adminData.name || '';
        const phone = document.getElementById('inactiveRequestPhone')?.value?.trim() || null;
        const address = document.getElementById('inactiveRequestAddress')?.value?.trim() || null;
        const city = document.getElementById('inactiveRequestCity')?.value?.trim() || null;
        const state = document.getElementById('inactiveRequestState')?.value?.trim() || null;
        const zipCode = document.getElementById('inactiveRequestZipCode')?.value?.trim() || null;
        const country = document.getElementById('inactiveRequestCountry')?.value?.trim() || null;
        const identityProof = document.getElementById('inactiveIdentityProof')?.files[0];
        const additionalNotes = document.getElementById('inactiveRequestNotes')?.value?.trim() || null;

        if (!email) {
          if (inactiveMessage) {
            inactiveMessage.textContent = 'Error: Email not found.';
            inactiveMessage.classList.remove('hidden', 'success', 'error');
            inactiveMessage.classList.add('error');
          }
          return;
        }

        // Validate required fields
        if (!name || !phone || !identityProof) {
          if (inactiveMessage) {
            inactiveMessage.textContent = 'Please fill all required fields (Name, Phone, and Identity Proof).';
            inactiveMessage.classList.remove('hidden', 'success', 'error');
            inactiveMessage.classList.add('error');
          }
          return;
        }

        // Validate file size (max 5MB)
        if (identityProof.size > 5 * 1024 * 1024) {
          if (inactiveMessage) {
            inactiveMessage.textContent = 'File size must be less than 5MB.';
            inactiveMessage.classList.remove('hidden', 'success', 'error');
            inactiveMessage.classList.add('error');
          }
          return;
        }

        // Disable button
        if (sendRequestBtn) {
          sendRequestBtn.disabled = true;
          sendRequestBtn.innerHTML = '<span>Uploading & Sending Request...</span>';
        }

        if (inactiveMessage) {
          inactiveMessage.textContent = 'Uploading identity proof and sending request...';
          inactiveMessage.classList.remove('hidden', 'success', 'error');
          inactiveMessage.classList.add('success');
        }

        try {
          // Upload identity proof
          let identityProofUrl = null;
          let identityProofFilename = null;

          if (identityProof) {
            const fileExt = identityProof.name.split('.').pop();
            const fileName = `${email}_${Date.now()}.${fileExt}`;
            const reader = new FileReader();
            identityProofUrl = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(identityProof);
            });
            identityProofFilename = fileName;
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
            if (inactiveMessage) {
              inactiveMessage.textContent = 'Failed to send request. Please try again.';
              inactiveMessage.classList.remove('success');
              inactiveMessage.classList.add('error');
            }
            if (sendRequestBtn) {
              sendRequestBtn.disabled = false;
              sendRequestBtn.innerHTML = '<span>Send Activation Request</span><span class="glow"></span>';
            }
            return;
          }

          // Success
          if (inactiveMessage) {
            inactiveMessage.textContent = 'Activation request sent successfully! The super admin will review your request.';
            inactiveMessage.classList.remove('error');
            inactiveMessage.classList.add('success');
          }
          if (sendRequestBtn) {
            sendRequestBtn.disabled = true;
            sendRequestBtn.innerHTML = '<span>Request Sent</span>';
          }

          // Hide rejection details since new request is sent
          if (rejectionDetails) {
            rejectionDetails.classList.add('hidden');
          }

          // Reset form
          if (inactiveForm) {
            inactiveForm.reset();
            if (filePreview) filePreview.textContent = '';
          }

          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 3000);

        } catch (err) {
          console.error('Error:', err);
          if (inactiveMessage) {
            inactiveMessage.textContent = 'An error occurred. Please try again later.';
            inactiveMessage.classList.remove('success');
            inactiveMessage.classList.add('error');
          }
          if (sendRequestBtn) {
            sendRequestBtn.disabled = false;
            sendRequestBtn.innerHTML = '<span>Send Activation Request</span><span class="glow"></span>';
          }
        }
      });
    }

    // Handle close button
    if (closeInactiveBtn) {
      closeInactiveBtn.onclick = () => {
        window.location.href = 'index.html';
      };
    }
  };

  // UI Type specific dashboard rectangles configuration
  const getUITypeRectangles = (uiType) => {
    const rectangles = {
      'government': [
        { title: 'Citizen Management', icon: 'users', description: 'Manage citizen records and registrations' },
        { title: 'Document Management', icon: 'file-text', description: 'Handle official documents and certificates' },
        { title: 'Service Requests', icon: 'inbox', description: 'Process public service requests' },
        { title: 'Financial Management', icon: 'dollar-sign', description: 'Track budgets and expenditures' },
        { title: 'Public Records', icon: 'database', description: 'Manage public records and archives' }
      ],
      'private': [
        { title: 'Employee Management', icon: 'users', description: 'Manage staff and HR records' },
        { title: 'Project Management', icon: 'briefcase', description: 'Track projects and deadlines' },
        { title: 'Client Relations', icon: 'user-check', description: 'Manage client accounts' },
        { title: 'Financial Operations', icon: 'dollar-sign', description: 'Track revenue and expenses' },
        { title: 'Inventory Management', icon: 'package', description: 'Manage company inventory' }
      ],
      'mobile_shop': [
        { title: 'Product Catalog', icon: 'smartphone', description: 'Manage mobile devices and accessories' },
        { title: 'Inventory', icon: 'package', description: 'Track stock and supplies' },
        { title: 'Sales Management', icon: 'shopping-cart', description: 'Process sales and orders' },
        { title: 'Customer Database', icon: 'users', description: 'Manage customer information' },
        { title: 'Repair Services', icon: 'tool', description: 'Track repair and service requests' }
      ],
      'court': [
        { title: 'Case Management', icon: 'file-text', description: 'Manage court cases and proceedings' },
        { title: 'Legal Documents', icon: 'folder', description: 'Store and organize legal documents' },
        { title: 'Hearing Schedule', icon: 'calendar', description: 'Manage court hearing schedules' },
        { title: 'Judicial Records', icon: 'database', description: 'Access judicial records and archives' },
        { title: 'Docket Management', icon: 'clipboard', description: 'Manage court dockets' }
      ],
      'college_school': [
        { title: 'Student Management', icon: 'users', description: 'Manage student records and enrollment' },
        { title: 'Academic Records', icon: 'book', description: 'Track grades and academic performance' },
        { title: 'Faculty Management', icon: 'user-check', description: 'Manage faculty and staff' },
        { title: 'Course Schedule', icon: 'calendar', description: 'Manage class schedules' },
        { title: 'Fee Management', icon: 'dollar-sign', description: 'Track tuition and fees' }
      ],
      'hospital': [
        { title: 'Patient Management', icon: 'heart', description: 'Manage patient records and information' },
        { title: 'Appointments', icon: 'calendar', description: 'Schedule and manage appointments' },
        { title: 'Medical Records', icon: 'file-text', description: 'Access patient medical history' },
        { title: 'Staff Management', icon: 'users', description: 'Manage hospital staff and doctors' },
        { title: 'Inventory', icon: 'package', description: 'Track medical supplies and equipment' }
      ],
      'bank': [
        { title: 'Account Management', icon: 'credit-card', description: 'Manage customer accounts' },
        { title: 'Transactions', icon: 'repeat', description: 'Track financial transactions' },
        { title: 'Loan Management', icon: 'dollar-sign', description: 'Process loans and approvals' },
        { title: 'Customer Service', icon: 'headphones', description: 'Handle customer inquiries' },
        { title: 'Financial Reports', icon: 'bar-chart', description: 'Generate financial reports' }
      ],
      'restaurant': [
        { title: 'Menu Management', icon: 'utensils', description: 'Manage menu items and prices' },
        { title: 'Orders', icon: 'shopping-cart', description: 'Process and track orders' },
        { title: 'Inventory', icon: 'package', description: 'Manage kitchen inventory' },
        { title: 'Staff Management', icon: 'users', description: 'Manage restaurant staff' },
        { title: 'Reservations', icon: 'calendar', description: 'Handle table reservations' }
      ],
      'retail': [
        { title: 'Product Catalog', icon: 'shopping-bag', description: 'Manage product listings' },
        { title: 'Inventory', icon: 'package', description: 'Track stock levels' },
        { title: 'Sales Management', icon: 'shopping-cart', description: 'Process sales transactions' },
        { title: 'Customer Database', icon: 'users', description: 'Manage customer information' },
        { title: 'Supplier Management', icon: 'truck', description: 'Manage suppliers and deliveries' }
      ],
      'ngo': [
        { title: 'Beneficiary Management', icon: 'heart', description: 'Manage beneficiaries and programs' },
        { title: 'Donation Management', icon: 'dollar-sign', description: 'Track donations and funding' },
        { title: 'Volunteer Management', icon: 'users', description: 'Manage volunteers and activities' },
        { title: 'Program Management', icon: 'target', description: 'Track programs and initiatives' },
        { title: 'Reports', icon: 'file-text', description: 'Generate activity reports' }
      ],
      'hotel': [
        { title: 'Reservation Management', icon: 'calendar', description: 'Manage room reservations' },
        { title: 'Guest Management', icon: 'users', description: 'Handle guest check-in and check-out' },
        { title: 'Room Management', icon: 'home', description: 'Manage room availability and status' },
        { title: 'Billing', icon: 'dollar-sign', description: 'Process payments and invoices' },
        { title: 'Facilities', icon: 'settings', description: 'Manage hotel facilities and services' }
      ],
      'pharmacy': [
        { title: 'Medication Inventory', icon: 'pill', description: 'Manage pharmaceutical stock' },
        { title: 'Prescription Management', icon: 'file-text', description: 'Process prescriptions' },
        { title: 'Customer Records', icon: 'users', description: 'Manage customer medication history' },
        { title: 'Supplier Management', icon: 'truck', description: 'Manage pharmaceutical suppliers' },
        { title: 'Expiry Tracking', icon: 'clock', description: 'Track medication expiry dates' }
      ]
    };

    return rectangles[uiType] || [];
  };

  // Load UI type specific rectangles
  const loadUITypeRectangles = async () => {
    const session = checkAuth();
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('admin')
        .select('ui_type')
        .eq('id', session.id)
        .single();

      if (error || !data || !data.ui_type) {
        // If no UI type, keep default "Coming Soon" rectangles
        return;
      }

      const rectangles = getUITypeRectangles(data.ui_type);
      if (rectangles.length === 0) return;

      // Get the console grid container
      const consoleGrid = document.querySelector('.console-grid');
      if (!consoleGrid) return;

      // Remove all placeholder rectangles (keep Manage Profile)
      const placeholderCards = consoleGrid.querySelectorAll('.console-card.placeholder');
      placeholderCards.forEach(card => card.remove());

      // Icon SVG paths mapping
      const iconMap = {
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />',
        'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />',
        'inbox': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />',
        'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />',
        'database': '<ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />',
        'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />',
        'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />',
        'package': '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />',
        'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />',
        'shopping-cart': '<circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />',
        'tool': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />',
        'folder': '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />',
        'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />',
        'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />',
        'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />',
        'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />',
        'credit-card': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />',
        'repeat': '<polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />',
        'headphones': '<path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />',
        'bar-chart': '<line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />',
        'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />',
        'shopping-bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />',
        'truck': '<rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />',
        'target': '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />',
        'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />',
        'settings': '<circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 17.364m12.728 0l-4.243-4.243m-4.242 0L5.636 6.636" />',
        'pill': '<rect x="3" y="8" width="18" height="8" rx="4" /><path d="M8 8h8" /><path d="M8 16h8" />',
        'clock': '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />'
      };

      // Create and append rectangles
      rectangles.forEach(rect => {
        const card = document.createElement('div');
        card.className = 'console-card';
        card.innerHTML = `
          <div class="console-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              ${iconMap[rect.icon] || '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />'}
            </svg>
          </div>
          <h3 class="console-card-title">${rect.title}</h3>
          <p>${rect.description}</p>
        `;
        consoleGrid.appendChild(card);
      });

    } catch (err) {
      console.error('Error loading UI type rectangles:', err);
    }
  };

  // Check authentication on page load
  const loadDashboard = async () => {
    const session = checkAuth();
    if (!session) return;

    // Check admin status immediately
    const adminData = await checkAdminStatus();
    if (adminData && !adminData.is_active) {
      showInactiveStatusPopup(adminData);
      return;
    }

    // Load UI type specific rectangles
    await loadUITypeRectangles();

    // Set up periodic status checking (every 30 seconds)
    setInterval(async () => {
      const currentAdminData = await checkAdminStatus();
      if (currentAdminData && !currentAdminData.is_active) {
        showInactiveStatusPopup(currentAdminData);
      }
    }, 30000); // Check every 30 seconds

    // Check status when page becomes visible again (user switches back to tab)
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        const currentAdminData = await checkAdminStatus();
        if (currentAdminData && !currentAdminData.is_active) {
          showInactiveStatusPopup(currentAdminData);
        }
      }
    });
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminSession');
      window.location.href = 'index.html';
    }
  };

  // Initialize
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Event listeners for profile management
  if (manageProfileCard) {
    manageProfileCard.addEventListener('click', showProfilePopup);
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }

  if (closeProfilePopup) {
    closeProfilePopup.addEventListener('click', hideProfilePopup);
  }

  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', hideProfilePopup);
  }

  // Close popup when clicking outside
  if (profilePopup) {
    profilePopup.addEventListener('click', (e) => {
      if (e.target === profilePopup) {
        hideProfilePopup();
      }
    });
  }

  // Close popup with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profilePopup && !profilePopup.classList.contains('hidden')) {
      hideProfilePopup();
    }
  });


  // Feedback FAB and Popup Logic
  const initFeedbackSystem = () => {
    const fabContainer = document.getElementById('fabContainer');
    const fabMainBtn = document.getElementById('fabMainBtn');
    const feedbackPopup = document.getElementById('feedbackPopup');
    const feedbackForm = document.getElementById('feedbackForm');
    const closeFeedbackBtn = document.getElementById('closeFeedbackPopup');
    const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
    const feedbackTitleInput = document.getElementById('feedbackPopupTitle');
    const feedbackTypeInput = document.getElementById('feedbackType');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Toggle FAB Menu
    if (fabMainBtn && fabContainer) {
      fabMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fabContainer.classList.toggle('active');
      });

      // Close FAB when clicking outside
      document.addEventListener('click', (e) => {
        if (!fabContainer.contains(e.target) && fabContainer.classList.contains('active')) {
          fabContainer.classList.remove('active');
        }
      });
    }

    // Open Feedback Popup
    const openFeedbackPopup = (type) => {
      if (!feedbackPopup) return;

      // Set Title based on type
      let title = 'Submit Feedback';
      const contextField = document.getElementById('bugContextField');
      const contextSelect = document.getElementById('feedbackContext');

      if (type === 'bug') {
        title = 'Report a Bug';
        if (contextField) {
          contextField.classList.remove('hidden');
          // Populate options from available cards
          if (contextSelect) {
            contextSelect.innerHTML = '<option value="">Select an element (Optional)</option>';
            contextSelect.innerHTML += '<option value="General/Other">General / Entire Dashboard</option>';

            // Get all visible console cards
            const cards = document.querySelectorAll('.console-card .console-card-title');
            cards.forEach(card => {
              const cardName = card.textContent.trim();
              const option = document.createElement('option');
              option.value = cardName;
              option.textContent = cardName;
              contextSelect.appendChild(option);
            });
          }
        }
      } else {
        if (type === 'suggestion') title = 'Make a Suggestion';
        else if (type === 'other') title = 'Other Inquiry';

        if (contextField) contextField.classList.add('hidden');
      }

      if (feedbackTitleInput) feedbackTitleInput.textContent = title;
      if (feedbackTypeInput) feedbackTypeInput.value = type;

      // Reset form
      if (feedbackForm) feedbackForm.reset();
      if (feedbackMessage) {
        feedbackMessage.textContent = '';
        feedbackMessage.classList.add('hidden');
      }

      feedbackPopup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      fabContainer.classList.remove('active'); // Close FAB
    };

    // Close Feedback Popup
    const closeFeedbackPopup = () => {
      if (feedbackPopup) {
        feedbackPopup.classList.add('hidden');
        document.body.style.overflow = '';
      }
    };

    // Attach listeners to FAB options
    if (fabContainer) {
      const options = fabContainer.querySelectorAll('.fab-option');
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent document click from immediately closing FAB if needed (though we want to close it intentionally)
          const titleAttr = option.getAttribute('title');
          let type = 'other';
          if (titleAttr.toLowerCase().includes('bug')) type = 'bug';
          else if (titleAttr.toLowerCase().includes('suggestion')) type = 'suggestion';

          openFeedbackPopup(type);
        });
      });
    }

    // Close listeners
    if (closeFeedbackBtn) closeFeedbackBtn.addEventListener('click', closeFeedbackPopup);
    if (cancelFeedbackBtn) cancelFeedbackBtn.addEventListener('click', closeFeedbackPopup);
    if (feedbackPopup) {
      feedbackPopup.addEventListener('click', (e) => {
        if (e.target === feedbackPopup) closeFeedbackPopup();
      });
    }

    // Handle Form Submission
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const session = checkAuth();
        if (!session) {
          window.location.href = 'index.html';
          return;
        }

        const type = document.getElementById('feedbackType').value;
        const title = document.getElementById('feedbackTitle').value.trim();
        const description = document.getElementById('feedbackDescription').value.trim();
        const context = document.getElementById('feedbackContext')?.value || null;
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');

        if (!title || !description) {
          if (feedbackMessage) {
            feedbackMessage.textContent = 'Please fill in all fields.';
            feedbackMessage.className = 'login-message error';
          }
          return;
        }

        // Loading state
        if (submitBtn) {
          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Submitting...</span>';
        }

        try {
          const { error } = await supabase
            .from('feedback_reports')
            .insert([{
              type,
              title,
              description,
              related_element: (type === 'bug') ? context : null,
              admin_id: session.id,
              admin_email: session.email,
              admin_name: session.name,
              status: 'pending'
            }]);

          if (error) throw error;

          // Success
          if (feedbackMessage) {
            feedbackMessage.textContent = 'Feedback submitted successfully!';
            feedbackMessage.className = 'login-message success';
          }

          setTimeout(() => {
            closeFeedbackPopup();
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span>Submit</span><span class="glow"></span>';
            }
          }, 1500);

        } catch (err) {
          console.error('Error submitting feedback:', err);
          if (feedbackMessage) {
            feedbackMessage.textContent = 'Error submitting feedback. Please try again.';
            feedbackMessage.className = 'login-message error';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit</span><span class="glow"></span>';
          }
        }
      });
    }
  };

  // Initialize Feedback System
  initFeedbackSystem();

  // Load dashboard on page load
  loadDashboard();
  // Expose preview function globally
  window.previewAvatar = (input) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('profileAvatarPreview').src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };
})();


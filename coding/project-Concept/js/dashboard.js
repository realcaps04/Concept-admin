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

      // Populate form fields
      document.getElementById('profileName').value = data.name || '';
      document.getElementById('profileUsername').value = data.username || '';
      document.getElementById('profileEmail').value = data.email || '';
      document.getElementById('profilePassword').value = ''; // Clear password field
      document.getElementById('profilePin').value = data.pin || '';
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

    showProfileMessage('Saving changes...');

    const name = document.getElementById('profileName')?.value?.trim();
    const username = document.getElementById('profileUsername')?.value?.trim();
    const email = document.getElementById('profileEmail')?.value?.trim();
    const password = document.getElementById('profilePassword')?.value?.trim();
    const pin = document.getElementById('profilePin')?.value?.trim() || null;

    if (!name || !username || !email) {
      showProfileMessage('Please fill all required fields.', 'error');
      return;
    }

    try {
      // Build update object - only include password if provided
      const updateData = {
        name,
        username,
        email,
        pin
      };

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

  // Check authentication on page load
  const loadDashboard = () => {
    const session = checkAuth();
    if (!session) return;
    // Dashboard is ready - rectangles can be added for management options
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

  // Load dashboard on page load
  loadDashboard();
})();


(() => {
  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM elements
  const adminsTable = document.getElementById('adminsTable');
  const loadingRow = document.getElementById('loadingRow');
  const logoutBtn = document.getElementById('logoutBtn');
  const editPopup = document.getElementById('editAdminPopup');
  const editForm = document.getElementById('editAdminForm');
  const closeEditPopup = document.getElementById('closeEditPopup');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editMessage = document.getElementById('editMessage');
  let currentEditId = null;
  let originalAdminData = null;

  // Session management
  const getSession = () => {
    const sessionData = localStorage.getItem('superadmin_session');
    if (!sessionData) return null;
    try {
      const session = JSON.parse(sessionData);
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

  // Check authentication
  const checkAuth = async () => {
    const session = getSession();
    if (!session) {
      window.location.href = 'Superadminindex.html';
      return false;
    }

    // Verify session is still valid
    const { data, error } = await supabase
      .from('Superadmin')
      .select('id, email, name, is_active')
      .eq('email', session.email)
      .eq('id', session.id)
      .single();

    if (error || !data || !data.is_active) {
      clearSession();
      window.location.href = 'Superadminindex.html';
      return false;
    }

    return true;
  };

  // Load admins from Supabase
  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('id, name, username, email, role, pin, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading admins:', error);
        if (loadingRow) {
          loadingRow.innerHTML = '<span colspan="7">Error loading admins. Please try again.</span>';
        }
        return;
      }

      if (loadingRow) {
        loadingRow.remove();
      }

      if (!data || data.length === 0) {
        if (loadingRow) {
          loadingRow.remove();
        }
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
          <div class="empty-state-content">
            <svg viewBox="0 0 80 80" aria-hidden="true" class="empty-icon not-found-icon">
              <!-- Magnifying glass -->
              <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="3" class="search-circle"/>
              <line x1="48" y1="48" x2="60" y2="60" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="search-handle"/>
              <!-- Question mark -->
              <circle cx="55" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="2.5" class="question-circle"/>
              <path d="M55 28v4M55 36v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="question-dot"/>
            </svg>
            <h3>No Admins are Currently Available</h3>
            <p>Get started by creating your first admin account.</p>
            <a href="Superadminindex.html" target="_blank" rel="noopener noreferrer" class="cta empty-cta">
              <span>Create New Admin</span>
              <span class="glow"></span>
            </a>
          </div>
        `;
        adminsTable.appendChild(emptyState);
        return;
      }

      // Render admin rows
      data.forEach(admin => {
        const row = document.createElement('div');
        row.className = 'table-row';
        const statusClass = admin.is_active ? 'success' : 'muted';
        const statusText = admin.is_active ? 'Active' : 'Inactive';
        row.innerHTML = `
          <span>${admin.name || 'N/A'}</span>
          <span>${admin.username || 'N/A'}</span>
          <span>${admin.email || 'N/A'}</span>
          <span><span class="pill ${admin.role === 'super_admin' ? 'success' : admin.role === 'admin' ? 'neutral' : 'muted'}">${admin.role || 'N/A'}</span></span>
          <span>${admin.pin ? '••••' : 'N/A'}</span>
          <span><span class="pill ${statusClass}">${statusText}</span></span>
          <span>
            <button class="action-btn edit-btn" data-id="${admin.id}" data-email="${admin.email}">Edit</button>
            <button class="action-btn delete-btn" data-id="${admin.id}" data-email="${admin.email}">Delete</button>
          </span>
        `;
        adminsTable.appendChild(row);
      });

      // Add event listeners for action buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          if (id) {
            loadAdminData(id);
          }
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const email = e.target.getAttribute('data-email');
          
          if (confirm(`Are you sure you want to delete admin: ${email}?`)) {
            const { error } = await supabase
              .from('admin')
              .delete()
              .eq('id', id);

            if (error) {
              alert('Error deleting admin: ' + error.message);
            } else {
              alert('Admin deleted successfully!');
              location.reload();
            }
          }
        });
      });

    } catch (err) {
      console.error('Error:', err);
      if (loadingRow) {
        loadingRow.innerHTML = '<span colspan="5">Error loading admins. Please try again.</span>';
      }
    }
  };

  // Show edit popup
  const showEditPopup = () => {
    if (editPopup) {
      editPopup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  // Hide edit popup
  const hideEditPopup = () => {
    if (editPopup) {
      editPopup.classList.add('hidden');
      document.body.style.overflow = '';
      editForm?.reset();
      currentEditId = null;
      originalAdminData = null;
      if (editMessage) {
        editMessage.textContent = '';
        editMessage.classList.add('hidden');
      }
    }
  };

  // Load admin data into edit form
  const loadAdminData = async (adminId) => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('id', adminId)
        .single();

      if (error || !data) {
        alert('Error loading admin details: ' + (error?.message || 'Admin not found'));
        return;
      }

      // Store original admin data for comparison
      originalAdminData = {
        is_active: data.is_active,
        email: data.email
      };

      // Populate form fields
      document.getElementById('editName').value = data.name || '';
      document.getElementById('editUsername').value = data.username || '';
      document.getElementById('editEmail').value = data.email || '';
      document.getElementById('editPassword').value = ''; // Clear password field (don't show existing password)
      document.getElementById('editRole').value = data.role || '';
      document.getElementById('editPin').value = data.pin || '';
      document.getElementById('editStatus').value = data.is_active ? 'true' : 'false';

      currentEditId = adminId;
      showEditPopup();
    } catch (err) {
      console.error('Error loading admin data:', err);
      alert('Error loading admin details');
    }
  };

  // Show message in edit form
  const showEditMessage = (text, type = 'info') => {
    if (!editMessage) return;
    editMessage.textContent = text;
    editMessage.classList.remove('hidden', 'success', 'error');
    if (type === 'success') editMessage.classList.add('success');
    if (type === 'error') editMessage.classList.add('error');
  };

  // Handle edit form submission
  const handleEditSubmit = async (evt) => {
    evt.preventDefault();
    if (!currentEditId) return;

    showEditMessage('Saving changes...');

    const name = document.getElementById('editName')?.value?.trim();
    const username = document.getElementById('editUsername')?.value?.trim();
    const email = document.getElementById('editEmail')?.value?.trim();
    const password = document.getElementById('editPassword')?.value?.trim();
    const role = document.getElementById('editRole')?.value;
    const pin = document.getElementById('editPin')?.value?.trim() || null;
    const is_active = document.getElementById('editStatus')?.value === 'true';

    if (!name || !username || !email || !role) {
      showEditMessage('Please fill all required fields.', 'error');
      return;
    }

    try {
      // Build update object - only include password if provided
      const updateData = {
        name,
        username,
        email,
        role,
        pin,
        is_active
      };

      // Only update password if a new one is provided
      if (password && password.length > 0) {
        updateData.password = password;
      }

      const { error } = await supabase
        .from('admin')
        .update(updateData)
        .eq('id', currentEditId);

      if (error) {
        showEditMessage('Error updating admin: ' + error.message, 'error');
        return;
      }

      // Check if status changed from inactive to active
      const wasInactive = originalAdminData && !originalAdminData.is_active;
      const isNowActive = is_active;
      
      if (wasInactive && isNowActive && originalAdminData.email) {
        // Delete activation requests for this admin
        const { error: deleteError } = await supabase
          .from('adminactivationrequests')
          .delete()
          .eq('admin_email', originalAdminData.email)
          .eq('status', 'pending');

        if (deleteError) {
          console.warn('Error deleting activation requests:', deleteError);
          // Don't fail the update if deletion fails, just log it
        }
      }

      showEditMessage('Admin updated successfully!', 'success');
      setTimeout(() => {
        hideEditPopup();
        location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating admin:', err);
      showEditMessage('An error occurred while updating admin.', 'error');
    }
  };

  // Logout handler
  const handleLogout = () => {
    clearSession();
    window.location.href = 'Superadminindex.html';
  };

  // Initialize
  (async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      await loadAdmins();
    }
  })();

  // Event listeners
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Previous page button handler
  const previousPageBtn = document.getElementById('previousPageBtn');
  if (previousPageBtn) {
    previousPageBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', handleEditSubmit);
  }

  if (closeEditPopup) {
    closeEditPopup.addEventListener('click', hideEditPopup);
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', hideEditPopup);
  }

  // Close popup when clicking outside
  if (editPopup) {
    editPopup.addEventListener('click', (e) => {
      if (e.target === editPopup) {
        hideEditPopup();
      }
    });
  }

  // Close popup with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editPopup && !editPopup.classList.contains('hidden')) {
      hideEditPopup();
    }
  });
})();


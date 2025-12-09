(() => {
  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM elements
  const requestsTable = document.getElementById('requestsTable');
  const loadingRow = document.getElementById('loadingRow');
  const logoutBtn = document.getElementById('logoutBtn');

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

  // Load activation requests from Supabase
  const loadActivationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .select('id, admin_email, admin_name, status, requested_at')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error loading activation requests:', error);
        if (loadingRow) {
          loadingRow.innerHTML = '<span colspan="5">Error loading activation requests. Please try again.</span>';
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
              <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="3" class="search-circle"/>
              <line x1="48" y1="48" x2="60" y2="60" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="search-handle"/>
              <circle cx="55" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="2.5" class="question-circle"/>
              <path d="M55 28v4M55 36v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="question-dot"/>
            </svg>
            <h3>No Activation Requests</h3>
            <p>There are no pending activation requests at this time.</p>
          </div>
        `;
        requestsTable.appendChild(emptyState);
        return;
      }

      // Render activation request rows
      data.forEach(request => {
        const row = document.createElement('div');
        row.className = 'table-row';
        const requestedDate = new Date(request.requested_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        row.innerHTML = `
          <span>${request.admin_email || 'N/A'}</span>
          <span>${request.admin_name || 'N/A'}</span>
          <span>${requestedDate}</span>
          <span><span class="pill ${request.status === 'pending' ? 'neutral' : request.status === 'approved' ? 'success' : 'muted'}">${request.status || 'pending'}</span></span>
          <span>
            <button class="action-btn edit-btn" data-id="${request.id}" data-email="${request.admin_email}">Approve</button>
            <button class="action-btn delete-btn" data-id="${request.id}" data-email="${request.admin_email}">Reject</button>
          </span>
        `;
        requestsTable.appendChild(row);
      });

      // Add event listeners for action buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const email = e.target.getAttribute('data-email');
          
          if (confirm(`Are you sure you want to approve the activation request for: ${email}?`)) {
            // Update request status to approved
            const { error: updateError } = await supabase
              .from('adminactivationrequests')
              .update({ 
                status: 'approved',
                processed_at: new Date().toISOString()
              })
              .eq('id', id);

            if (updateError) {
              alert('Error approving request: ' + updateError.message);
              return;
            }

            // Update admin status to active
            const { error: adminError } = await supabase
              .from('admin')
              .update({ is_active: true })
              .eq('email', email);

            if (adminError) {
              alert('Request approved but failed to activate admin: ' + adminError.message);
            } else {
              alert('Activation request approved and admin activated successfully!');
              location.reload();
            }
          }
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const email = e.target.getAttribute('data-email');
          
          if (confirm(`Are you sure you want to reject the activation request for: ${email}?`)) {
            const { error } = await supabase
              .from('adminactivationrequests')
              .update({ 
                status: 'rejected',
                processed_at: new Date().toISOString()
              })
              .eq('id', id);

            if (error) {
              alert('Error rejecting request: ' + error.message);
            } else {
              alert('Activation request rejected successfully!');
              location.reload();
            }
          }
        });
      });

    } catch (err) {
      console.error('Error:', err);
      if (loadingRow) {
        loadingRow.innerHTML = '<span colspan="5">Error loading activation requests. Please try again.</span>';
      }
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
      await loadActivationRequests();
    }
  })();

  // Event listeners
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
})();


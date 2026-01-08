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

  // Show view details popup
  const showViewDetailsPopup = async (requestId) => {
    const popup = document.getElementById('viewDetailsPopup');
    if (!popup) return;

    try {
      // Fetch full request details
      const { data, error } = await supabase
        .from('forgotpassrequestadmin')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !data) {
        alert('Error loading request details: ' + (error?.message || 'Unknown error'));
        return;
      }

      // Populate details
      document.getElementById('detailEmail').textContent = data.admin_email || '-';
      document.getElementById('detailName').textContent = data.admin_name || '-';
      document.getElementById('detailUsername').textContent = data.admin_username || '-';
      document.getElementById('detailDeliveryMethod').textContent = data.delivery_method ? data.delivery_method.replace('_', ' ').toUpperCase() : '-';
      document.getElementById('detailStatus').textContent = data.status || '-';
      document.getElementById('detailReason').textContent = data.reason || '-';
      document.getElementById('detailNotes').textContent = data.notes || '-';
      
      const requestedDate = data.requested_at 
        ? new Date(data.requested_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-';
      document.getElementById('detailRequestedAt').textContent = requestedDate;

      const processedDate = data.processed_at 
        ? new Date(data.processed_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-';
      document.getElementById('detailProcessedAt').textContent = processedDate;

      // Display identity proof if available
      const identityProofSection = document.getElementById('identityProofSection');
      const identityProofLink = document.getElementById('identityProofLink');
      if (data.id_proof_url) {
        identityProofSection.style.display = 'block';
        identityProofLink.href = data.id_proof_url;
        identityProofLink.textContent = data.id_proof_filename || 'View Identity Proof';
      } else {
        identityProofSection.style.display = 'none';
      }

      // Show/hide action buttons based on status
      const approveBtn = document.getElementById('approveBtn');
      const rejectBtn = document.getElementById('rejectBtn');
      const completeBtn = document.getElementById('completeBtn');

      if (data.status === 'pending') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
        completeBtn.style.display = 'none';
      } else if (data.status === 'approved') {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
        completeBtn.style.display = 'inline-block';
      } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
        completeBtn.style.display = 'none';
      }

      // Store request ID for action buttons
      approveBtn.dataset.id = requestId;
      rejectBtn.dataset.id = requestId;
      completeBtn.dataset.id = requestId;

      // Show popup
      popup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Error loading details:', err);
      alert('Error loading request details. Please try again.');
    }
  };

  // Hide view details popup
  const hideViewDetailsPopup = () => {
    const popup = document.getElementById('viewDetailsPopup');
    if (popup) {
      popup.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  // Handle approve action
  const handleApprove = async (requestId) => {
    const session = getSession();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('forgotpassrequestadmin')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: session.id
        })
        .eq('id', requestId);

      if (error) {
        alert('Error approving request: ' + error.message);
      } else {
        alert('Password reset request approved successfully!');
        hideViewDetailsPopup();
        location.reload();
      }
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Error approving request. Please try again.');
    }
  };

  // Handle reject action
  const handleReject = async (requestId) => {
    const rejectionNotes = prompt('Please provide a reason for rejection (this will be shown to the admin):', '');
    
    if (rejectionNotes === null) {
      return;
    }

    const session = getSession();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('forgotpassrequestadmin')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: session.id,
          notes: rejectionNotes || 'No reason provided'
        })
        .eq('id', requestId);

      if (error) {
        alert('Error rejecting request: ' + error.message);
      } else {
        alert('Password reset request rejected successfully!');
        hideViewDetailsPopup();
        location.reload();
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Error rejecting request. Please try again.');
    }
  };

  // Handle complete action
  const handleComplete = async (requestId) => {
    if (!confirm('Mark this password reset request as completed?')) {
      return;
    }

    const session = getSession();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('forgotpassrequestadmin')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        alert('Error completing request: ' + error.message);
      } else {
        alert('Password reset request marked as completed!');
        hideViewDetailsPopup();
        location.reload();
      }
    } catch (err) {
      console.error('Error completing request:', err);
      alert('Error completing request. Please try again.');
    }
  };

  // Load password reset requests from Supabase
  const loadPasswordResetRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('forgotpassrequestadmin')
        .select('id, admin_email, admin_name, delivery_method, status, requested_at')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error loading password reset requests:', error);
        if (loadingRow) {
          loadingRow.innerHTML = '<span colspan="6">Error loading password reset requests. Please try again.</span>';
        }
        return;
      }

      if (loadingRow) {
        loadingRow.remove();
      }

      if (!data || data.length === 0) {
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
            <h3>No Password Reset Requests</h3>
            <p>There are no pending password reset requests at this time.</p>
          </div>
        `;
        requestsTable.appendChild(emptyState);
        return;
      }

      // Render password reset request rows
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
        const deliveryMethod = request.delivery_method ? request.delivery_method.replace('_', ' ').toUpperCase() : 'N/A';
        row.innerHTML = `
          <span>${request.admin_email || 'N/A'}</span>
          <span>${request.admin_name || 'N/A'}</span>
          <span>${deliveryMethod}</span>
          <span>${requestedDate}</span>
          <span><span class="pill ${request.status === 'pending' ? 'neutral' : request.status === 'approved' ? 'success' : 'muted'}">${request.status || 'pending'}</span></span>
          <span>
            <button class="action-btn view-btn" data-id="${request.id}">View Details</button>
          </span>
        `;
        requestsTable.appendChild(row);
      });

      // Add event listeners for view details buttons
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          showViewDetailsPopup(id);
        });
      });

    } catch (err) {
      console.error('Error:', err);
      if (loadingRow) {
        loadingRow.innerHTML = '<span colspan="6">Error loading password reset requests. Please try again.</span>';
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
      await loadPasswordResetRequests();
    }
  })();

  // Event listeners
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Close details popup
  const closeDetailsBtn = document.getElementById('closeDetailsPopup');
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', hideViewDetailsPopup);
  }

  // Action button handlers
  const approveBtn = document.getElementById('approveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const completeBtn = document.getElementById('completeBtn');

  if (approveBtn) {
    approveBtn.addEventListener('click', (e) => {
      const requestId = e.target.dataset.id;
      if (requestId) {
        handleApprove(requestId);
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', (e) => {
      const requestId = e.target.dataset.id;
      if (requestId) {
        handleReject(requestId);
      }
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', (e) => {
      const requestId = e.target.dataset.id;
      if (requestId) {
        handleComplete(requestId);
      }
    });
  }

  // Close popup when clicking outside
  const viewDetailsPopup = document.getElementById('viewDetailsPopup');
  if (viewDetailsPopup) {
    viewDetailsPopup.addEventListener('click', (e) => {
      if (e.target === viewDetailsPopup) {
        hideViewDetailsPopup();
      }
    });
  }

  // Close popup with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewDetailsPopup && !viewDetailsPopup.classList.contains('hidden')) {
      hideViewDetailsPopup();
    }
  });
})();


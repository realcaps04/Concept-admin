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
        .from('adminactivationrequests')
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
      document.getElementById('detailPhone').textContent = data.admin_phone || '-';
      document.getElementById('detailAddress').textContent = data.admin_address || '-';
      document.getElementById('detailCity').textContent = data.admin_city || '-';
      document.getElementById('detailState').textContent = data.admin_state || '-';
      document.getElementById('detailZipCode').textContent = data.admin_zip_code || '-';
      document.getElementById('detailCountry').textContent = data.admin_country || '-';
      document.getElementById('detailNotes').textContent = data.additional_notes || '-';
      
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

      // Display identity proof
      const identityContainer = document.getElementById('identityProofContainer');
      if (data.identity_proof_url) {
        const fileExt = data.identity_proof_filename?.split('.').pop()?.toLowerCase() || '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
        
        if (isImage) {
          identityContainer.innerHTML = `
            <img src="${data.identity_proof_url}" alt="Identity Proof" 
                 style="max-width: 100%; max-height: 400px; border-radius: 12px; border: 1px solid var(--border); cursor: pointer;"
                 onclick="window.open('${data.identity_proof_url}', '_blank')" />
            <p style="margin-top: 8px; color: var(--muted); font-size: 12px;">
              ${data.identity_proof_filename || 'Identity Proof'} - Click to view full size
            </p>
          `;
        } else {
          identityContainer.innerHTML = `
            <div style="padding: 20px; background: #f7faff; border-radius: 12px; border: 1px solid var(--border);">
              <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--primary);">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
                <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                <polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p style="margin: 0 0 12px 0; color: var(--text); font-weight: 600;">${data.identity_proof_filename || 'Document'}</p>
              <a href="${data.identity_proof_url}" target="_blank" 
                 style="display: inline-block; padding: 8px 16px; background: var(--primary); color: white; border-radius: 8px; text-decoration: none; font-size: 14px;">
                View Document
              </a>
            </div>
          `;
        }
      } else {
        identityContainer.innerHTML = '<p style="color: var(--muted);">No identity proof uploaded</p>';
      }

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
            <button class="action-btn view-btn" data-id="${request.id}">View Details</button>
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
            // Prompt for rejection reason/notes
            const rejectionNotes = prompt('Please provide a reason for rejection (this will be shown to the admin):', '');
            
            // If user cancels the prompt, don't proceed with rejection
            if (rejectionNotes === null) {
              return;
            }

            const session = getSession();
            const updateData = {
              status: 'rejected',
              processed_at: new Date().toISOString(),
              notes: rejectionNotes || 'No reason provided'
            };

            if (session && session.id) {
              updateData.processed_by = session.id;
            }

            const { error } = await supabase
              .from('adminactivationrequests')
              .update(updateData)
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

  // Close details popup
  const closeDetailsBtn = document.getElementById('closeDetailsPopup');
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', hideViewDetailsPopup);
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


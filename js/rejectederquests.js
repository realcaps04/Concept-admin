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

      // Store request ID for updates
      popup.dataset.requestId = requestId;
      popup.dataset.adminEmail = data.admin_email;

      // Populate details
      document.getElementById('detailEmail').textContent = data.admin_email || '-';
      document.getElementById('detailName').textContent = data.admin_name || '-';
      document.getElementById('detailPhone').textContent = data.admin_phone || '-';
      document.getElementById('detailAddress').textContent = data.admin_address || '-';
      document.getElementById('detailCity').textContent = data.admin_city || '-';
      document.getElementById('detailState').textContent = data.admin_state || '-';
      document.getElementById('detailZipCode').textContent = data.admin_zip_code || '-';
      document.getElementById('detailCountry').textContent = data.admin_country || '-';
      document.getElementById('detailNotes').value = data.notes || '';
      document.getElementById('detailStatus').value = data.status || 'rejected';
      
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
        : 'Not processed yet';
      document.getElementById('detailProcessedAt').textContent = processedDate;

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

  // Handle reapprove and activate
  const handleReapprove = async () => {
    const popup = document.getElementById('viewDetailsPopup');
    const messageEl = document.getElementById('detailMessage');
    const requestId = popup?.dataset.requestId;
    const email = popup?.dataset.adminEmail;

    if (!requestId || !email) {
      alert('Error: Request information not found.');
      return;
    }

    if (!confirm(`Are you sure you want to reapprove and activate the account for: ${email}?`)) {
      return;
    }

    if (messageEl) {
      messageEl.textContent = 'Processing...';
      messageEl.classList.remove('hidden', 'success', 'error');
      messageEl.classList.add('success');
    }

    try {
      const session = getSession();
      
      // Update request status to approved
      const { error: updateError } = await supabase
        .from('adminactivationrequests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString(),
          notes: document.getElementById('detailNotes').value || null,
          processed_by: session?.id || null
        })
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      // Update admin status to active
      const { error: adminError } = await supabase
        .from('admin')
        .update({ is_active: true })
        .eq('email', email);

      if (adminError) {
        alert('Request approved but failed to activate admin: ' + adminError.message);
        if (messageEl) {
          messageEl.textContent = 'Request approved but failed to activate admin.';
          messageEl.classList.remove('success');
          messageEl.classList.add('error');
        }
        return;
      }

      if (messageEl) {
        messageEl.textContent = 'Request reapproved and admin activated successfully!';
        messageEl.classList.remove('error');
        messageEl.classList.add('success');
      }

      setTimeout(() => {
        hideViewDetailsPopup();
        location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error reapproving:', err);
      if (messageEl) {
        messageEl.textContent = 'Error: ' + (err.message || 'Failed to reapprove request.');
        messageEl.classList.remove('success');
        messageEl.classList.add('error');
      }
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    const popup = document.getElementById('viewDetailsPopup');
    const messageEl = document.getElementById('detailMessage');
    const requestId = popup?.dataset.requestId;

    if (!requestId) {
      alert('Error: Request information not found.');
      return;
    }

    const status = document.getElementById('detailStatus').value;
    const notes = document.getElementById('detailNotes').value || null;

    if (messageEl) {
      messageEl.textContent = 'Saving changes...';
      messageEl.classList.remove('hidden', 'success', 'error');
      messageEl.classList.add('success');
    }

    try {
      const session = getSession();
      const updateData = {
        status: status,
        notes: notes
      };

      // If status changed to approved, activate the admin
      if (status === 'approved') {
        const email = popup.dataset.adminEmail;
        if (email) {
          const { error: adminError } = await supabase
            .from('admin')
            .update({ is_active: true })
            .eq('email', email);

          if (adminError) {
            throw new Error('Failed to activate admin: ' + adminError.message);
          }
        }
        updateData.processed_at = new Date().toISOString();
        if (session?.id) {
          updateData.processed_by = session.id;
        }
      }

      const { error } = await supabase
        .from('adminactivationrequests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      if (messageEl) {
        messageEl.textContent = 'Changes saved successfully!';
        messageEl.classList.remove('error');
        messageEl.classList.add('success');
      }

      setTimeout(() => {
        hideViewDetailsPopup();
        location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error saving changes:', err);
      if (messageEl) {
        messageEl.textContent = 'Error: ' + (err.message || 'Failed to save changes.');
        messageEl.classList.remove('success');
        messageEl.classList.add('error');
      }
    }
  };

  // Load rejected activation requests from Supabase
  const loadRejectedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('adminactivationrequests')
        .select('id, admin_email, admin_name, status, requested_at, processed_at, notes')
        .eq('status', 'rejected')
        .order('processed_at', { ascending: false });

      if (error) {
        console.error('Error loading rejected requests:', error);
        if (loadingRow) {
          loadingRow.innerHTML = '<span colspan="6">Error loading rejected requests. Please try again.</span>';
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
            <h3>No Rejected Requests</h3>
            <p>There are no rejected activation requests at this time.</p>
          </div>
        `;
        requestsTable.appendChild(emptyState);
        return;
      }

      // Render rejected request rows
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
        const rejectedDate = request.processed_at 
          ? new Date(request.processed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A';
        const rejectionReason = request.notes || 'No reason provided';
        
        row.innerHTML = `
          <span>${request.admin_email || 'N/A'}</span>
          <span>${request.admin_name || 'N/A'}</span>
          <span>${requestedDate}</span>
          <span>${rejectedDate}</span>
          <span style="max-width: 300px; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${rejectionReason}</span>
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
        loadingRow.innerHTML = '<span colspan="6">Error loading rejected requests. Please try again.</span>';
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
      await loadRejectedRequests();
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

  const cancelDetailsBtn = document.getElementById('cancelDetailsBtn');
  if (cancelDetailsBtn) {
    cancelDetailsBtn.addEventListener('click', hideViewDetailsPopup);
  }

  // Reapprove button
  const reapproveBtn = document.getElementById('reapproveBtn');
  if (reapproveBtn) {
    reapproveBtn.addEventListener('click', handleReapprove);
  }

  // Save changes button
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', handleSaveChanges);
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


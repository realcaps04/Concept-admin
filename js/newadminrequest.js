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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format organization type
  const formatOrgType = (orgType, orgTypeOther) => {
    if (!orgType) return '-';
    const typeMap = {
      'government': 'Government',
      'private': 'Private',
      'mobile_shop': 'Mobile Shop',
      'court': 'Court',
      'college_school': 'College/School',
      'hospital': 'Hospital',
      'bank': 'Bank',
      'restaurant': 'Restaurant',
      'retail': 'Retail',
      'ngo': 'NGO',
      'others': orgTypeOther || 'Others'
    };
    return typeMap[orgType] || orgType;
  };

  // Get status badge HTML
  const getStatusBadge = (status) => {
    const statusMap = {
      'approval_pending': { text: 'Approval Pending', class: 'pending' },
      'approved': { text: 'Approved', class: 'approved' },
      'under_customization': { text: 'Under Customization', class: 'in_progress' },
      'customization_complete': { text: 'Customization Complete', class: 'approved' },
      'in_progress': { text: 'In Progress', class: 'in_progress' },
      'rejected': { text: 'Rejected', class: 'rejected' },
      'pending': { text: 'Pending', class: 'pending' }
    };
    const statusInfo = statusMap[status] || statusMap['approval_pending'];
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
  };


  // Load new admin requests
  const loadNewAdminRequests = async (filter = 'all') => {
    try {
      loadingRow.innerHTML = '<span colspan="6">Loading new admin requests...</span>';

      let query = supabase
        .from('newadminrequests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'approved') {
        query = query.eq('status', 'approved');
      } else if (filter === 'rejected') {
        query = query.eq('status', 'rejected');
      }

      const { data: requests, error } = await query;

      if (error) {
        console.error('Error loading requests:', error);
        loadingRow.innerHTML = '<span colspan="6" style="color: #ef4444;">Error loading requests. Please refresh the page.</span>';
        return;
      }

      // Clear existing content except header and loading row (which we'll remove/update)
      // Actually, safest is to clear all rows after the header
      while (requestsTable.children.length > 2) {
        requestsTable.removeChild(requestsTable.lastChild);
      }

      if (loadingRow) {
        // Reset or hide loading row
        loadingRow.innerHTML = '';
        loadingRow.style.display = 'none';
        // Note: Better to just remove it and re-append if needed, or hide it. 
        // Logic below appends rows, so clearing table content is key.
      }

      // Clear table content more reliably
      requestsTable.innerHTML = `
            <div class="table-row table-head">
              <span>Reference</span>
              <span>Name</span>
              <span>Email</span>
              <span>Organization</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
      `;

      if (!requests || requests.length === 0) {
        requestsTable.innerHTML += `
          <div class="table-row muted">
            <span colspan="6">No requests found matching filter: ${filter}</span>
          </div>
        `;
        return;
      }

      requests.forEach(request => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
          <span style="font-family: 'Courier New', monospace; font-weight: 600; color: var(--primary);">${request.reference_number || '-'}</span>
          <span>${request.admin_name || '-'}</span>
          <span>${request.admin_email || '-'}</span>
          <span>${request.organization_name || '-'}</span>
          <span>${getStatusBadge(request.status)}</span>
          <span>
            <button class="action-btn view-btn" onclick="showViewDetailsPopup('${request.id}')">
              View Details
            </button>
          </span>
        `;
        requestsTable.appendChild(row);
      });
    } catch (err) {
      console.error('Error:', err);
      if (loadingRow) {
        loadingRow.style.display = 'flex'; // Show it again on error
        loadingRow.innerHTML = '<span colspan="6" style="color: #ef4444;">Error loading requests. Please refresh the page.</span>';
      }
    }
  };

  // Show view details popup
  window.showViewDetailsPopup = async (requestId) => {
    const popup = document.getElementById('viewDetailsPopup');
    if (!popup) return;

    try {
      // Fetch full request details with latest data
      const { data, error } = await supabase
        .from('newadminrequests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !data) {
        alert('Error loading request details: ' + (error?.message || 'Unknown error'));
        return;
      }

      // Store request ID for status update
      window.currentRequestId = requestId;

      // Store initial status for change detection
      window.initialStatus = data.status;

      // Store request data globally for admin creation
      window.currentRequestData = data;

      // Populate details
      document.getElementById('detailReference').textContent = data.reference_number || '-';

      // Status display
      const statusDisplayElement = document.getElementById('detailStatusDisplay');
      if (statusDisplayElement) {
        statusDisplayElement.innerHTML = getStatusBadge(data.status);
      }

      // Status select dropdown
      const statusSelect = document.getElementById('statusSelect');
      if (statusSelect) {
        statusSelect.value = data.status || 'approval_pending';

        // Show/hide rejection reason field based on selected status
        const rejectionReasonField = document.getElementById('rejectionReasonField');
        const rejectionReasonInput = document.getElementById('rejectionReasonInput');
        const rejectionReasonRequired = document.getElementById('rejectionReasonRequired');

        const toggleRejectionReason = () => {
          if (statusSelect.value === 'rejected') {
            if (rejectionReasonField) rejectionReasonField.classList.remove('hidden');
            if (rejectionReasonRequired) rejectionReasonRequired.classList.remove('hidden');
            if (rejectionReasonInput) {
              rejectionReasonInput.setAttribute('required', 'required');
              rejectionReasonInput.value = data.rejection_reason || '';
            }
          } else {
            if (rejectionReasonField) rejectionReasonField.classList.add('hidden');
            if (rejectionReasonRequired) rejectionReasonRequired.classList.add('hidden');
            if (rejectionReasonInput) {
              rejectionReasonInput.removeAttribute('required');
            }
          }
        };

        statusSelect.addEventListener('change', () => {
          toggleRejectionReason();
          // Reset selected UI type when status changes away from approved
          if (statusSelect.value !== 'approved') {
            window.selectedUIType = null;
            window.selectedUITypeDisplay = null;
          }
        });
        toggleRejectionReason(); // Initial check
      }

      // Admin notes
      const adminNotesInput = document.getElementById('adminNotesInput');
      if (adminNotesInput) {
        adminNotesInput.value = data.notes || '';
      }

      // Reject request section - populate rejection reason if already rejected
      const rejectReasonTextarea = document.getElementById('rejectReasonTextarea');
      const rejectRequestSection = document.querySelector('.reject-request-section');
      if (rejectRequestSection) {
        // Show reject section only if request is not already rejected
        if (data.status === 'rejected') {
          rejectRequestSection.style.display = 'none';
        } else {
          rejectRequestSection.style.display = 'block';
        }
      }
      if (rejectReasonTextarea) {
        // Use rejection_details if available, fallback to rejection_reason
        rejectReasonTextarea.value = data.rejection_details || data.rejection_reason || '';
      }

      // Personal information
      document.getElementById('detailName').textContent = data.admin_name || '-';
      document.getElementById('detailEmail').textContent = data.admin_email || '-';
      document.getElementById('detailPhone').textContent = data.admin_phone || '-';
      document.getElementById('detailRole').textContent = data.role || '-';

      // Organization information
      document.getElementById('detailOrgName').textContent = data.organization_name || '-';
      document.getElementById('detailOrgType').textContent = formatOrgType(data.organization_type, data.organization_type_other);

      // Address information
      document.getElementById('detailAddress').textContent = data.address || '-';
      document.getElementById('detailCity').textContent = data.city || '-';
      document.getElementById('detailState').textContent = data.state || '-';
      document.getElementById('detailZipCode').textContent = data.zip_code || '-';
      document.getElementById('detailCountry').textContent = data.country || '-';

      // Request details
      // Features needed - display as chips
      const featuresContainer = document.getElementById('detailFeatures');
      if (data.features_needed) {
        const features = data.features_needed.split(',').map(f => f.trim()).filter(Boolean);
        featuresContainer.innerHTML = features.map(feature =>
          `<span class="feature-chip">${feature}</span>`
        ).join('');
      } else {
        featuresContainer.textContent = '-';
      }

      document.getElementById('detailReason').textContent = data.reason_for_access || '-';
      document.getElementById('detailNotes').textContent = data.additional_notes || '-';

      // Display identity proof
      const identityContainer = document.getElementById('identityProofContainer');
      if (data.identity_proof_url) {
        const fileExt = data.identity_proof_filename?.split('.').pop()?.toLowerCase() || '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
        const isPdf = fileExt === 'pdf';
        const proofUrl = data.identity_proof_url;

        if (isImage) {
          identityContainer.innerHTML = `
            <img src="${proofUrl}" alt="Identity Proof" 
                 onclick="window.open('${proofUrl}', '_blank')" />
            <p>
              ${data.identity_proof_filename || 'Identity Proof'} - Click to view full size
            </p>
          `;
        } else if (isPdf) {
          // For PDFs, create a viewer with download option
          identityContainer.innerHTML = `
            <div class="identity-proof-document">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
                <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                <polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>${data.identity_proof_filename || 'Document'}</p>
              <div class="document-actions">
                <button onclick="viewDocument('${proofUrl.replace(/'/g, "\\'")}', 'pdf')" class="btn-view-document">
                  View PDF
                </button>
                <a href="${proofUrl}" download="${data.identity_proof_filename || 'document.pdf'}" class="btn-download-document">
                  Download
                </a>
              </div>
            </div>
          `;
        } else {
          // For other documents
          identityContainer.innerHTML = `
            <div class="identity-proof-document">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
                <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                <polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>${data.identity_proof_filename || 'Document'}</p>
              <div class="document-actions">
                <button onclick="viewDocument('${proofUrl.replace(/'/g, "\\'")}', '${fileExt}')" class="btn-view-document">
                  View Document
                </button>
                <a href="${proofUrl}" download="${data.identity_proof_filename || 'document'}" class="btn-download-document">
                  Download
                </a>
              </div>
            </div>
          `;
        }
      } else {
        identityContainer.innerHTML = '<p style="color: var(--muted);">No identity proof uploaded</p>';
      }

      // Timestamps
      document.getElementById('detailRequestedAt').textContent = formatDate(data.requested_at);
      document.getElementById('detailProcessedAt').textContent = formatDate(data.processed_at) || '-';

      // Rejection information - use rejection_details if available, fallback to rejection_reason
      const rejectionSection = document.getElementById('rejectionSection');
      const rejectionReasonText = data.rejection_details || data.rejection_reason;
      if (data.status === 'rejected' && rejectionReasonText) {
        rejectionSection.classList.remove('hidden');
        document.getElementById('detailRejectionReason').textContent = rejectionReasonText;
      } else {
        rejectionSection.classList.add('hidden');
      }

      // Administrator notes
      const adminNotesSection = document.getElementById('adminNotesSection');
      if (data.notes) {
        adminNotesSection.classList.remove('hidden');
        document.getElementById('detailAdminNotes').textContent = data.notes;
      } else {
        adminNotesSection.classList.add('hidden');
      }

      // Show popup
      popup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Error loading details:', err);
      alert('Error loading request details. Please try again.');
    }
  };

  // Save status update
  const saveStatusUpdate = async () => {
    // Validate request ID
    if (!window.currentRequestId) {
      console.error('No request ID found. currentRequestId:', window.currentRequestId);
      alert('No request selected. Please close and reopen the details popup.');
      return;
    }

    const statusSelect = document.getElementById('statusSelect');
    const rejectionReasonInput = document.getElementById('rejectionReasonInput');
    const adminNotesInput = document.getElementById('adminNotesInput');

    if (!statusSelect) {
      alert('Status select element not found.');
      return;
    }

    const newStatus = statusSelect.value;
    const rejectionReason = rejectionReasonInput?.value.trim() || null;
    // Notes are optional - allow null or empty string
    const notes = adminNotesInput?.value.trim() || null;

    // Validate rejection reason if status is rejected
    if (newStatus === 'rejected' && !rejectionReason) {
      alert('Rejection reason is required when status is set to Rejected.');
      if (rejectionReasonInput) rejectionReasonInput.focus();
      return;
    }

    // Notes are optional - no validation needed

    // Get current session
    const session = getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      window.location.href = 'Superadminindex.html';
      return;
    }

    // Verify the request exists before updating
    const { data: existingRequest, error: checkError } = await supabase
      .from('newadminrequests')
      .select('id, status')
      .eq('id', window.currentRequestId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking request existence:', checkError);
      alert('Error verifying request: ' + checkError.message);
      return;
    }

    if (!existingRequest) {
      console.error('Request not found with ID:', window.currentRequestId);
      alert('Request not found. It may have been deleted. Please refresh the page.');
      return;
    }

    try {
      // Prepare update data - always update these fields
      const updateData = {
        status: newStatus,
        notes: notes || null, // Allow null if empty
        updated_at: new Date().toISOString()
      };

      // Handle processed_at and processed_by based on status
      if (['approved', 'rejected', 'customization_complete'].includes(newStatus)) {
        // Set processed_at and processed_by for final states
        // Only update processed_at if not already set, or if changing to a processed state
        if (!window.initialStatus || !['approved', 'rejected', 'customization_complete'].includes(window.initialStatus)) {
          updateData.processed_at = new Date().toISOString();
        }
        // Always update processed_by to track who made the change
        updateData.processed_by = session.id;
      } else {
        // For non-processed states, explicitly set processed_at to null to clear it
        updateData.processed_at = null;
        // Always update processed_by to track who last updated it
        updateData.processed_by = session.id;
      }

      // Handle rejection reason and rejection details
      if (newStatus === 'rejected') {
        // Set rejection reason if status is rejected
        updateData.rejection_reason = rejectionReason || null;
        // Also save to rejection_details for detailed information
        updateData.rejection_details = rejectionReason || null;
      } else {
        // Clear rejection reason and details if status is not rejected
        updateData.rejection_reason = null;
        updateData.rejection_details = null;
      }

      // Update the request in Supabase using the database function
      console.log('Updating request with ID:', window.currentRequestId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      console.log('Expected status:', newStatus);

      // First, check what the current status is
      const { data: beforeUpdate, error: beforeError } = await supabase
        .from('newadminrequests')
        .select('id, status')
        .eq('id', window.currentRequestId)
        .single();

      if (beforeError || !beforeUpdate) {
        console.error('Error fetching before update:', beforeError);
        throw new Error('Could not fetch request before update: ' + (beforeError?.message || 'Request not found'));
      }

      console.log('Status before update:', beforeUpdate.status);

      // Use the database function to update (bypasses RLS)
      let updateResult = null;
      let updateError = null;

      const { data: functionResult, error: functionError } = await supabase.rpc('update_newadminrequest_status', {
        p_request_id: window.currentRequestId,
        p_new_status: newStatus,
        p_admin_notes: notes,
        p_rejection_reason: rejectionReason,
        p_processed_by: session.id
      });

      // If function doesn't exist or fails, fall back to direct update
      if (functionError) {
        console.warn('Function call failed, trying direct update:', functionError);

        // Fallback to direct update
        const result = await supabase
          .from('newadminrequests')
          .update(updateData)
          .eq('id', window.currentRequestId)
          .select('id, status, updated_at');

        updateResult = result.data;
        updateError = result.error;
      } else {
        // Function succeeded
        console.log('Function call successful:', functionResult);

        // Fetch the updated record to verify
        const { data: fetchedResult, error: fetchError } = await supabase
          .from('newadminrequests')
          .select('id, status, updated_at')
          .eq('id', window.currentRequestId)
          .single();

        if (fetchError) {
          updateError = fetchError;
        } else {
          updateResult = fetchedResult ? [fetchedResult] : null; // Convert to array format
        }
      }

      if (updateError) {
        console.error('Supabase update error:', updateError);
        console.error('Request ID used:', window.currentRequestId);
        console.error('Error code:', updateError.code);
        console.error('Error message:', updateError.message);
        console.error('Error details:', JSON.stringify(updateError, null, 2));

        // Check if it's a constraint violation
        if (updateError.code === '23514' ||
          updateError.message?.includes('violates check constraint') ||
          updateError.message?.includes('check constraint') ||
          updateError.message?.includes('new row violates row-level security policy')) {
          const errorMsg = 'Database constraint violation: The status "' + newStatus + '" may not be allowed.\n\n' +
            'Error: ' + updateError.message + '\n\n' +
            'Please run the SQL file "final_fix_status_constraint.sql" in Supabase SQL Editor.\n\n' +
            'This will update the database constraint to allow the new status values.';
          alert(errorMsg);
          throw new Error('Status constraint violation: ' + updateError.message);
        }

        throw updateError;
      }

      // Check if update returned any rows
      if (!updateResult || updateResult.length === 0) {
        console.error('Update returned no rows - update may have been blocked');
        console.error('This could mean:');
        console.error('1. RLS policy is blocking the update');
        console.error('2. The record was deleted');
        console.error('3. The ID does not match');

        // Try to fetch the record to see if it still exists
        const { data: checkRecord } = await supabase
          .from('newadminrequests')
          .select('id, status')
          .eq('id', window.currentRequestId)
          .maybeSingle();

        if (!checkRecord) {
          throw new Error('Update failed: Record not found. It may have been deleted.');
        }

        // The record exists but update returned no rows
        // This usually means the constraint rejected the status value
        const errorMsg = 'Update was blocked by the database!\n\n' +
          'Attempted to set status to: "' + newStatus + '"\n' +
          'Current status in database: "' + checkRecord.status + '"\n\n' +
          'The database constraint likely does not allow "' + newStatus + '".\n\n' +
          'Solution: Run "simple_fix_constraint.sql" in Supabase SQL Editor.\n\n' +
          'This will update the constraint to allow all required status values.';

        alert(errorMsg);
        throw new Error('Update returned no rows. The status "' + newStatus + '" may not be allowed by the database constraint. Please run simple_fix_constraint.sql');
      }

      // Check what status was actually saved in the update result
      const savedStatus = updateResult[0]?.status;
      console.log('Status from update result:', savedStatus);

      if (savedStatus && savedStatus !== newStatus) {
        console.error('Status mismatch in update result!');
        console.error('Expected:', newStatus);
        console.error('Got from update result:', savedStatus);

        const errorMsg = 'Status was converted by the database!\n\n' +
          'Expected: "' + newStatus + '"\n' +
          'Got: "' + savedStatus + '"\n\n' +
          'This means the database constraint or default value is converting your status.\n\n' +
          'Please run "final_fix_status_constraint.sql" in Supabase SQL Editor to fix the constraint.';
        alert(errorMsg);
        throw new Error('Status was converted from "' + newStatus + '" to "' + savedStatus + '"');
      }

      // Wait a moment for the update to propagate (if needed)
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify update was successful by fetching the updated record
      const { data: verifyRequest, error: verifyError } = await supabase
        .from('newadminrequests')
        .select('id, status, updated_at, notes, rejection_reason, rejection_details, processed_at, processed_by')
        .eq('id', window.currentRequestId)
        .maybeSingle();

      if (verifyError) {
        console.error('Error verifying update:', verifyError);
        // Don't throw here - the update might have succeeded but we can't verify
        console.warn('Update may have succeeded but could not verify');
      }

      if (!verifyRequest) {
        console.error('Update verification failed: Request not found after update');
        console.error('Request ID:', window.currentRequestId);
        throw new Error('Update may have failed: Could not verify the update. Please refresh the page to check.');
      }

      console.log('Status from database:', verifyRequest.status);
      console.log('Expected status:', newStatus);

      // Verify the status actually changed
      if (verifyRequest.status !== newStatus) {
        console.error('Status mismatch detected!');
        console.error('  Expected:', newStatus);
        console.error('  Got from DB:', verifyRequest.status);
        console.error('  Update result:', updateResult);

        // Provide helpful error message
        const errorMsg = 'Status update mismatch detected.\n\n' +
          'Expected: "' + newStatus + '"\n' +
          'Got from database: "' + verifyRequest.status + '"\n\n' +
          'This usually means:\n' +
          '1. The database constraint doesn\'t allow "' + newStatus + '"\n' +
          '2. Or there\'s a default value converting it\n\n' +
          'Please ensure the SQL migration "update_newadminrequests_status_values.sql" has been run in Supabase SQL Editor.\n\n' +
          'The update may have been rejected or converted by the database.';

        alert(errorMsg);
        throw new Error('Status update mismatch: Database returned "' + verifyRequest.status + '" instead of "' + newStatus + '". Please check database constraints.');
      }

      console.log('Update verified successfully.');
      console.log('  - Status:', verifyRequest.status);
      console.log('  - Updated at:', verifyRequest.updated_at);
      console.log('  - Processed at:', verifyRequest.processed_at);
      console.log('  - Processed by:', verifyRequest.processed_by);

      // Verify processed_at logic
      if (['approved', 'rejected', 'customization_complete'].includes(newStatus)) {
        if (!verifyRequest.processed_at) {
          console.warn('Warning: processed_at is not set for processed status:', newStatus);
        }
      } else {
        if (verifyRequest.processed_at) {
          console.warn('Warning: processed_at should be null for non-processed status, but got:', verifyRequest.processed_at);
        }
      }

      // Use verifyRequest as the updated request (it has the key fields we need)
      // Fetch full data for UI updates
      const { data: fullUpdatedRequest, error: fetchError } = await supabase
        .from('newadminrequests')
        .select('*')
        .eq('id', window.currentRequestId)
        .maybeSingle();

      let updatedRequest;
      if (fetchError || !fullUpdatedRequest) {
        console.warn('Could not fetch full updated request, using verified data');
        // Use the verified request data we already have
        updatedRequest = verifyRequest;
      } else {
        updatedRequest = fullUpdatedRequest;
      }

      // Update the status display in the popup immediately
      const statusDisplayElement = document.getElementById('detailStatusDisplay');
      if (statusDisplayElement) {
        statusDisplayElement.innerHTML = getStatusBadge(updatedRequest.status);
      }

      // Update the status select dropdown
      if (statusSelect) {
        statusSelect.value = updatedRequest.status;
      }

      // Update rejection section visibility - use rejection_details if available, fallback to rejection_reason
      const rejectionSection = document.getElementById('rejectionSection');
      const rejectionReasonText = updatedRequest.rejection_details || updatedRequest.rejection_reason;
      if (updatedRequest.status === 'rejected' && rejectionReasonText) {
        if (rejectionSection) {
          rejectionSection.classList.remove('hidden');
          const rejectionReasonElement = document.getElementById('detailRejectionReason');
          if (rejectionReasonElement) {
            rejectionReasonElement.textContent = rejectionReasonText;
          }
        }
      } else {
        if (rejectionSection) {
          rejectionSection.classList.add('hidden');
        }
      }

      // Update admin notes section
      const adminNotesSection = document.getElementById('adminNotesSection');
      if (updatedRequest.notes) {
        if (adminNotesSection) {
          adminNotesSection.classList.remove('hidden');
          const adminNotesElement = document.getElementById('detailAdminNotes');
          if (adminNotesElement) {
            adminNotesElement.textContent = updatedRequest.notes;
          }
        }
      } else {
        if (adminNotesSection) {
          adminNotesSection.classList.add('hidden');
        }
      }

      // Update processed_at display
      const processedAtElement = document.getElementById('detailProcessedAt');
      if (processedAtElement && updatedRequest.processed_at) {
        processedAtElement.textContent = formatDate(updatedRequest.processed_at);
      }

      alert('Status updated successfully!');

      // Reload the page to refresh the table and all displays
      window.location.reload();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status: ' + (err.message || 'Unknown error'));
    }
  };

  // Hide view details popup
  const hideViewDetailsPopup = () => {
    const popup = document.getElementById('viewDetailsPopup');
    if (popup) {
      popup.classList.add('hidden');
      document.body.style.overflow = '';
      window.currentRequestId = null;
    }
  };

  // Reject request handler
  const rejectRequest = async () => {
    const rejectReasonTextarea = document.getElementById('rejectReasonTextarea');
    const rejectionReason = rejectReasonTextarea?.value.trim() || '';

    if (!rejectionReason) {
      alert('Please provide a rejection reason before rejecting the request.');
      if (rejectReasonTextarea) {
        rejectReasonTextarea.focus();
      }
      return;
    }

    // Validate request ID
    if (!window.currentRequestId) {
      alert('No request selected. Please close and reopen the details popup.');
      return;
    }

    // Confirm rejection
    const confirmMessage = 'Are you sure you want to reject this request?\n\nRejection Reason:\n' + rejectionReason;
    if (!confirm(confirmMessage)) {
      return;
    }

    // Set status to rejected and sync rejection reason in the form
    const statusSelect = document.getElementById('statusSelect');
    const rejectionReasonInput = document.getElementById('rejectionReasonInput');
    const rejectionReasonField = document.getElementById('rejectionReasonField');

    if (statusSelect) {
      statusSelect.value = 'rejected';
      // Trigger change event to show the rejection reason field
      statusSelect.dispatchEvent(new Event('change'));
    }

    // Sync the rejection reason from rejectReasonTextarea to rejectionReasonInput
    if (rejectionReasonInput) {
      rejectionReasonInput.value = rejectionReason;
      rejectionReasonInput.setAttribute('required', 'required');
    }

    if (rejectionReasonField) {
      rejectionReasonField.classList.remove('hidden');
    }

    // Now call saveStatusUpdate - it will use the values from the form
    await saveStatusUpdate();
  };

  // Reject request button handler
  const rejectRequestBtn = document.getElementById('rejectRequestBtn');
  if (rejectRequestBtn) {
    rejectRequestBtn.addEventListener('click', rejectRequest);
  }

  // UI Type Selection Modal Functions
  const uiTypes = [
    { type: 'government', display: 'Government', icon: '<path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />', class: 'ui-type-government' },
    { type: 'private', display: 'Private', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M9 9h6v6H9z" />', class: 'ui-type-private' },
    { type: 'mobile_shop', display: 'Mobile Shop', icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18.01" stroke-linecap="round" />', class: 'ui-type-mobile-shop' },
    { type: 'court', display: 'Court', icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="3" />', class: 'ui-type-court' },
    { type: 'college_school', display: 'College/School', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M10 8h4" />', class: 'ui-type-college-school' },
    { type: 'hospital', display: 'Hospital', icon: '<path d="M12 2v20M2 12h20" stroke-linecap="round" /><circle cx="12" cy="12" r="3" />', class: 'ui-type-hospital' },
    { type: 'bank', display: 'Bank', icon: '<rect x="2" y="8" width="20" height="14" rx="2" ry="2" /><path d="M6 8V6a4 4 0 0 1 8 0v2" /><line x1="8" y1="14" x2="16" y2="14" stroke-linecap="round" />', class: 'ui-type-bank' },
    { type: 'restaurant', display: 'Restaurant', icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />', class: 'ui-type-restaurant' },
    { type: 'retail', display: 'Retail', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />', class: 'ui-type-retail' },
    { type: 'ngo', display: 'NGO', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />', class: 'ui-type-ngo' },
    { type: 'hotel', display: 'Hotel', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />', class: 'ui-type-hotel' },
    { type: 'pharmacy', display: 'Pharmacy', icon: '<rect x="3" y="8" width="18" height="14" rx="2" /><path d="M8 8V6a4 4 0 1 1 8 0v2" /><line x1="12" y1="14" x2="12" y2="18" stroke-linecap="round" /><line x1="10" y1="16" x2="14" y2="16" stroke-linecap="round" />', class: 'ui-type-pharmacy' }
  ];

  const populateUITypesGrid = () => {
    const grid = document.getElementById('uiTypesGrid');
    if (!grid) return;

    grid.innerHTML = uiTypes.map(uiType => `
      <div class="ui-type-card ${uiType.class}" onclick="selectUITypeForApproval('${uiType.type}', '${uiType.display}')">
        <div class="ui-type-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            ${uiType.icon}
          </svg>
        </div>
        <h3 class="ui-type-card-title">${uiType.display}</h3>
      </div>
    `).join('');
  };

  const showUITypeSelectionModal = () => {
    const modal = document.getElementById('uiTypeSelectionModal');
    if (!modal) return;

    populateUITypesGrid();
    modal.classList.remove('hidden');
    // Keep the view details popup visible behind
  };

  const hideUITypeSelectionModal = () => {
    const modal = document.getElementById('uiTypeSelectionModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  };

  window.selectUITypeForApproval = function (type, displayName) {
    // Store selected UI type
    window.selectedUIType = type;
    window.selectedUITypeDisplay = displayName;

    // Update display in admin creation modal
    const displayElement = document.getElementById('selectedUITypeDisplay');
    const valueElement = document.getElementById('selectedUITypeValue');
    if (displayElement) displayElement.textContent = displayName;
    if (valueElement) valueElement.value = type;

    // Hide UI type selection modal and show admin creation modal
    hideUITypeSelectionModal();
    showAdminCreationModal();
  };

  const showAdminCreationModal = () => {
    const modal = document.getElementById('adminCreationModal');
    if (!modal) return;

    // Pre-fill email and name from request data if available
    const requestData = window.currentRequestData;
    if (requestData) {
      const emailInput = document.getElementById('newAdminEmail');
      if (emailInput && requestData.admin_email) {
        emailInput.value = requestData.admin_email;
      }
      // Pre-fill username from email or name if available
      const usernameInput = document.getElementById('newAdminUsername');
      if (usernameInput && !usernameInput.value && requestData.admin_email) {
        // Generate username from email (part before @)
        usernameInput.value = requestData.admin_email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      }
    }

    modal.classList.remove('hidden');
  };

  const hideAdminCreationModal = () => {
    const modal = document.getElementById('adminCreationModal');
    if (modal) {
      modal.classList.add('hidden');
      // Reset form
      const form = document.getElementById('adminCreationForm');
      if (form) form.reset();
      window.selectedUIType = null;
      window.selectedUITypeDisplay = null;
    }
  };

  // Store request data globally (initialized in showViewDetailsPopup)
  window.currentRequestData = null;

  // Handle admin creation form submission
  const handleAdminCreation = async (e) => {
    e.preventDefault();

    const email = document.getElementById('newAdminEmail')?.value.trim();
    const username = document.getElementById('newAdminUsername')?.value.trim();
    const pin = document.getElementById('newAdminPin')?.value.trim() || null;
    const password = document.getElementById('newAdminPassword')?.value;
    const passwordConfirm = document.getElementById('newAdminPasswordConfirm')?.value;
    const role = document.getElementById('newAdminRole')?.value;
    const uiType = document.getElementById('selectedUITypeValue')?.value;

    // Validation
    if (!email || !username || !password || !role || !uiType) {
      alert('Please fill in all required fields.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    const session = getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      window.location.href = 'Superadminindex.html';
      return;
    }

    try {
      // Create admin in database
      // Note: Using 'admin' table (lowercase) as per existing codebase
      const adminData = {
        email: email,
        username: username,
        pin: pin || null,
        password: password, // In production, this should be hashed
        role: role,
        ui_type: uiType, // Store the selected UI type
        is_active: true
        // Note: created_by column may not exist in schema - add if needed
      };

      const { data: newAdmin, error: adminError } = await supabase
        .from('admin')
        .insert(adminData)
        .select()
        .single();

      if (adminError) {
        console.error('Error creating admin:', adminError);

        // Check if error is due to missing ui_type column
        const errorMessage = adminError.message || '';
        if (errorMessage.includes('ui_type') || errorMessage.includes('column') || adminError.code === '42703') {
          alert('Error: The ui_type column is missing from the admin table.\n\nPlease run the SQL migration file:\nsql-query/add_ui_type_to_admin_table.sql\n\nin your Supabase SQL Editor to add the required column.');
        } else {
          alert('Error creating admin: ' + errorMessage);
        }
        return;
      }

      // Now update the request status to approved
      const statusSelect = document.getElementById('statusSelect');
      if (statusSelect) {
        statusSelect.value = 'approved';
      }

      // Update admin notes with creation details
      const adminNotesInput = document.getElementById('adminNotesInput');
      const existingNotes = adminNotesInput?.value.trim() || '';
      const creationNote = `Admin account created. UI Type: ${window.selectedUITypeDisplay}. Admin Email: ${email}. Admin Username: ${username}.`;
      if (adminNotesInput) {
        adminNotesInput.value = existingNotes ? `${existingNotes}\n\n${creationNote}` : creationNote;
      }

      // Save status update (will proceed since UI type is selected)
      await saveStatusUpdate();

      // Close modals
      hideAdminCreationModal();
      hideUITypeSelectionModal();

      alert(`Admin account created successfully!\n\nEmail: ${email}\nUsername: ${username}\nUI Type: ${window.selectedUITypeDisplay}\n\nThe request has been approved.`);

    } catch (err) {
      console.error('Error:', err);
      alert('Error creating admin account: ' + (err.message || 'Unknown error'));
    }
  };

  // Save status button handler
  const saveStatusBtn = document.getElementById('saveStatusBtn');
  if (saveStatusBtn) {
    saveStatusBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const statusSelect = document.getElementById('statusSelect');

      // If status is "approved", require UI type selection and admin creation first
      if (statusSelect && statusSelect.value === 'approved') {
        // Check if UI type has been selected (via admin creation flow)
        if (!window.selectedUIType) {
          // Show UI type selection modal - user must complete this flow first
          showUITypeSelectionModal();
          return;
        }
        // If UI type is selected but admin creation flow is not complete,
        // don't save yet - admin creation form submission will handle the save
        // Only allow direct save if we're not in the approval flow
        return;
      }

      // For non-approved statuses, proceed with normal save
      await saveStatusUpdate();
    });
  }

  // Close UI Type Selection Modal handlers
  const closeUITypeModal = document.getElementById('closeUITypeModal');
  if (closeUITypeModal) {
    closeUITypeModal.addEventListener('click', () => {
      hideUITypeSelectionModal();
      // Don't reset status - let user keep "approved" selected
      // They can change it manually if needed
    });
  }

  // Close Admin Creation Modal handlers
  const closeAdminCreationModal = document.getElementById('closeAdminCreationModal');
  if (closeAdminCreationModal) {
    closeAdminCreationModal.addEventListener('click', () => {
      hideAdminCreationModal();
      // Go back to UI type selection
      showUITypeSelectionModal();
    });
  }

  const cancelAdminCreationBtn = document.getElementById('cancelAdminCreationBtn');
  if (cancelAdminCreationBtn) {
    cancelAdminCreationBtn.addEventListener('click', () => {
      hideAdminCreationModal();
      showUITypeSelectionModal();
    });
  }

  // Admin creation form handler
  const adminCreationForm = document.getElementById('adminCreationForm');
  if (adminCreationForm) {
    adminCreationForm.addEventListener('submit', handleAdminCreation);
  }

  // Close modals on overlay click
  const uiTypeSelectionModal = document.getElementById('uiTypeSelectionModal');
  if (uiTypeSelectionModal) {
    uiTypeSelectionModal.addEventListener('click', (e) => {
      if (e.target === uiTypeSelectionModal) {
        hideUITypeSelectionModal();
        // Don't reset status - let user keep their selection
      }
    });
  }

  const adminCreationModal = document.getElementById('adminCreationModal');
  if (adminCreationModal) {
    adminCreationModal.addEventListener('click', (e) => {
      if (e.target === adminCreationModal) {
        hideAdminCreationModal();
        showUITypeSelectionModal();
      }
    });
  }

  // Close popup handlers
  const closeDetailsPopupBtn = document.getElementById('closeDetailsPopup');
  if (closeDetailsPopupBtn) {
    closeDetailsPopupBtn.addEventListener('click', hideViewDetailsPopup);
  }

  // Close popup on overlay click
  const popupOverlay = document.getElementById('viewDetailsPopup');
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        hideViewDetailsPopup();
      }
    });
  }

  // Close popup on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideViewDetailsPopup();
    }
  });

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        clearSession();
        window.location.href = 'Superadminindex.html';
      }
    });
  }

  // Check auth and load requests
  (async () => {
    if (await checkAuth()) {
      if (document.getElementById('loadingRow')) loadingRow.style.display = 'flex';
      loadNewAdminRequests();

      // Filter Buttons Logic
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Remove active class from all
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          // Add active class to clicked
          e.target.classList.add('active');
          // Load with filter
          loadNewAdminRequests(e.target.dataset.filter);
        });
      });
    }
  })();
})();


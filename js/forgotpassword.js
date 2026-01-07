(() => {
  const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const form = document.getElementById('passwordResetForm');
  const messageEl = document.getElementById('resetMessage');
  const fileInput = document.getElementById('idProof');
  const fileLabelEl = document.querySelector('.file-input-label');
  const successPopup = document.getElementById('successPopup');
  const popupMessage = document.getElementById('popupMessage');

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

  // Show success popup
  const showSuccessPopup = (message) => {
    if (!successPopup || !popupMessage) return;
    
    popupMessage.textContent = message;
    successPopup.classList.remove('hidden');
    
    // Redirect to index.html after 2 seconds
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      if (fileLabelEl) {
        fileLabelEl.textContent = 'Choose file or drag it here';
      }
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      showMessage('File size exceeds 10MB limit. Please choose a smaller file.', 'error');
      e.target.value = '';
      if (fileLabelEl) {
        fileLabelEl.textContent = 'Choose file or drag it here';
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Invalid file type. Please upload PDF or image files only.', 'error');
      e.target.value = '';
      if (fileLabelEl) {
        fileLabelEl.textContent = 'Choose file or drag it here';
      }
      return;
    }

    // Display file name in the label
    if (fileLabelEl) {
      fileLabelEl.textContent = file.name;
    }
    clearMessage();
  };

  // Initialize file input handler
  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  // Handle form submission
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    clearMessage();

    const email = document.getElementById('resetEmail')?.value?.trim();
    const username = document.getElementById('resetUsername')?.value?.trim();
    const reason = document.getElementById('resetReason')?.value?.trim();
    const deliveryMethod = document.getElementById('deliveryMethod')?.value;
    const idProofFile = fileInput?.files[0];

    if (!email) {
      showMessage('Please enter your email address.', 'error');
      return;
    }

    if (!idProofFile) {
      showMessage('Please upload an ID proof document.', 'error');
      return;
    }

    if (!deliveryMethod) {
      showMessage('Please select a delivery method for receiving new credentials.', 'error');
      return;
    }

    showMessage('Sending reset request...');

    try {
      // Check if admin exists
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('id, email, username, name')
        .eq('email', email)
        .single();

      if (adminError || !adminData) {
        showMessage('No admin account found with this email address.', 'error');
        return;
      }

      // If username is provided, verify it matches
      if (username && adminData.username !== username) {
        showMessage('Username does not match the email address.', 'error');
        return;
      }

      // Upload ID proof file to Supabase Storage
      const fileExt = idProofFile.name.split('.').pop();
      const fileName = `id_proof_${adminData.id}_${Date.now()}.${fileExt}`;
      const filePath = `password-resets/${fileName}`;

      showMessage('Uploading ID proof...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admin-documents')
        .upload(filePath, idProofFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // If storage bucket doesn't exist, continue without file upload
        // In production, you should create the bucket first
        console.warn('File upload failed (storage bucket may not exist):', uploadError);
      }

      // Get public URL if upload was successful
      let fileUrl = null;
      if (uploadData && !uploadError) {
        const { data: urlData } = supabase.storage
          .from('admin-documents')
          .getPublicUrl(filePath);
        fileUrl = urlData?.publicUrl;
      }

      // Store password reset request
      const resetRequest = {
        admin_id: adminData.id,
        admin_email: email,
        admin_username: username || adminData.username,
        admin_name: adminData.name,
        reason: reason || null,
        delivery_method: deliveryMethod,
        id_proof_url: fileUrl,
        id_proof_filename: fileName,
        status: 'pending'
      };

      // Insert into forgotpassrequestadmin table
      const { data, error } = await supabase
        .from('forgotpassrequestadmin')
        .insert([resetRequest]);

      if (error) {
        console.error('Error inserting reset request:', error);
        showMessage('Failed to send reset request. Please try again.', 'error');
        return;
      }

      // Get delivery method display text
      const deliveryText = deliveryMethod === 'email' ? 'Email' 
        : deliveryMethod === 'sms' ? 'SMS' 
        : deliveryMethod === 'email_sms' ? 'Email & SMS' 
        : 'Secure Message Portal';

      // Show success popup and redirect
      const successMessage = `Password reset request sent successfully! New credentials will be sent via ${deliveryText}. The super admin will review your request shortly.`;
      showSuccessPopup(successMessage);
      
      // Reset form
      form?.reset();
      if (fileLabelEl) {
        fileLabelEl.textContent = 'Choose file or drag it here';
      }

    } catch (error) {
      console.error('Error submitting reset request:', error);
      showMessage('An error occurred. Please try again later.', 'error');
    }
  };

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
})();


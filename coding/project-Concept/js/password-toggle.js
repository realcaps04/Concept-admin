// Password visibility toggle functionality
(() => {
  // Function to initialize a single password toggle
  const initPasswordToggle = (toggle) => {
    // Skip if already initialized
    if (toggle.dataset.initialized === 'true') return;
    toggle.dataset.initialized = 'true';
    
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Find the associated password input
      const inputContainer = this.closest('.input');
      if (!inputContainer) return;
      
      // Find the input field - try password type first, then any input
      let input = inputContainer.querySelector('input[type="password"]');
      if (!input) {
        // If not found, it might already be toggled to text, so find any input
        input = inputContainer.querySelector('input');
      }
      
      if (!input) return;
      
      // Only process password/PIN fields
      const inputId = input.id?.toLowerCase() || '';
      const autocomplete = input.getAttribute('autocomplete') || '';
      const isPasswordField = input.type === 'password' || 
                              inputId.includes('password') ||
                              inputId.includes('pin') ||
                              autocomplete.includes('password') ||
                              autocomplete === 'one-time-code';
      
      if (!isPasswordField) return;
      
      // Toggle input type between password and text
      if (input.type === 'password') {
        input.type = 'text';
        this.classList.add('show');
      } else if (input.type === 'text') {
        input.type = 'password';
        this.classList.remove('show');
      }
    });
  };

  // Initialize all password toggles
  const initPasswordToggles = () => {
    const passwordToggles = document.querySelectorAll('.password-toggle:not([data-initialized="true"])');
    passwordToggles.forEach(toggle => {
      initPasswordToggle(toggle);
    });
  };

  // Make it available globally for manual initialization
  window.initPasswordToggles = initPasswordToggles;

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasswordToggles);
  } else {
    initPasswordToggles();
  }
  
  // Listen for custom initialization event
  document.addEventListener('passwordTogglesInit', initPasswordToggles);
  
  // Re-initialize when new content is added (for dynamically loaded popups)
  const observer = new MutationObserver(() => {
    initPasswordToggles();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

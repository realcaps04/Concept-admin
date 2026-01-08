  // Define mapping between tab classes and their corresponding content areas
  const tabMap = {
    '.gi': '.Generalareamain',
    '.hd': '.hostelareamain',
    '.rm': '.roomareamain',
    '.msg': '.messageareamain',
    '.pd': '.paymentdetailsareamain',
    '.crfn': '.confirmationareamain',
    '.pyt': '.paymentareamain'
  };

  // Function to hide all content areas and remove active underline
  function resetTabs() {
    Object.values(tabMap).forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.classList.add('hide');
    });

//     // Hide all orange underlines
//     document.querySelectorAll('.orangeunderline').forEach(hr => {
//       hr.classList.add('hide');
//     });
  }

  // Function to activate a tab
  function activateTab(tabClass) {
    resetTabs();

    // Show the selected content area
    const contentSelector = tabMap[tabClass];
    const contentEl = document.querySelector(contentSelector);
    if (contentEl) contentEl.classList.remove('hide');

    // Show the orange underline for the active tab
    const tabEl = document.querySelector(tabClass);
    if (tabEl) {
      const hr = tabEl.querySelector('.orangeunderline');
      if (hr) hr.classList.remove('hide');
    }
  }

  // Attach event listeners to all tabs
  Object.keys(tabMap).forEach(tabClass => {
    const tab = document.querySelector(tabClass);
    if (tab) {
      tab.addEventListener('click', () => activateTab(tabClass));
    }
  });

  // Optionally activate the first tab on load
  activateTab('.gi');



  // Function to apply display: flex to .Generalareamain
  function applyFlexToGeneralArea() {
    const generalArea = document.querySelector('.Generalareamain');
    if (generalArea) {
      if (!generalArea.classList.contains('hide')) {
        generalArea.style.display = 'flex';
      } else {
        generalArea.style.display = 'none';
      }
    }
  }

  // Run on initial load
  document.addEventListener('DOMContentLoaded', applyFlexToGeneralArea);

  // Also run after every tab switch
  const originalActivateTab = window.activateTab; // assuming activateTab is global
  window.activateTab = function(tabClass) {
    originalActivateTab(tabClass);
    applyFlexToGeneralArea();
  };





document.addEventListener('DOMContentLoaded', function () {
  const upBtn = document.querySelector('.up');
  const qrBtn = document.querySelector('.qr');
  const cpBtn = document.querySelector('.cp');

  const upiArea = document.querySelector('.upipaymentarea');
  const qrArea = document.querySelector('.qrpaymentarea');
  const cardArea = document.querySelector('.cardpaymentarea');

  function hideAll() {
    upiArea.classList.add('hide');
    qrArea.classList.add('hide');
    cardArea.classList.add('hide');
    
    // Remove display flex from QR area when hiding
    qrArea.style.display = '';
  }

  upBtn.addEventListener('click', () => {
    hideAll();
    upiArea.classList.remove('hide');
  });

  qrBtn.addEventListener('click', () => {
    hideAll();
    qrArea.classList.remove('hide');
    qrArea.style.display = 'flex';
  });

  cpBtn.addEventListener('click', () => {
    hideAll();
    cardArea.classList.remove('hide');
  });
});

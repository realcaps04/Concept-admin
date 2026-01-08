document.addEventListener('DOMContentLoaded', function() {
    const pcAlert = document.querySelector('.pcalert');
    const pcAlertBg = document.querySelector('.pcalertbg'); // Background element (if any)
    const continueBtn = document.querySelector('.continue');

    // Show the alert with animation
    if (pcAlert) {
        pcAlert.style.display = 'block';
        setTimeout(() => {
            pcAlert.classList.add('show');
        }, 10);
    }

    // Hide both alert and background when continue is clicked
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (pcAlert) {
                pcAlert.classList.remove('show');
                setTimeout(() => {
                    pcAlert.style.display = 'none';
                    pcAlert.classList.add('hide');
                }, 300); // Match with CSS transition
            }

            if (pcAlertBg) {
                pcAlertBg.classList.add('hide'); // Add hide class to background
                setTimeout(() => {
                    pcAlertBg.style.display = 'none'; // Optional: Hide completely
                }, 300); // Match with CSS transition
            }
        });
    }
});
// // Method 1: Using event listeners
//         document.addEventListener('contextmenu', function(e) {
//             e.preventDefault();
//             // alert('Right-click is disabled on this website.');
//         });



// Get elements
const emailInput = document.getElementById('unlockemail');
const unlockButton = document.querySelector('.unlockproject');
const checkEmailError = document.querySelector('.checkemail');

// Initially disable the button
unlockButton.disabled = true;

// Validate email on input
emailInput.addEventListener('input', function() {
    const emailValue = this.value.trim();
    const isValid = emailValue.endsWith('@gmail.com');

    // Toggle button disabled state
    unlockButton.disabled = !isValid;

    // Show/hide error message
    if (emailValue.includes('@') && !isValid) {
        checkEmailError.classList.remove('hide');
    } else {
        checkEmailError.classList.add('hide');
    }
});




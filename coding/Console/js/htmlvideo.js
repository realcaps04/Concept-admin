





const hideShowElement = document.querySelector('.hideshow');
        const passwordInput = document.getElementById('unlockpass');
        
        // Click event
        hideShowElement.addEventListener('click', function() {
            togglePasswordVisibility();
        });
        
        // Hover events
        hideShowElement.addEventListener('mouseenter', function() {
            passwordInput.type = 'text';
            hideShowElement.textContent = 'Hide';
        });
        
        hideShowElement.addEventListener('mouseleave', function() {
            passwordInput.type = 'password';
            hideShowElement.textContent = 'Show';
        });
        
        function togglePasswordVisibility() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                hideShowElement.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                hideShowElement.textContent = 'Show';
            }
        }







document.querySelector('.unlockproject').addEventListener('click', function(event) {
    // Fields checked for emptiness
    const emailField = document.getElementById('unlockemail');
    const passField = document.getElementById('unlockpass');

    // Fields to style on error (different from above)
    const emailStyleField = document.getElementById('email');
    const passStyleField = document.getElementById('password');

    const emailError = document.querySelector('.enteremail');
    const passError = document.querySelector('.enterpass');
    let isValid = true;

    // Reset previous error states
    emailStyleField.style.borderColor = '';
    passStyleField.style.borderColor = '';
    emailError.classList.add('hide');
    passError.classList.add('hide');

    // Validate email (check unlockemail, style 'email')
    if (!emailField.value.trim()) {
        emailError.classList.remove('hide');
        emailStyleField.style.borderColor = '#D84226';
        isValid = false;
    }

    // Validate password (check unlockpass, style 'password')
    if (!passField.value.trim()) {
        passError.classList.remove('hide');
        passStyleField.style.borderColor = '#D84226';
        isValid = false;
    }

    // Exit if validation fails
    if (!isValid) {
        event.preventDefault();
        if (navigator.vibrate) navigator.vibrate(500);
        return;
    }

    // --- Original authentication flow ---
    const email = emailField.value;
    const password = passField.value;
    const authVideo = document.getElementById('authenticating');
    const errorMessage = document.querySelector('.errormessage');
    const videoBgBlack = document.querySelector('.videobgblack');

    authVideo.classList.remove('hide');
    errorMessage.classList.add('hide');
    authVideo.play();

    // Check if screen width is 480px or less and show the black video background
    if (window.matchMedia('(max-width: 480px)').matches) {
        videoBgBlack.classList.remove('hide');
    }

    setTimeout(function() {
        if (email === "edisonbijumullappallil@gmail.com" && password === "Edison@3455") {
            window.location.href = "../pvtprojects/erentzmodule.html";
        } 
        else if (email === "anandhan@gmail.com" && password === "Edvhjbd@3455") {
            window.location.href = "hotel.html";
        }
        else if (email === "AthulyaAnilkumar_Projects@gmail.com" && password === "AthulyaAnilkumar_Projects") {
            window.location.href = "../pvtprojects/hostohavenmodule.html";
        }
        else if (email === "vgrdff@gmail.com" && password === "capsam5") {
            window.location.href = "sample.html";
        }
        else if (email === "edisonbijdgeppallil@gmail.com" && password === "Edisfrshre455") {
            window.location.href = "sadd.html";
        }
        else if (email === "saniyabinu898@gmail.com" && password === "Saniyabinu89") {
            window.location.href = "../pvtprojects/hostohavenmodule.html";
        }
        else {
            authVideo.classList.add('hide');
            authVideo.pause();
            errorMessage.classList.remove('hide');
            // Also hide the black video background on error
            if (window.matchMedia('(max-width: 480px)').matches) {
                videoBgBlack.classList.add('hide');
            }
        }
    }, 6500);
});







document.getElementById('unlockemail').addEventListener('input', function() {
    const emailInput = this;
    const emailContainer = document.getElementById('email');
    const emailValue = emailInput.value.trim();
    const checkEmailError = document.querySelector('.checkemail');
    
    // Reset styles and hide error message initially
    emailContainer.style.borderColor = '';
    checkEmailError.classList.add('hide');
    
    if (emailValue.length === 0) {
        // Empty field - no styling
        return;
    }
    
    if (!emailValue.includes('@')) {
        // Has text but no @ symbol
        emailContainer.style.borderColor = '#FFD700'; // Gold color
    } 
    else if (!emailValue.endsWith('@gmail.com')) {
        // Has @ but doesn't end with @gmail.com
        emailContainer.style.borderColor = 'rgb(216, 66, 38)'; // Red color
        checkEmailError.classList.remove('hide'); // Show error message
    } 
    else {
        // Valid email format (@gmail.com)
        emailContainer.style.borderColor = '#fff'; // Orange color
    }
});
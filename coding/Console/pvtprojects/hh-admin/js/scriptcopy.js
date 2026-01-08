document.addEventListener('DOMContentLoaded', function() {
    const imagePreviewPairs = [
        { inputClass: 'updatehostelmain1', previewClass: 'editmainimagehostelmain1' },
        { inputClass: 'updatesubimg1main', previewClass: 'updatedsubimg1main' },
        { inputClass: 'updatesubimg2main', previewClass: 'updatedsubimg2main' },
        { inputClass: 'updatesubimg3main', previewClass: 'updatedsubimg3main' },
        { inputClass: 'updatesubimg4main', previewClass: 'updatedsubimg4main' }
    ];

    imagePreviewPairs.forEach(pair => {
        const uploadInput = document.querySelector(`.${pair.inputClass}`);
        const imagePreview = document.querySelector(`.${pair.previewClass}`);

        if (uploadInput && imagePreview) {
            uploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        imagePreview.src = event.target.result;
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    alert('Please select a valid image file');
                    uploadInput.value = '';
                }
            });
        } else {
            console.error(`Elements not found for: ${pair.inputClass} -> ${pair.previewClass}`);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const addExtraPhotosBtn = document.querySelector('.editextraphotos');
    const cancelExtraPhotosBtn = document.querySelector('.canceleditphotos');
    const subImageThree = document.querySelector('.subimagethree');
    
    if (addExtraPhotosBtn) {
        addExtraPhotosBtn.addEventListener('click', function() {
            if (subImageThree) subImageThree.classList.remove('hide');
            if (cancelExtraPhotosBtn) cancelExtraPhotosBtn.classList.remove('hide');
            this.classList.add('hide');
        });
    }
    
    if (cancelExtraPhotosBtn) {
        cancelExtraPhotosBtn.addEventListener('click', function() {
            if (subImageThree) {
                subImageThree.classList.add('hide');
                subImageThree.style.display = '';
            }
            this.classList.add('hide');
            if (addExtraPhotosBtn) addExtraPhotosBtn.classList.remove('hide');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    for (let i = 1; i <= 5; i++) {
        const uploadInput = document.querySelector(`.updatesubimagethree${i}`);
        const imagePreview = document.querySelector(`.updatedsubimagethree${i}`);

        if (uploadInput && imagePreview) {
            uploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        imagePreview.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Please select a valid image file');
                    uploadInput.value = '';
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelector('.editsomehostel'); // Update this selector if needed
    const modal = document.querySelector('.edithostelmain');
    const overlay = document.querySelector('.bgedithostelmain');
    const closeButtons = document.querySelectorAll('.closeedithostelmain1');

    addButton?.addEventListener('click', () => {
        modal.classList.remove('hide');
        overlay.classList.remove('hide');
    });

    function closeModal() {
        modal.classList.add('hide');
        overlay.classList.add('hide');
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
});










document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.querySelectorAll('.edithostel'); // Select all elements with edithostel class
    const modal = document.querySelector('.edithostelmain');
    const overlay = document.querySelector('.bgedithostelmain');
    const closeButtons = document.querySelectorAll('.closeedithostelmain1');
    const editExtraPhotosBtn = document.querySelector('.editextraphotos');
    const subImageThree = document.querySelector('.subimagethree');

    // Function to show modal
    const showModal = () => {
        modal.classList.remove('hide');
        overlay.classList.remove('hide');
    };

    // Function to close modal
    const closeModal = () => {
        modal.classList.add('hide');
        overlay.classList.add('hide');
    };

    // Add event listeners to all edit buttons
    addButton.forEach(button => {
        button.addEventListener('click', showModal);
    });

    // Close when clicking outside modal
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Close when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Show additional photos when "editextraphotos" is clicked
    if (editExtraPhotosBtn && subImageThree) {
        editExtraPhotosBtn.addEventListener('click', () => {
            subImageThree.style.display = 'flex';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('.edithostel');
    const closeButton = document.querySelector('.closeedithostelmain1');
    const hostelContent = document.querySelector('.edithostelmain');
    const background = document.querySelector('.bgedithostelmain');

    // Animation configuration
    const fadeInKeyframes = [
        { opacity: 0 },
        { opacity: 1 }
    ];

    const fadeOutKeyframes = [
        { opacity: 1 },
        { opacity: 0 }
    ];

    const animationOptions = {
        duration: 400,
        easing: 'ease-in-out',
        fill: 'forwards'
    };

    // Function to show elements with animation
    const showElements = () => {
        hostelContent.classList.remove('hide');
        background.classList.remove('hide');
        hostelContent.animate(fadeInKeyframes, animationOptions);
        background.animate(fadeInKeyframes, animationOptions);
    };

    // Function to hide elements with animation
    const hideElements = () => {
        const contentAnimation = hostelContent.animate(fadeOutKeyframes, animationOptions);
        background.animate(fadeOutKeyframes, animationOptions);
        
        contentAnimation.onfinish = () => {
            hostelContent.classList.add('hide');
            background.classList.add('hide');
        };
    };

    // Attach event listeners
    openButtons.forEach(button => {
        button.addEventListener('click', showElements);
    });
    
    closeButton.addEventListener('click', hideElements);
    background.addEventListener('click', hideElements);
});
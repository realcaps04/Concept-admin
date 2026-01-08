document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger');
    const slideMenu = document.querySelector('.hamburgurslide');
    
    if (hamburgerBtn && slideMenu) {
        // Initialize the menu state
        let isCollapsed = false;
        
        hamburgerBtn.addEventListener('click', function() {
            // Toggle the collapsed state
            isCollapsed = !isCollapsed;
            
            if (isCollapsed) {
                // Collapse the menu - show only icons
                slideMenu.style.width = '5.5vw';
                slideMenu.classList.add('collapsing');
                
                // Hide all h3 elements in the menu
                const allH3 = slideMenu.querySelectorAll('h3');
                allH3.forEach(h3 => {
                    h3.style.display = 'none';
                });
                
                // Add transition end listener
                slideMenu.addEventListener('transitionend', function onTransitionEnd() {
                    slideMenu.classList.remove('collapsing');
                    slideMenu.classList.add('collapsed');
                    slideMenu.removeEventListener('transitionend', onTransitionEnd);
                }, { once: true });
                
            } else {
                // Expand the menu - show icons and text
                slideMenu.classList.remove('collapsed');
                slideMenu.classList.add('expanding');
                slideMenu.style.width = '14vw';
                
                // Show all h3 elements in the menu
                const allH3 = slideMenu.querySelectorAll('h3');
                allH3.forEach(h3 => {
                    h3.style.display = 'block';
                });
                
                // Add transition end listener
                slideMenu.addEventListener('transitionend', function onTransitionEnd() {
                    slideMenu.classList.remove('expanding');
                    slideMenu.removeEventListener('transitionend', onTransitionEnd);
                }, { once: true });
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Get all hostel image containers
    const hosimageflexContainers = document.querySelectorAll('.hosimageflex');

    hosimageflexContainers.forEach(container => {
        const images = container.querySelectorAll('img');
        const leftArrow = container.closest('.hostelimagemain').querySelector('.hostoadminleft');
        const rightArrow = container.closest('.hostelimagemain').querySelector('.hostoadminright');
        let currentIndex = 0;

        // Function to update the carousel
        function updateCarousel() {
            // Hide all images
            images.forEach(img => {
                img.classList.add('hide');
                img.style.opacity = '0';
            });

            // Show current image with animation
            images[currentIndex].classList.remove('hide');
            images[currentIndex].style.opacity = '1';
        }

        // Set up click events for arrows
        leftArrow.addEventListener('click', function() {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
            updateCarousel();
        });

        rightArrow.addEventListener('click', function() {
            currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        });

        // Initialize the first image
        updateCarousel();
    });
});












document.addEventListener('DOMContentLoaded', function() {
    // Define all your input-preview pairs in this array
    const imagePreviewPairs = [
        { inputClass: 'uploadhostelmain1', previewClass: 'mainimagehostelmain1' },
        { inputClass: 'uploadsubimg1main', previewClass: 'uploadedsubimg1main' },
        { inputClass: 'uploadsubimg2main', previewClass: 'uploadedsubimg2main' },
        { inputClass: 'uploadsubimg3main', previewClass: 'uploadedsubimg3main' },
        { inputClass: 'uploadsubimg4main', previewClass: 'uploadedsubimg4main' }
    ];

    // Process each pair
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
                    uploadInput.value = '';  // Reset input
                }
            });
        } else {
            console.error(`Elements not found for: ${pair.inputClass} -> ${pair.previewClass}`);
        }
    });
});




document.addEventListener('DOMContentLoaded', function() {
    const addExtraPhotosBtn = document.querySelector('.addextraphotos');
    const cancelExtraPhotosBtn = document.querySelector('.cancelextraphotos');
    const subImageThree = document.querySelector('.subimagethree');
    
    if (addExtraPhotosBtn) {
        addExtraPhotosBtn.addEventListener('click', function() {
            // Show additional elements
            if (subImageThree) {
                subImageThree.classList.remove('hide');
                subImageThree.style.display = 'flex';  // Add display:flex
            }
            if (cancelExtraPhotosBtn) {
                cancelExtraPhotosBtn.classList.remove('hide');
            }
            
            // Hide the clicked button
            this.classList.add('hide');
        });
    }
    
    if (cancelExtraPhotosBtn) {
        cancelExtraPhotosBtn.addEventListener('click', function() {
            // Hide additional elements
            if (subImageThree) {
                subImageThree.classList.add('hide');
                subImageThree.style.display = '';  // Reset display property
            }
            this.classList.add('hide');
            
            // Show the main button
            if (addExtraPhotosBtn) {
                addExtraPhotosBtn.classList.remove('hide');
            }
        });
    }
});






document.addEventListener('DOMContentLoaded', function() {
    // Loop through image input IDs 1-5
    for (let i = 1; i <= 5; i++) {
        const uploadInput = document.querySelector(`.uploadsubimagethree${i}`);
        const imagePreview = document.querySelector(`.uploadedsubimagethree${i}`);

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
            console.error(`Elements for image ${i} not found`);
        }
    }
});




document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.querySelector('.addnewshostel');
  const modal = document.querySelector('.addnewhostelmain');
  const overlay = document.querySelector('.bgaddnewhostelmain');
  const closeButtons = document.querySelectorAll('.close-btn');

  // Show modal
  addButton.addEventListener('click', () => {
    modal.classList.remove('hide');
    overlay.classList.remove('hide');
  });

  // Close modal
  function closeModal() {
    modal.classList.add('hide');
    overlay.classList.add('hide');
  }

  // Close when clicking outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close when clicking close button
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
});



document.addEventListener('DOMContentLoaded', () => {

  // 1. Select all the necessary elements from the page
  const openButton = document.querySelector('.addnewshostel');
  const closeButton = document.querySelector('.closeaddnewhostelmain1');
  const hostelContent = document.querySelector('.addnewhostelmain');
  const background = document.querySelector('.bgaddnewhostelmain');

  // 2. Define the animation keyframes and timing
  // These objects are used by the Web Animations API
  const fadeInKeyframes = [
    { opacity: 0 },
    { opacity: 1 }
  ];

  const fadeOutKeyframes = [
    { opacity: 1 },
    { opacity: 0 }
  ];

  const animationOptions = {
    duration: 400, // Animation speed in milliseconds
    easing: 'ease-in-out', // Smoother animation timing
    fill: 'forwards' // Keeps the element in its final state after animating
  };

  // 3. Create the function to show the elements
  const showElements = () => {
    // First, remove the 'hide' class so the element can be displayed
    hostelContent.classList.remove('hide');
    background.classList.remove('hide');

    // Then, run the fade-in animation on both elements
    hostelContent.animate(fadeInKeyframes, animationOptions);
    background.animate(fadeInKeyframes, animationOptions);
  };

  // 4. Create the function to hide the elements
  const hideElements = () => {
    // Run the fade-out animation first
    const contentAnimation = hostelContent.animate(fadeOutKeyframes, animationOptions);
    background.animate(fadeOutKeyframes, animationOptions);

    // When the animation is finished, add the 'hide' class back
    // This properly removes it from the page flow
    contentAnimation.onfinish = () => {
      hostelContent.classList.add('hide');
      background.classList.add('hide');
    };
  };

  // 5. Attach the functions to the button click events
  openButton.addEventListener('click', showElements);
  closeButton.addEventListener('click', hideElements);
  // Optional: Also hide when the background is clicked
  background.addEventListener('click', hideElements);

});





// document.addEventListener('DOMContentLoaded', function() {
//     const uploadInput = document.querySelector('.uploadsubimagethree1');
//     const imagePreview = document.querySelector('.uploadedsubimagethree1');

//     if (uploadInput && imagePreview) {
//         uploadInput.addEventListener('change', function(e) {
//             const file = e.target.files[0];
            
//             if (file && file.type.startsWith('image/')) {
//                 const reader = new FileReader();
                
//                 reader.onload = function(event) {
//                     imagePreview.src = event.target.result;
//                 };
                
//                 reader.readAsDataURL(file);
//             } else {
//                 alert('Please select a valid image file');
//                 uploadInput.value = '';
//             }
//         });
//     } else {
//         console.error('Required elements not found');
//     }
// });





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



document.addEventListener('DOMContentLoaded', () => {
    // Find the button that will be clicked to show images
    const editButton = document.querySelector('.editextraphotos');

    // Find the button that will be clicked to hide images
    const cancelButton = document.querySelector('.canceleditphotos');

    // Find all the image containers that need to be changed
    const imageContainers = document.querySelectorAll('.subimagethree');

    // Add a click event listener to the edit button
    editButton.addEventListener('click', () => {
        // Loop through each image container
        imageContainers.forEach(container => {
            // 1. Remove the 'hide' class to make it visible
            container.classList.remove('hide');

            // 2. Set its display style to 'flex' to ensure proper layout if using flexbox
            container.style.display = 'flex';
        });
    });

    // Add a click event listener to the cancel button
    cancelButton.addEventListener('click', () => {
        // Loop through each image container
        imageContainers.forEach(container => {
            // 1. Add the 'hide' class back to make it invisible
            container.classList.add('hide');

            // 2. Set its display style to 'none' to fully hide it (or clear it if 'hide' handles display)
            // You can choose to set it to 'none' directly, or an empty string ''
            // if your .hide class primarily handles display: none;
            container.style.display = 'none'; // Recommended for direct hiding
            // Alternatively: container.style.display = ''; // If .hide class handles display: none;
        });
    });
});



document.querySelector('.uploadnewwardenimg').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.newwardenprofileicon').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Show add warden form
document.querySelector('.addnewwarden').addEventListener('click', function() {
    const addWarden = document.querySelector('.addwarden');
    const addWardenGrey = document.querySelector('.addwardengrey');
    
    // Remove hide class and trigger animation
    addWarden.classList.remove('hide');
    addWardenGrey.classList.remove('hide');
    
    // Force reflow to ensure animation triggers
    addWarden.offsetHeight;
    addWardenGrey.offsetHeight;
    
    // Add animation classes
    addWarden.style.animation = 'fadeIn 0.3s ease-in-out forwards';
    addWardenGrey.style.animation = 'fadeIn 0.3s ease-in-out forwards';
});

// Hide add warden form
document.querySelector('.closeaddwardenbtn').addEventListener('click', function() {
    const addWarden = document.querySelector('.addwarden');
    const addWardenGrey = document.querySelector('.addwardengrey');
    
    // Add fade out animation
    addWarden.style.animation = 'fadeOut 0.3s ease-in-out forwards';
    addWardenGrey.style.animation = 'fadeOut 0.3s ease-in-out forwards';
    
    // Wait for animation to complete before adding hide class
    setTimeout(function() {
        addWarden.classList.add('hide');
        addWardenGrey.classList.add('hide');
        // Reset animation
        addWarden.style.animation = '';
        addWardenGrey.style.animation = '';
    }, 300);
});

// Add CSS animations dynamically (since you said no CSS needed)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    .hide {
        display: none !important;
    }
`;
document.head.appendChild(style);






document.querySelectorAll('.uploadrentphotomainimage').addEventListener('change', function(event) {
    const file1 = event.target.files[0];
    if (file1) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.uploadedrentphotomainimage').src = e.target.result;
        };
        reader.readAsDataURL(file1);
    }
});




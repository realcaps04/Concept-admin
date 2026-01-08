document.addEventListener('DOMContentLoaded', function() {
    // Get all notification containers
    const notificationContainers = document.querySelectorAll('.notificationalert.hide');
    
    // Set up hover/click for notify elements
    document.querySelectorAll('.notify').forEach((notifyElement, index) => {
        if (notificationContainers[index]) {
            notifyElement.addEventListener('mouseenter', function() {
                notificationContainers[index].classList.remove('hide');
            });
            
            notifyElement.addEventListener('click', function(e) {
                e.preventDefault();
                notificationContainers[index].classList.remove('hide');
            });
        }
    });
    
    // Set up click for mark elements
    document.querySelectorAll('.mark').forEach(markElement => {
        markElement.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the closest notification container
            const notification = this.closest('.notificationalert');
            if (notification) {
                // Hide the notification
                notification.classList.add('hide');
                
                // Update ALL countnumber elements on the page
                document.querySelectorAll('.countnumber').forEach(countNumber => {
                    countNumber.textContent = '0';
                });
            }
        });
    });
});






document.querySelector(".Deny1").addEventListener("click", function() {
    const notiMsg = document.querySelector(".notimsg1");
    
    // Apply animation
    notiMsg.style.opacity = "0";
    notiMsg.style.height = "0";
    notiMsg.style.padding = "0";
    notiMsg.style.margin = "0";
    notiMsg.style.transition = "all 0.5s ease";
    notiMsg.style.overflow = "hidden";
    
    // Remove after animation completes
    setTimeout(() => {
        notiMsg.style.display = "none";
    }, 500); // Match transition time (0.5s)
});





document.addEventListener('DOMContentLoaded', function() {
    // Get all upscroll elements
    const upscrollElements = document.querySelectorAll('.upscroll');
    
    // Add click event to each upscroll element
    upscrollElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Smooth scroll to top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
});




document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const hamburgerBtn = document.querySelector('.mobilehamburgur');
    const closeBtn = document.querySelector('.close-hamburgur');
    const slideMenu = document.querySelector('.hamburguerslide.hide');
    
    // Only proceed if all elements exist
    if (hamburgerBtn && closeBtn && slideMenu) {
        // Animation duration (500ms for slower effect)
        const animationDuration = 500;
        
        // Open menu function with right-to-left animation
        function openMenu() {
            slideMenu.classList.remove('hide');
            slideMenu.style.display = 'block';
            
            // Trigger animation after a tiny delay
            setTimeout(() => {
                slideMenu.style.transform = 'translateX(0)';
                slideMenu.style.opacity = '1';
            }, 10);
        }
        
        // Close menu function with left-to-right animation
        function closeMenu() {
            slideMenu.style.transform = 'translateX(100%)';
            slideMenu.style.opacity = '0';
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                slideMenu.classList.add('hide');
                slideMenu.style.display = 'none';
            }, animationDuration);
        }
        
        // Event listeners
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMenu();
        });
        
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
        });
        
        // Close when clicking outside the menu
        document.addEventListener('click', function(e) {
            if (!slideMenu.contains(e.target) && 
                !hamburgerBtn.contains(e.target) && 
                !slideMenu.classList.contains('hide')) {
                closeMenu();
            }
        });
        
        // Initialize menu styles for right-to-left animation
        slideMenu.style.transition = `transform ${animationDuration}ms ease-in-out, opacity ${animationDuration}ms ease-in-out`;
        slideMenu.style.transform = 'translateX(100%)';
        slideMenu.style.opacity = '0';
        slideMenu.style.display = 'none';
        slideMenu.style.right = '0';
        slideMenu.style.left = 'auto';
    }
});




document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('project-search');
    const projectElements = document.querySelectorAll('li'); // All project list items
    const noProjectsFoundElement = document.querySelector('.noprojectsfound'); // Make sure you have this element in your HTML

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        let hasMatches = false;

        projectElements.forEach(function(project) {
            const projectNameElement = project.querySelector('.projectname');
            if (projectNameElement) {
                const projectName = projectNameElement.textContent.toLowerCase();
                
                if (projectName.includes(searchTerm)) {
                    project.style.display = ''; // Show matching projects
                    hasMatches = true;
                } else {
                    project.style.display = 'none'; // Hide non-matching projects
                }
            }
        });

        // Handle the "no projects found" message
        if (noProjectsFoundElement) {
            if (hasMatches || searchTerm === '') {
                noProjectsFoundElement.classList.add('hide');
            } else {
                noProjectsFoundElement.classList.remove('hide');
            }
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('topic-search');
    const topicItems = document.querySelectorAll('.topicvideos ul li'); // All topic video items
    const noTopicsFoundElement = document.querySelector('.notopicsfound'); // Make sure you have this element in your HTML

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let hasMatches = false;

        topicItems.forEach(function(topic) {
            const topicNameElement = topic.querySelector('.topicname');
            if (topicNameElement) {
                const topicName = topicNameElement.textContent.toLowerCase();
                
                if (topicName.includes(searchTerm)) {
                    topic.style.display = ''; // Show matching topics
                    hasMatches = true;
                } else {
                    topic.style.display = 'none'; // Hide non-matching topics
                }
            }
        });

        // Handle the "no topics found" message
        if (noTopicsFoundElement) {
            if (hasMatches || searchTerm === '') {
                noTopicsFoundElement.classList.add('hide');
            } else {
                noTopicsFoundElement.classList.remove('hide');
            }
        }
    });
});





document.addEventListener('DOMContentLoaded', function() {
    // Function to show elements with animation
    function showElement(element) {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 1;
    }

    // Function to hide elements with animation
    function hideElement(element) {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 0;
        setTimeout(function() {
            element.classList.add('hide');
        }, 500);
    }

    // Add event listeners to all downloadsingle links
    document.querySelectorAll('.downloadsingle').forEach(function(link) {
        link.addEventListener('click', function(event) {
            const href = link.getAttribute('href');
            if (!href || href.trim() === '') {
                // If href is empty, show the alert elements
                const alertUnibg = document.querySelector('.alertunibg.hide');
                const alertMainuni = document.querySelector('.alertmainuni.hide');
                if (alertUnibg) {
                    alertUnibg.classList.remove('hide');
                    showElement(alertUnibg);
                }
                if (alertMainuni) {
                    alertMainuni.classList.remove('hide');
                    showElement(alertMainuni);
                }
            }
            // Do not block other functions if href is available
        });
    });

    // Add event listener for the close button
    document.querySelector('.alertmainuniclose').addEventListener('click', function() {
        const alertUnibg = document.querySelector('.alertunibg');
        const alertMainuni = document.querySelector('.alertmainuni');
        if (alertUnibg && !alertUnibg.classList.contains('hide')) {
            hideElement(alertUnibg);
        }
        if (alertMainuni && !alertMainuni.classList.contains('hide')) {
            hideElement(alertMainuni);
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    // Function to show elements with animation
    function showElement(element) {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 1;
    }

    // Function to hide elements with animation
    function hideElement(element) {
        element.style.transition = 'opacity 0.5s ease-in-out';
        element.style.opacity = 0;
        setTimeout(function() {
            element.classList.add('hide');
        }, 500);
    }

    // Add event listeners to all downloadsingle links
    document.querySelectorAll('.downloadsingle').forEach(function(link) {
        link.addEventListener('click', function(event) {
            const href = link.getAttribute('href');
            if (!href || href.trim() === '') {
                // Prevent the default link behavior if href is empty
                event.preventDefault();
                // Show the alert elements
                const alertUnibg = document.querySelector('.alertunibg.hide');
                const alertMainuni = document.querySelector('.alertmainuni.hide');
                if (alertUnibg) {
                    alertUnibg.classList.remove('hide');
                    showElement(alertUnibg);
                }
                if (alertMainuni) {
                    alertMainuni.classList.remove('hide');
                    showElement(alertMainuni);
                }
            }
            // Allow the link to function normally if href is available
        });
    });

    // Add event listener for the close button
    document.querySelector('.alertmainuniclose').addEventListener('click', function() {
        const alertUnibg = document.querySelector('.alertunibg');
        const alertMainuni = document.querySelector('.alertmainuni');
        if (alertUnibg && !alertUnibg.classList.contains('hide')) {
            hideElement(alertUnibg);
        }
        if (alertMainuni && !alertMainuni.classList.contains('hide')) {
            hideElement(alertMainuni);
        }
    });
});  

// Add this at the end of the file

document.addEventListener('DOMContentLoaded', function() { 
    const jobPopup = document.querySelector('.jobpoup'); 
    const openJobBtn = document.querySelector('.openjobpoup'); 
    const jobGrey = document.querySelector('.jobgrey');
    
    // Handle jobgrey removal when hide class is removed
    if (jobGrey) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!jobGrey.classList.contains('hide')) {
                        // When hide class is removed, remove the element from DOM
                        jobGrey.remove();
                        observer.disconnect(); // Stop observing once removed
                    }
                }
            });
        });
        
        observer.observe(jobGrey, {
            attributes: true,   
            attributeFilter: ['class']
        });
    }
    
    // Handle job popup functionality
    if (jobPopup && openJobBtn) { 
        // Animation duration 
        const animationDuration = 300; 
        
        // Initialize styles for fade transition 
        jobPopup.style.transition = `opacity ${animationDuration}ms ease-in-out, visibility ${animationDuration}ms ease-in-out`; 
        jobPopup.style.opacity = '0'; 
        jobPopup.style.visibility = 'hidden'; 
        
        // Open popup function 
        function openJobPopup() { 
            jobPopup.classList.remove('hide'); 
            jobPopup.style.opacity = '1'; 
            jobPopup.style.visibility = 'visible'; 
        } 
        
        // Close popup function 
        function closeJobPopup() { 
            jobPopup.style.opacity = '0'; 
            jobPopup.style.visibility = 'hidden'; 
            setTimeout(() => { 
                jobPopup.classList.add('hide'); 
            }, animationDuration); 
        } 
        
        // Open popup when clicking Jobs 
        openJobBtn.addEventListener('click', function(e) { 
            e.preventDefault(); 
            openJobPopup(); 
        }); 
        
        // Close popup when clicking outside 
        document.addEventListener('click', function(e) { 
            if (!jobPopup.classList.contains('hide') && 
                !jobPopup.contains(e.target) && 
                !openJobBtn.contains(e.target)) { 
                closeJobPopup(); 
            } 
        }); 
        
        // Close popup with Escape key 
        document.addEventListener('keydown', function(e) { 
            if (e.key === 'Escape' && !jobPopup.classList.contains('hide')) { 
                closeJobPopup(); 
            } 
        }); 
    } 
});
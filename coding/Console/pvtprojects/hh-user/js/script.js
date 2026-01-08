document.addEventListener('DOMContentLoaded', function() {
    const dateDisplay = document.querySelector('.selecteddate');
    const calendarPopup = document.getElementById('calendarPopup');
    const calendarOverlay = document.getElementById('calendarOverlay');
    const daysGrid = document.getElementById('days-grid');
    const currentMonthEl = document.getElementById('current-month');
    const currentYearEl = document.getElementById('current-year');
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const cancelBtn = document.getElementById('cancelBtn');
    const selectBtn = document.getElementById('selectBtn');
    
    let currentDate = new Date();
    let selectedDate = new Date();
    let tempSelectedDate = new Date();
    
    // Format date for display
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    // Initialize display
    if (dateDisplay) {
        dateDisplay.textContent = formatDate(selectedDate);
        
        // Show/hide calendar
        dateDisplay.addEventListener('click', function(e) {
            calendarPopup.classList.add('visible');
            calendarOverlay.classList.add('visible');
            positionCalendarPopup(e.target);
        });
    }
    
    if (calendarOverlay) {
        calendarOverlay.addEventListener('click', function() {
            hideCalendar();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            hideCalendar();
        });
    }
    
    if (selectBtn) {
        selectBtn.addEventListener('click', function() {
            selectedDate = new Date(tempSelectedDate);
            if (dateDisplay) {
                dateDisplay.textContent = formatDate(selectedDate);
            }
            hideCalendar();
        });
    }
    
    function hideCalendar() {
        calendarPopup.classList.remove('visible');
        calendarOverlay.classList.remove('visible');
    }
    
    function positionCalendarPopup(target) {
        const rect = target.getBoundingClientRect();
        calendarPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
        calendarPopup.style.left = `${rect.left + window.scrollX}px`;
    }
    
    // Initialize year dropdown
    const currentYear = currentDate.getFullYear();
    if (yearSelect) {
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) {
                option.selected = true;
            }
            yearSelect.appendChild(option);
        }
    }
    
    // Initialize month dropdown to current month
    if (monthSelect) {
        monthSelect.value = currentDate.getMonth();
    }
    
    // Render calendar
    renderCalendar();
    
    // Event listeners
    if (monthSelect) {
        monthSelect.addEventListener('change', function() {
            currentDate.setMonth(parseInt(this.value));
            renderCalendar();
        });
    }
    
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            currentDate.setFullYear(parseInt(this.value));
            renderCalendar();
        });
    }
    
    if (prevYearBtn) {
        prevYearBtn.addEventListener('click', function() {
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            if (yearSelect) yearSelect.value = currentDate.getFullYear();
            renderCalendar();
        });
    }
    
    if (nextYearBtn) {
        nextYearBtn.addEventListener('click', function() {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            if (yearSelect) yearSelect.value = currentDate.getFullYear();
            renderCalendar();
        });
    }
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month and year display
        if (currentMonthEl) {
            currentMonthEl.textContent = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
        }
        if (currentYearEl) {
            currentYearEl.textContent = year;
        }
        
        // Update dropdowns
        if (monthSelect) {
            monthSelect.value = month;
        }
        if (yearSelect) {
            yearSelect.value = year;
        }
        
        // Get first day of month and total days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Clear the grid
        if (daysGrid) {
            daysGrid.innerHTML = '';
            
            // Add days from previous month
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day', 'other-month');
                dayElement.textContent = daysInPrevMonth - i;
                daysGrid.appendChild(dayElement);
            }
            
            // Add days from current month
            const today = new Date();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day');
                dayElement.textContent = i;
                
                // Highlight today
                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Highlight selected date
                if (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                    dayElement.classList.add('selected');
                    tempSelectedDate = new Date(selectedDate);
                }
                
                dayElement.addEventListener('click', function() {
                    // Remove selected class from all days
                    document.querySelectorAll('.day').forEach(day => {
                        day.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked day
                    this.classList.add('selected');
                    
                    // Update temporary selected date
                    tempSelectedDate = new Date(year, month, i);
                });
                
                daysGrid.appendChild(dayElement);
            }
            
            // Calculate how many days from next month to show
            const totalCells = firstDay + daysInMonth;
            const remainingCells = totalCells % 7;
            const nextMonthDays = remainingCells === 0 ? 0 : 7 - remainingCells;
            
            // Add days from next month
            for (let i = 1; i <= nextMonthDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('day', 'other-month');
                dayElement.textContent = i;
                daysGrid.appendChild(dayElement);
            }
        }
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Get all the necessary elements
    const loginLink = document.querySelector('.login');
    const loginBg = document.querySelector('.loginbg');
    const signupContainer = document.querySelector('.signupcontainer');
    const alreadyRegistered = document.querySelector('.alreadyregistered');
    const loginContainer = document.querySelector('.logincontainer');
    const notRegistered = document.querySelector('.notregisteredac');
    
    // Animation function
    function animateElement(element, show, duration = 300) {
        return new Promise((resolve) => {
            if (show) {
                element.style.display = 'block';
                element.style.opacity = '0';
                element.classList.remove('hide');
                
                let start = null;
                const fadeIn = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const opacity = Math.min(progress / duration, 1);
                    element.style.opacity = opacity;
                    
                    if (progress < duration) {
                        window.requestAnimationFrame(fadeIn);
                    } else {
                        element.style.opacity = '';
                        resolve();
                    }
                };
                window.requestAnimationFrame(fadeIn);
            } else {
                let start = null;
                const fadeOut = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const opacity = Math.max(1 - progress / duration, 0);
                    element.style.opacity = opacity;
                    
                    if (progress < duration) {
                        window.requestAnimationFrame(fadeOut);
                    } else {
                        element.style.opacity = '';
                        element.classList.add('hide');
                        element.style.display = 'none';
                        resolve();
                    }
                };
                window.requestAnimationFrame(fadeOut);
            }
        });
    }
    
    // Function to hide all modal elements with animation
    async function hideAllModals() {
        await Promise.all([
            animateElement(loginBg, false),
            animateElement(loginContainer, false),
            animateElement(signupContainer, false)
        ]);
    }
    
    // Click on login link - show background and login container
    if (loginLink) {
        loginLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await animateElement(loginBg, true);
            await animateElement(loginContainer, true);
        });
    }
    
    // Click on "Already Registered" - show login, hide signup
    if (alreadyRegistered) {
        alreadyRegistered.addEventListener('click', async function(e) {
            e.preventDefault();
            await animateElement(signupContainer, false);
            await animateElement(loginContainer, true);
        });
    }
    
    // Click on "Not Registered" - show signup, hide login
    if (notRegistered) {
        notRegistered.addEventListener('click', async function(e) {
            e.preventDefault();
            await animateElement(loginContainer, false);
            await animateElement(signupContainer, true);
        });
    }
    
    // Click outside modal containers - hide everything
    document.addEventListener('click', async function(e) {
        const isLoginContainer = e.target.closest('.logincontainer');
        const isSignupContainer = e.target.closest('.signupcontainer');
        const isLoginLink = e.target.closest('.login');
        
        if (!isLoginContainer && !isSignupContainer && !isLoginLink) {
            await hideAllModals();
        }
    });
    
    // Prevent clicks inside modals from closing them
    [loginContainer, signupContainer].forEach(container => {
        if (container) {
            container.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });
});





document.addEventListener('DOMContentLoaded', function() {
    // Get all the swipe controls and the list to be moved
    const leftSwipeButtons = document.querySelectorAll('.lswipesr');
    const rightSwipeButtons = document.querySelectorAll('.rswipesr');
    const flistElements = document.querySelectorAll('.flistsr');
    
    // Set the amount of movement (in pixels)
    const moveAmount = 200;
    
    // Function to move elements to the left
    function moveLeft() {
        flistElements.forEach(element => {
            const currentPosition = parseInt(element.style.left) || 0;
            element.style.left = (currentPosition - moveAmount) + 'px';
        });
    }
    
    // Function to move elements to the right
    function moveRight() {
        flistElements.forEach(element => {
            const currentPosition = parseInt(element.style.left) || 0;
            element.style.left = (currentPosition + moveAmount) + 'px';
        });
    }
    
    // Add event listeners to left swipe buttons
    leftSwipeButtons.forEach(button => {
        button.addEventListener('click', moveLeft);
    });
    
    // Add event listeners to right swipe buttons
    rightSwipeButtons.forEach(button => {
        button.addEventListener('click', moveRight);
    });
});




document.addEventListener('DOMContentLoaded', function() {
    // Get swipe controls and target elements
    const leftSwipeButtons = document.querySelectorAll('.lswipesr');
    const rightSwipeButtons = document.querySelectorAll('.rswipesr');
    const dlsElements = document.querySelectorAll('.dls');
    
    // Movement configuration
    const moveAmount = 200; // pixels to move
    const animationDuration = 300; // milliseconds
    
    // Function to move elements
    function moveElements(direction) {
        dlsElements.forEach(element => {
            // Get current position (default to 0 if not set)
            const currentPosition = parseInt(element.style.left) || 0;
            // Calculate new position
            const newPosition = direction === 'left' 
                ? currentPosition - moveAmount 
                : currentPosition + moveAmount;
            
            // Apply smooth transition
            element.style.transition = `left ${animationDuration}ms ease`;
            element.style.left = `${newPosition}px`;
            
            // Remove transition after animation completes
            setTimeout(() => {
                element.style.transition = '';
            }, animationDuration);
        });
    }
    
    // Add event listeners
    leftSwipeButtons.forEach(button => {
        button.addEventListener('click', () => moveElements('left'));
    });
    
    rightSwipeButtons.forEach(button => {
        button.addEventListener('click', () => moveElements('right'));
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Get swipe controls and target elements
    const leftSwipeButtons = document.querySelectorAll('.lswipesr');
    const rightSwipeButtons = document.querySelectorAll('.rswipesr');
    const dlsElements = document.querySelectorAll('.nlswio');
    
    // Movement configuration
    const moveAmount = 200; // pixels to move
    const animationDuration = 300; // milliseconds
    
    // Function to move elements
    function moveElements(direction) {
        dlsElements.forEach(element => {
            // Get current position (default to 0 if not set)
            const currentPosition = parseInt(element.style.left) || 0;
            // Calculate new position
            const newPosition = direction === 'left' 
                ? currentPosition - moveAmount 
                : currentPosition + moveAmount;
            
            // Apply smooth transition
            element.style.transition = `left ${animationDuration}ms ease`;
            element.style.left = `${newPosition}px`;
            
            // Remove transition after animation completes
            setTimeout(() => {
                element.style.transition = '';
            }, animationDuration);
        });
    }
    
    // Add event listeners
    leftSwipeButtons.forEach(button => {
        button.addEventListener('click', () => moveElements('left'));
    });
    
    rightSwipeButtons.forEach(button => {
        button.addEventListener('click', () => moveElements('right'));
    });
});




document.addEventListener('DOMContentLoaded', function() {
            // Date utility functions
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            function formatDate(date) {
                return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
            }

            // Calendar generator
            function generateCalendar(container, selectedDate, minDate, onSelect, isCheckout = false) {
                const today = new Date();
                const currentMonth = selectedDate.getMonth();
                const currentYear = selectedDate.getFullYear();
                
                // First day of month
                const firstDay = new Date(currentYear, currentMonth, 1);
                // Last day of month
                const lastDay = new Date(currentYear, currentMonth + 1, 0);
                // Days in month
                const daysInMonth = lastDay.getDate();
                // Starting day (0-6)
                const startDay = firstDay.getDay();

                // Header (Month Year)
                const monthYear = document.createElement("div");
                monthYear.className = "calendar-month";
                monthYear.textContent = `${months[currentMonth]} ${currentYear}`;
                
                // Previous month button
                const prevMonth = document.createElement("span");
                prevMonth.className = "calendar-prev";
                prevMonth.innerHTML = "&lt;";
                prevMonth.addEventListener("click", () => {
                    selectedDate.setMonth(selectedDate.getMonth() - 1);
                    generateCalendar(container, selectedDate, minDate, onSelect, isCheckout);
                });

                // Next month button
                const nextMonth = document.createElement("span");
                nextMonth.className = "calendar-next";
                nextMonth.innerHTML = "&gt;";
                nextMonth.addEventListener("click", () => {
                    selectedDate.setMonth(selectedDate.getMonth() + 1);
                    generateCalendar(container, selectedDate, minDate, onSelect, isCheckout);
                });

                // Month navigation container
                const monthNav = document.createElement("div");
                monthNav.className = "calendar-header";
                monthNav.appendChild(prevMonth);
                monthNav.appendChild(monthYear);
                monthNav.appendChild(nextMonth);

                // Weekdays header
                const weekdays = document.createElement("div");
                weekdays.className = "calendar-weekdays";
                days.forEach(day => {
                    const weekday = document.createElement("div");
                    weekday.className = "calendar-weekday";
                    weekday.textContent = day;
                    weekdays.appendChild(weekday);
                });

                // Days grid
                const daysGrid = document.createElement("div");
                daysGrid.className = "calendar-days";

                // Fill empty cells for starting day
                for (let i = 0; i < startDay; i++) {
                    const emptyDay = document.createElement("div");
                    emptyDay.className = "calendar-day empty";
                    daysGrid.appendChild(emptyDay);
                }

                // Add days of month
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentYear, currentMonth, day);
                    const dayElement = document.createElement("div");
                    dayElement.className = "calendar-day";
                    dayElement.textContent = day;

                    // Disable past dates or dates before check-in (for checkout calendar)
                    if (date < minDate || (isCheckout && checkInDate && date < checkInDate)) {
                        dayElement.classList.add("disabled");
                    } else {
                        dayElement.addEventListener("click", () => {
                            onSelect(date);
                            container.classList.remove("open");
                        });
                    }

                    // Highlight selected date
                    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                        dayElement.classList.add("selected");
                    }

                    daysGrid.appendChild(dayElement);
                }

                // Clear previous calendar
                container.innerHTML = "";
                container.appendChild(monthNav);
                container.appendChild(weekdays);
                container.appendChild(daysGrid);
            }

            // Check-in date picker
            const checkInInput = document.querySelector(".checkindate");
            const checkInCalendar = document.getElementById("checkin-calendar");
            let checkInDate = null;

            checkInInput.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".calendar").forEach(cal => cal.classList.remove("open"));
                checkInCalendar.classList.add("open");
                
                // Initialize with today's date if no date selected
                const initialDate = checkInDate || new Date();
                generateCalendar(checkInCalendar, initialDate, new Date(), (date) => {
                    checkInDate = date;
                    checkInInput.value = formatDate(date);
                    
                    // Update checkout calendar if checkout is before new checkin
                    if (checkOutDate && checkOutDate < date) {
                        checkOutDate = new Date(date);
                        checkOutDate.setDate(checkOutDate.getDate() + 1);
                        checkOutInput.value = formatDate(checkOutDate);
                    }
                });
            });

            // Check-out date picker
            const checkOutInput = document.querySelector(".checkoutdate");
            const checkOutCalendar = document.getElementById("checkout-calendar");
            let checkOutDate = null;

            checkOutInput.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll(".calendar").forEach(cal => cal.classList.remove("open"));
                checkOutCalendar.classList.add("open");
                
                // Initialize with tomorrow's date if no date selected
                let initialDate = checkOutDate || new Date();
                if (!checkOutDate) {
                    initialDate.setDate(initialDate.getDate() + 1);
                }
                
                // Set min date to check-in date if it exists
                const minDate = checkInDate || new Date();
                generateCalendar(checkOutCalendar, initialDate, minDate, (date) => {
                    checkOutDate = date;
                    checkOutInput.value = formatDate(date);
                }, true);
            });

            // Close calendars when clicking outside
            document.addEventListener("click", () => {
                document.querySelectorAll(".calendar").forEach(cal => cal.classList.remove("open"));
            });

            // Prevent calendar from closing when clicking inside
            document.querySelectorAll(".calendar").forEach(cal => {
                cal.addEventListener("click", (e) => e.stopPropagation());
            });
        });






document.addEventListener('DOMContentLoaded', function() {
  const showMoreBtn = document.querySelector('.showmore');
  const hiddenImagesContainer = document.querySelector('.bottom.showmoreimages');

  if (showMoreBtn && hiddenImagesContainer) {
    // Initialize as hidden (if not already in CSS)
    hiddenImagesContainer.style.display = 'none';

    showMoreBtn.addEventListener('click', function() {
      if (hiddenImagesContainer.style.display === 'none') {
        hiddenImagesContainer.style.display = 'flex';
      } else {
        hiddenImagesContainer.style.display = 'none';
      }
      
      // Optional: Toggle button text
      const btnText = this.querySelector('h3');
      if (btnText) {
        btnText.textContent = hiddenImagesContainer.style.display === 'none' 
          ? 'Show all photos' 
          : 'Hide all photos';
      }
    });
  }
});



document.querySelector('.uploaduserprofilecart').addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.querySelector('.uploadeduserprofilecart').src = event.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});









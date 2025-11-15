
        const menuButton = document.getElementById('menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIconOpen = document.getElementById('menu-icon-open');
        const menuIconClose = document.getElementById('menu-icon-close');
        const body = document.body;

        /**
         * Mobile Menu Toggle Functionality
         */
        const toggleMenu = (isOpen) => {
            if (typeof isOpen === 'undefined') {
                isOpen = !mobileMenu.classList.contains('open');
            }
            
            mobileMenu.classList.toggle('open', isOpen);
            
            // Toggle icons
            menuIconOpen.style.display = isOpen ? 'none' : 'inline';
            menuIconClose.style.display = isOpen ? 'inline' : 'none';

            // Prevent body scrolling when the menu is open
            body.style.overflow = isOpen ? 'hidden' : '';
        };

        menuButton.addEventListener('click', () => toggleMenu());

        // Hide menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Check if the link is an internal anchor
                if (link.getAttribute('href').startsWith('#')) {
                    // Prevent default anchor jump for smooth scrolling
                    e.preventDefault(); 
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    toggleMenu(false); // Close the menu before scrolling
                    
                    if (targetElement) {
                        // Use setTimeout to allow the menu closing animation to start
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                    }
                } else {
                    // For external links or other pages, just close menu
                    toggleMenu(false);
                }
            });
        });
        
        /**
         * Scroll Animation (Intersection Observer) Functionality
         */
        const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
        
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        };

        const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

        animateOnScrollElements.forEach(element => {
            scrollObserver.observe(element);
        });

        /**
         * Dummy Click Functionality 
         */
        const showMessage = (text, bgColor = '#D4AF37', textColor = '#0f0f0f') => {
            const messageBox = document.createElement('div');
            messageBox.textContent = text;
            messageBox.style.cssText = `position: fixed; bottom: 1.25rem; right: 1.25rem; background-color: ${bgColor}; color: ${textColor}; padding: 0.75rem 1.25rem; border-radius: 0.5rem; box-shadow: 0 10px 15px rgba(0,0,0,0.2); z-index: 200; transition: opacity 300ms ease; opacity: 1; font-size: 0.9rem; font-weight: 500;`;
            document.body.appendChild(messageBox);
            
            setTimeout(() => {
                messageBox.style.opacity = '0';
                setTimeout(() => messageBox.remove(), 300);
            }, 3000);
        };
        
        document.querySelectorAll('.btn').forEach(button => button.addEventListener('click', (e) => showMessage(`Hero action triggered: ${e.target.textContent.trim()}`, '#D4AF37', '#0f0f0f')));
        document.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => showMessage(`Viewing product: ${card.getAttribute('data-product')}`, '#D4AF37', '#0f0f0f')));
        document.querySelectorAll('.feature-card').forEach(card => card.addEventListener('click', () => showMessage(`Feature selected: ${card.querySelector('.feature-title').textContent}`, '#5A67D8', 'white')));
        document.getElementById('video-play-overlay').addEventListener('click', () => showMessage(`Video placeholder clicked. Video would start playing now.`, '#D4AF37', '#0f0f0f'));
        document.querySelectorAll('.location-card').forEach(card => card.addEventListener('click', () => showMessage(`Visiting store in: ${card.getAttribute('data-location')}`, '#5A67D8', 'white')));
        document.querySelectorAll('.arrival-card, .large-card').forEach(card => card.addEventListener('click', () => showMessage(`Exploring new arrival: ${card.getAttribute('data-item')}`, '#D4AF37', '#0f0f0f')));




        // Set the parameters for the diamond generation
        const NUM_DIAMONDS = 150; // How many diamonds to generate
        const diamondOverlay = document.getElementById('diamond-overlay');

        /**
         * Generates and scatters diamond icons across the overlay container.
         */
        function generateDiamonds() {
            if (!diamondOverlay) return;

            // Clear existing diamonds if rerunning
            diamondOverlay.innerHTML = '';

            for (let i = 0; i < NUM_DIAMONDS; i++) {
                // 1. Create the icon element
                const diamond = document.createElement('i');
                
                // Use the Font Awesome solid gem icon (fa-gem) and the CSS class
                diamond.className = 'fas fa-gem diamond-icon'; 

                // 2. Set random position within the 100% x 100% container
                const randomX = Math.random() * 100; // 0 to 100%
                const randomY = Math.random() * 100; // 0 to 100%

                // 3. Set random size and delay for a subtle, varied look
                const randomSize = 0.8 + Math.random() * 0.4; // Size between 0.8x and 1.2x
                const randomDelay = Math.random() * 10; // Animation delay up to 10s
                const randomDuration = 5 + Math.random() * 5; // Animation duration between 5s and 10s

                // 4. Apply styles inline (for size and position randomness)
                diamond.style.left = `${randomX}vw`; /* Use vw for viewport width */
                diamond.style.top = `${randomY}vh`; /* Use vh for viewport height */
                diamond.style.transform = `scale(${randomSize})`;
                diamond.style.animationDelay = `${randomDelay}s`;
                diamond.style.animationDuration = `${randomDuration}s`;
                
                // 5. Append to the overlay
                diamondOverlay.appendChild(diamond);
            }
        }

        // Run the function when the window loads
        window.onload = generateDiamonds;
        


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
        const showMessage = (text, theme = 'gold') => {
            const messageBox = document.createElement('div');
            messageBox.className = `toast ${theme}`;
            messageBox.textContent = text;
            document.body.appendChild(messageBox);

            // Hide and remove after timeout
            setTimeout(() => {
                messageBox.classList.add('hide');
                setTimeout(() => messageBox.remove(), 350);
            }, 3000);
        };

        document.querySelectorAll('.btn').forEach(button => button.addEventListener('click', (e) => showMessage(`Hero action triggered: ${e.target.textContent.trim()}`, 'gold')));
        document.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => showMessage(`Viewing product: ${card.getAttribute('data-product')}`, 'gold')));
        document.querySelectorAll('.feature-card').forEach(card => card.addEventListener('click', () => showMessage(`Feature selected: ${card.querySelector('.feature-title').textContent}`, 'blue')));
        const videoOverlay = document.getElementById('video-play-overlay');
        if (videoOverlay) videoOverlay.addEventListener('click', () => showMessage(`Video placeholder clicked. Video would start playing now.`, 'gold'));
        document.querySelectorAll('.location-card').forEach(card => card.addEventListener('click', () => showMessage(`Visiting store in: ${card.getAttribute('data-location')}`, 'blue')));
        document.querySelectorAll('.arrival-card, .large-card').forEach(card => card.addEventListener('click', () => showMessage(`Exploring new arrival: ${card.getAttribute('data-item')}`, 'gold')));




        // Set the parameters for the diamond generation
        const diamondOverlay = document.getElementById('diamond-overlay');

        /**
         * Generates and scatters diamond icons across the overlay container.
         * Optimization notes:
         * - Reduce number of diamonds on smaller viewports.
         * - Use requestIdleCallback when available to avoid blocking initial rendering.
         */
        function generateDiamonds() {
            if (!diamondOverlay) return;

            // Clear existing diamonds if rerunning
            diamondOverlay.innerHTML = '';

            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const NUM_DIAMONDS = vw >= 1200 ? 150 : (vw >= 768 ? 80 : 40);

            for (let i = 0; i < NUM_DIAMONDS; i++) {
                const diamond = document.createElement('i');
                diamond.className = 'fas fa-gem diamond-icon';

                const randomX = Math.random() * 100; // percent of container width
                const randomY = Math.random() * 100; // percent of container height
                const randomSize = 0.8 + Math.random() * 0.6; // 0.8x - 1.4x
                const randomDelay = Math.random() * 10;
                const randomDuration = 5 + Math.random() * 5;

                // Apply minimal inline transforms (position + animation) to each element.
                diamond.style.left = `${randomX}%`;
                diamond.style.top = `${randomY}%`;
                diamond.style.transform = `scale(${randomSize})`;
                diamond.style.animationDelay = `${randomDelay}s`;
                diamond.style.animationDuration = `${randomDuration}s`;

                diamondOverlay.appendChild(diamond);
            }
        }

        // Schedule diamond generation when the browser is idle (non-blocking)
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(generateDiamonds, { timeout: 1000 });
        } else {
            window.addEventListener('load', () => setTimeout(generateDiamonds, 300));
        }
        


        // Global variables for Firebase (required setup)
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        let app, db, auth;
        let userId = null;

        // Constants for Rates (Fixed as per user's request)
        const GOLD_RATES = { buy: 130000, sell: 120000 }; // NGN per gram
        const DIAMOND_RATES = { buy: 180000, sell: 160000 }; // NGN per gram
        const CLIENT_WHATSAPP_NUMBER = "2349066666662"; // Placeholder
        
        // Helper function for custom message box
        const messageBox = document.getElementById('message-box');
        function showMessage(message, duration = 3000) {
            messageBox.textContent = message;
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, duration);
        }
        
        window.closeModal = function() {
             document.getElementById('receipt-modal').classList.remove('visible');
        }
        
        // --- Market Chart Simulation ---
        function generatePriceBars() {
            const chartArea = document.getElementById('chart-area');
            chartArea.innerHTML = '';
            // Generate more bars on larger screens
            const numBars = window.innerWidth > 600 ? 25 : 15;
            
            for (let i = 0; i < numBars; i++) {
                const height = Math.floor(Math.random() * 80) + 20; // 20px to 100px
                const isBullish = Math.random() > 0.5;
                
                const bar = document.createElement('div');
                bar.className = `price-bar ${isBullish ? 'bullish' : 'bearish'}`;
                bar.style.height = `${height}px`;
                chartArea.appendChild(bar);
            }
        }


        // --- Firebase Initialization and Auth ---

        async function initializeFirebase() {
            try {
                if (Object.keys(firebaseConfig).length === 0) {
                    console.error("Firebase config is empty. Cannot initialize.");
                    return;
                }
                
                // Removed: setLogLevel('Debug');
                const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
                const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
                const { getFirestore } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
                
                app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);
                
                console.log("Firebase initialized.");

                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        userId = user.uid;
                        console.log("User signed in:", userId);
                        fetchLiveGoldRate();
                    } else {
                        console.log("No user signed in. Attempting sign-in...");
                        if (initialAuthToken) {
                            signInWithCustomToken(auth, initialAuthToken)
                                .catch(error => {
                                    console.error("Error signing in with custom token:", error);
                                    signInAnonymously(auth); 
                                });
                        } else {
                            signInAnonymously(auth)
                                .catch(error => console.error("Error signing in anonymously:", error));
                        }
                    }
                });
            } catch (error) {
                console.error("Failed to load Firebase modules or initialize:", error);
            }
        }

        // --- Gemini API Logic for Live Rates ---

        const API_MODEL = "gemini-2.5-flash-preview-09-2025";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=`;
        const API_KEY = ""; 

        async function geminiCall(prompt, useGrounding = false) {
            const systemPrompt = "You are a professional financial data assistant. Only provide the current market price of the commodity requested, formatted as a clear number and its currency symbol (e.g., '$2,000.50'). Do not include any introductory text, explanation, or context, just the price.";

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    temperature: 0.1,
                }
            };

            if (useGrounding) {
                payload.tools = [{ "google_search": {} }];
            }

            let response;
            const maxRetries = 5;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(API_URL + API_KEY, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        return await response.json();
                    } else if (response.status === 429 && i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    } else {
                        console.error(`API Error: ${response.status} ${response.statusText}`);
                        break;
                    }
                } catch (error) {
                    console.error("Fetch failed:", error);
                    break;
                }
            }
            return null;
        }

        async function fetchLiveGoldRate() {
            const displayElement = document.getElementById('live-rate-display');
            displayElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Fetching current global gold rate...`;

            try {
                const prompt = "What is the current price of 24k gold per gram in USD?";
                const result = await geminiCall(prompt, true);

                if (result && result.candidates && result.candidates[0] && 
                    result.candidates[0].content && result.candidates[0].content.parts[0].text) {
                    
                    const priceText = result.candidates[0].content.parts[0].text.trim();
                    displayElement.innerHTML = `<strong>Live Global Gold Rate:</strong> ${priceText} (24k/gram). Used for reference only.`;
                    
                    const groundingMetadata = result.candidates[0].groundingMetadata;
                    if (groundingMetadata && groundingMetadata.groundingAttributions.length > 0) {
                        const firstSource = groundingMetadata.groundingAttributions[0].web;
                        if (firstSource) {
                            displayElement.innerHTML += `<br><span class="live-rate-note">Source: <a href="${firstSource.uri}" target="_blank">${firstSource.title || 'Link'}</a></span>`;
                        }
                    }

                } else {
                    displayElement.innerHTML = `⚠️ <strong>Live Rate Unavailable.</strong> Using fixed internal rates.`;
                }
            } catch (error) {
                console.error("Error fetching live gold rate:", error);
                displayElement.innerHTML = `⚠️ <strong>Live Rate Unavailable.</strong> Using fixed internal rates.`;
            }
        }

        // --- Calculation and UI Logic ---

        function formatCurrency(amount) {
            if (isNaN(amount) || amount === 0) return '₦0';
            return '₦' + Math.round(amount).toLocaleString('en-US');
        }

        window.calculateReceipt = function() {
            const jewelryType = document.getElementById('jewelry-type').value;
            const weight = parseFloat(document.getElementById('weight').value) || 0;
            const material = document.querySelector('input[name="material"]:checked').value;
            const transaction = document.querySelector('input[name="transaction"]:checked').value;

            if (weight <= 0) {
                showMessage("Please enter a valid item weight.");
                return;
            }

            let calculatedRate = 0;
            let finalRatePerGram = 0;
            let materialLabel = "";
            let transactionLabel = transaction === 'buy' ? 'Buy' : 'Sell';
            
            if (material === 'gold') {
                finalRatePerGram = GOLD_RATES[transaction];
                calculatedRate = weight * finalRatePerGram;
                materialLabel = "Gold";
            } else { // diamond
                finalRatePerGram = DIAMOND_RATES[transaction];
                calculatedRate = weight * finalRatePerGram;
                materialLabel = "Diamond";
            }
            
            const finalTotal = calculatedRate;

            // 3. Populate Receipt
            const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const receiptId = 'RCPT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

            document.getElementById('receipt-date').textContent = `Date: ${date}`;
            document.getElementById('receipt-id').textContent = `Receipt ID: ${receiptId}`;
            document.getElementById('receipt-jewelry-type').textContent = jewelryType;
            document.getElementById('receipt-weight').textContent = `${weight} grams`;
            document.getElementById('receipt-material').textContent = `${materialLabel} (${transactionLabel})`;
            
            document.getElementById('receipt-rate-label').textContent = `${materialLabel} ${transactionLabel} Rate (${formatCurrency(finalRatePerGram)}/g)`;
            document.getElementById('receipt-subtotal').textContent = formatCurrency(calculatedRate);
            
            document.getElementById('receipt-total').textContent = formatCurrency(finalTotal);

            // Store details globally for download/WhatsApp
            window.receiptDetails = {
                jewelryType,
                weight,
                materialLabel,
                transaction: transactionLabel,
                finalTotal: formatCurrency(finalTotal),
                receiptId
            };

            // 4. Show Receipt Modal
            document.getElementById('receipt-modal').classList.add('visible');
            // Removed: showMessage("Price estimate generated! Please review the receipt.");
        }

        window.downloadReceipt = function() {
            const receiptElement = document.getElementById('receipt-card');
            
            // Get the computed dark background color from CSS
            const darkBg = getComputedStyle(document.documentElement).getPropertyValue('--color-dark').trim() || '#0f0f0f';

            // Use html2canvas to ensure dark background is captured correctly
            html2canvas(receiptElement, { 
                scale: 2, 
                backgroundColor: darkBg,
                useCORS: true
            }).then(canvas => {
                try {
                    const image = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `Estimate-${window.receiptDetails.receiptId || 'Jewels'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showMessage("Receipt downloaded successfully as a PNG image!");
                } catch (e) {
                    console.error("Error during download:", e);
                    showMessage("Error downloading receipt. Check console for details.");
                }
            }).catch(error => {
                console.error("html2canvas error:", error);
                showMessage("Error processing the receipt for download.");
            });
        }

        window.contactWhatsApp = function() {
            if (!window.receiptDetails) {
                showMessage("Please calculate the rate first.");
                return;
            }

            const { jewelryType, finalTotal, weight, materialLabel, transaction } = window.receiptDetails;
            
            const message = `Hello, I saw the price estimate for the following jewelry:
*Item:* ${jewelryType}
*Weight:* ${weight}g
*Material:* ${materialLabel}
*Transaction:* ${transaction}
*Estimated Price:* ${finalTotal}

I would like to discuss this piece further.`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${CLIENT_WHATSAPP_NUMBER}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
        }

        // --- Initial Load ---
        window.onload = function () {
            initializeFirebase();
            generatePriceBars();
            
            // Attach event listener to close modal on background click
            document.getElementById('receipt-modal').addEventListener('click', (event) => {
                if (event.target.id === 'receipt-modal') {
                    closeModal();
                }
            });
            
            // Regenerate bars on window resize for responsiveness
            window.addEventListener('resize', generatePriceBars);
        }
   
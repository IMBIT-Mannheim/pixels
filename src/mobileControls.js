import { k } from "./kaboomCtx";

class MobileControls {
    constructor() {
        this.isActive = false;
        this.joystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 60; // Half of joystick base width
        this.knobRadius = 25; // Half of knob width
        this.currentDirection = { x: 0, y: 0 };
        this.touchId = null;
        
        // Button states
        this.buttonStates = {
            interact: false,
            map: false,
            inventory: false
        };
        
        // Orientation handling
        this.isLandscape = false;
        this.orientationDisclaimer = null;
        
        this.init();
    }
    
    init() {
        // Check if we're on a mobile device
        this.isMobile = this.detectMobile();
        
        if (!this.isMobile) {
            return; // Don't initialize on desktop
        }
        
        this.setupElements();
        this.setupOrientation(); // Add orientation handling
        this.setupJoystick();
        this.setupActionButtons();
        this.setupMovementHandler();
        this.initMobileFeatures(); // Initialize mobile-specific features
        this.setupMobileCameraScale(); // Add mobile camera scaling
        
        console.log("🎮 Mobile controls initialized");
    }
    
    detectMobile() {
        // Check for touch capability and mobile user agent
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }
    
    setupElements() {
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickKnob = document.getElementById('joystick-knob');
        this.mobileControls = document.getElementById('mobile-controls');
        
        // Action buttons (removed interact button)
        this.mapBtn = document.getElementById('mobile-map-btn');
        this.inventoryBtn = document.getElementById('mobile-inventory-btn');
        
        // Orientation disclaimer
        this.orientationDisclaimer = document.getElementById('orientation-disclaimer');
        
        if (!this.joystickBase || !this.joystickKnob) {
            console.error("Mobile control elements not found");
            return;
        }
        
        // Get joystick center position
        this.updateJoystickCenter();
        
        // Update center on window resize
        window.addEventListener('resize', () => {
            this.updateJoystickCenter();
        });
    }
    
    updateJoystickCenter() {
        if (!this.joystickBase) return;
        
        const rect = this.joystickBase.getBoundingClientRect();
        this.joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    setupJoystick() {
        if (!this.joystickBase) return;
        
        // Touch events for joystick
        this.joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJoystickStart(e);
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (this.joystickActive) {
                e.preventDefault();
                this.handleJoystickMove(e);
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.handleJoystickEnd(e);
        });
        
        document.addEventListener('touchcancel', (e) => {
            this.handleJoystickEnd(e);
        });
    }
    
    handleJoystickStart(e) {
        const touch = e.touches[0];
        this.touchId = touch.identifier;
        this.joystickActive = true;
        this.updateJoystickCenter();
        
        console.log("🕹️ Joystick activated"); // Debug log
        
        // Calculate initial position
        this.updateJoystickPosition(touch.clientX, touch.clientY);
    }
    
    handleJoystickMove(e) {
        if (!this.joystickActive) return;
        
        // Find the touch that started the joystick
        const touch = Array.from(e.touches).find(t => t.identifier === this.touchId);
        if (!touch) return;
        
        this.updateJoystickPosition(touch.clientX, touch.clientY);
    }
    
    handleJoystickEnd(e) {
        if (!this.joystickActive) return;
        
        // Check if our touch ended
        const touchEnded = !Array.from(e.touches).some(t => t.identifier === this.touchId);
        if (touchEnded) {
            this.joystickActive = false;
            this.touchId = null;
            this.resetJoystick();
            console.log("🕹️ Joystick deactivated"); // Debug log
        }
    }
    
    updateJoystickPosition(clientX, clientY) {
        const deltaX = clientX - this.joystickCenter.x;
        const deltaY = clientY - this.joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Limit knob to joystick boundary
        const maxDistance = this.joystickRadius - this.knobRadius;
        const clampedDistance = Math.min(distance, maxDistance);
        
        let knobX = deltaX;
        let knobY = deltaY;
        
        if (distance > maxDistance) {
            knobX = (deltaX / distance) * maxDistance;
            knobY = (deltaY / distance) * maxDistance;
        }
        
        // Update knob position
        this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
        
        // Calculate normalized direction (-1 to 1)
        this.currentDirection = {
            x: clampedDistance > 12 ? knobX / maxDistance : 0, // Larger dead zone for better control
            y: clampedDistance > 12 ? knobY / maxDistance : 0
        };
    }
    
    resetJoystick() {
        this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        this.currentDirection = { x: 0, y: 0 };
    }
    
    setupActionButtons() {
        if (this.mapBtn) {
            this.mapBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress('map');
            }, { passive: false });
            
            // Add click event for better compatibility
            this.mapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress('map');
            });
        }
        
        if (this.inventoryBtn) {
            this.inventoryBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress('inventory');
            }, { passive: false });
            
            // Add click event for better compatibility
            this.inventoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress('inventory');
            });
        }
        
        // Prevent page scrolling when touching mobile controls
        document.addEventListener('touchmove', (e) => {
            if (this.isMobile && this.isActive) {
                const target = e.target;
                if (target.closest('.mobile-controls') || target.closest('.virtual-joystick') || target.closest('.mobile-action-buttons')) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }
    
    handleButtonPress(buttonType) {
        this.buttonStates[buttonType] = true;
        
        // Simulate haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short vibration for button press
        }
        
        switch (buttonType) {
            case 'map':
                // For mobile, toggle the map instead of hold behavior
                const worldMap = document.getElementById('world-map');
                const mapBtn = document.getElementById('show-world-map');
                
                if (worldMap && worldMap.style.display === 'flex') {
                    // Map is open, close it
                    worldMap.style.display = 'none';
                    if (mapBtn) mapBtn.innerHTML = "Weltkarte anzeigen (M)";
                    this.mapBtn?.classList.remove('active');
                } else {
                    // Map is closed, open it
                    if (worldMap) worldMap.style.display = 'flex';
                    if (mapBtn) mapBtn.innerHTML = "Weltkarte verstecken (M)";
                    this.mapBtn?.classList.add('active');
                }
                
                // Also simulate the key press for compatibility
                this.simulateKeyPress('m');
                break;
                
            case 'inventory':
                // Simulate I key press
                this.simulateKeyPress('i');
                this.inventoryBtn?.classList.add('active');
                setTimeout(() => {
                    this.inventoryBtn?.classList.remove('active');
                }, 200);
                break;
        }
    }
    
    handleButtonRelease(buttonType) {
        this.buttonStates[buttonType] = false;
        
        switch (buttonType) {
            case 'map':
                // For mobile, we handle map toggle on press, not release
                // So we don't need to do anything here
                break;
        }
    }
    
    setupMovementHandler() {
        // Create a movement update loop that runs continuously
        const updateMovement = () => {
            if (this.isActive && this.isMobile && this.isLandscape) {
                if (this.joystickActive && (Math.abs(this.currentDirection.x) > 0.1 || Math.abs(this.currentDirection.y) > 0.1)) {
                    this.simulateMovement();
                } else {
                    // Stop all movement when joystick is not active
                    this.stopAllMovement();
                }
            }
            requestAnimationFrame(updateMovement);
        };
        updateMovement();
    }
    
    stopAllMovement() {
        // Release all movement keys when joystick is not active
        this.simulateKeyUp('w');
        this.simulateKeyUp('a');
        this.simulateKeyUp('s');
        this.simulateKeyUp('d');
    }
    
    simulateMovement() {
        // Simulate WASD key presses based on joystick direction
        const threshold = 0.2; // Lower threshold for better responsiveness
        
        // Debug logging
        if (Math.abs(this.currentDirection.x) > threshold || Math.abs(this.currentDirection.y) > threshold) {
            console.log(`🕹️ Moving: x=${this.currentDirection.x.toFixed(2)}, y=${this.currentDirection.y.toFixed(2)}`);
        }
        
        // Reset all movement keys first
        this.simulateKeyUp('w');
        this.simulateKeyUp('a');
        this.simulateKeyUp('s');
        this.simulateKeyUp('d');
        
        // Apply movement based on direction
        if (Math.abs(this.currentDirection.y) > threshold) {
            if (this.currentDirection.y < 0) {
                this.simulateKeyDown('w'); // Up
            } else {
                this.simulateKeyDown('s'); // Down
            }
        }
        
        if (Math.abs(this.currentDirection.x) > threshold) {
            if (this.currentDirection.x < 0) {
                this.simulateKeyDown('a'); // Left
            } else {
                this.simulateKeyDown('d'); // Right
            }
        }
    }
    
    simulateKeyPress(key) {
        // Create more compatible keyboard events
        const keydownEvent = new KeyboardEvent('keydown', {
            key: key,
            code: this.getKeyCode(key),
            keyCode: this.getKeyCodeNumber(key),
            which: this.getKeyCodeNumber(key),
            bubbles: true,
            cancelable: true
        });
        
        const keyupEvent = new KeyboardEvent('keyup', {
            key: key,
            code: this.getKeyCode(key),
            keyCode: this.getKeyCodeNumber(key),
            which: this.getKeyCodeNumber(key),
            bubbles: true,
            cancelable: true
        });
        
        // Dispatch to both document and game canvas for better compatibility
        document.dispatchEvent(keydownEvent);
        const gameCanvas = document.getElementById('game');
        if (gameCanvas) {
            gameCanvas.dispatchEvent(keydownEvent);
        }
        
        // Simulate key release after a short delay
        setTimeout(() => {
            document.dispatchEvent(keyupEvent);
            if (gameCanvas) {
                gameCanvas.dispatchEvent(keyupEvent);
            }
        }, 100);
    }
    
    simulateKeyDown(key) {
        // Create more compatible keyboard events
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: this.getKeyCode(key),
            keyCode: this.getKeyCodeNumber(key),
            which: this.getKeyCodeNumber(key),
            bubbles: true,
            cancelable: true
        });
        
        // Dispatch to both document and game canvas
        document.dispatchEvent(event);
        const gameCanvas = document.getElementById('game');
        if (gameCanvas) {
            gameCanvas.dispatchEvent(event);
        }
    }
    
    simulateKeyUp(key) {
        // Create more compatible keyboard events
        const event = new KeyboardEvent('keyup', {
            key: key,
            code: this.getKeyCode(key),
            keyCode: this.getKeyCodeNumber(key),
            which: this.getKeyCodeNumber(key),
            bubbles: true,
            cancelable: true
        });
        
        // Dispatch to both document and game canvas
        document.dispatchEvent(event);
        const gameCanvas = document.getElementById('game');
        if (gameCanvas) {
            gameCanvas.dispatchEvent(event);
        }
    }
    
    // Helper methods for key code compatibility
    getKeyCode(key) {
        const keyCodes = {
            'w': 'KeyW',
            'a': 'KeyA',
            's': 'KeyS',
            'd': 'KeyD',
            't': 'KeyT',
            'm': 'KeyM',
            'i': 'KeyI'
        };
        return keyCodes[key.toLowerCase()] || `Key${key.toUpperCase()}`;
    }
    
    getKeyCodeNumber(key) {
        const keyNumbers = {
            'w': 87,
            'a': 65,
            's': 83,
            'd': 68,
            't': 84,
            'm': 77,
            'i': 73
        };
        return keyNumbers[key.toLowerCase()] || key.toUpperCase().charCodeAt(0);
    }
    
    // Public methods for external control
    setActive(active) {
        this.isActive = active;
        
        // Check if inventory or dialogue is open
        const inventoryOpen = document.getElementById('inventory-shop')?.style.display === 'flex';
        const dialogueOpen = document.getElementById('textbox-container')?.style.display === 'block';
        
        if (this.mobileControls) {
            // Only show mobile controls if we're in landscape mode, on mobile, and no overlays are open
            const shouldShow = active && this.isMobile && this.isLandscape && !inventoryOpen && !dialogueOpen;
            this.mobileControls.style.display = shouldShow ? 'block' : 'none';
        }
        
        // Update orientation display to ensure disclaimer is shown if needed
        if (this.isMobile) {
            this.updateOrientationDisplay();
        }
        
        // Trigger camera scaling when mobile controls are activated
        if (active && this.isMobile && this.onActivationCallbacks) {
            console.log("📱 Mobile controls activated, triggering camera scaling callbacks...");
            this.onActivationCallbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.warn("📱 Error in activation callback:", error);
                }
            });
        }
    }
    
    isMoving() {
        return this.joystickActive && (Math.abs(this.currentDirection.x) > 0.3 || Math.abs(this.currentDirection.y) > 0.3);
    }
    
    getCurrentDirection() {
        return { ...this.currentDirection };
    }
    
    // Check if mobile controls are currently being used
    isUsingMobileControls() {
        return this.isMobile && this.isActive && this.joystickActive;
    }
    
    // Check if the game should be blocked due to orientation
    shouldBlockGameplay() {
        return this.isMobile && !this.isLandscape;
    }
    
    // Get current orientation status
    getOrientationStatus() {
        return {
            isMobile: this.isMobile,
            isLandscape: this.isLandscape,
            shouldShowDisclaimer: this.isMobile && !this.isLandscape
        };
    }
    
    // Method to close world map when clicking outside on mobile
    setupWorldMapMobileHandling() {
        if (!this.isMobile) return;
        
        const worldMap = document.getElementById('world-map');
        if (worldMap) {
            worldMap.addEventListener('click', (e) => {
                // Close map if clicking on the background (not on buttons or content)
                if (e.target === worldMap) {
                    worldMap.style.display = 'none';
                    const mapBtn = document.getElementById('show-world-map');
                    if (mapBtn) mapBtn.innerHTML = "Weltkarte anzeigen (M)";
                    if (this.mapBtn) this.mapBtn.classList.remove('active');
                }
            });
            
            // Add enhanced zoom functionality
            this.setupWorldMapZoom(worldMap);
        }
    }
    
    // Enhanced world map zoom functionality for mobile
    setupWorldMapZoom(worldMap) {
        const worldMapImg = worldMap?.querySelector('img');
        if (!worldMapImg) return;
        
        let isZoomed = false;
        let tapTimeout = null;
        let lastTap = 0;
        
        worldMapImg.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Clear any existing timeout
            if (tapTimeout) {
                clearTimeout(tapTimeout);
                tapTimeout = null;
            }
            
            // Check for double tap (within 300ms)
            if (tapLength < 300 && tapLength > 0) {
                // Double tap - reset zoom
                isZoomed = false;
                worldMapImg.classList.remove('zoomed');
                
                // Stronger haptic feedback for double tap
                if (navigator.vibrate) {
                    navigator.vibrate([50, 50, 50]);
                }
                
                lastTap = 0; // Reset to prevent triple tap issues
            } else {
                // Single tap - set timeout to toggle zoom
                tapTimeout = setTimeout(() => {
                    // Toggle zoom state
                    isZoomed = !isZoomed;
                    
                    if (isZoomed) {
                        worldMapImg.classList.add('zoomed');
                    } else {
                        worldMapImg.classList.remove('zoomed');
                    }
                    
                    // Haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate(30);
                    }
                    
                    tapTimeout = null;
                }, 300); // 300ms delay to distinguish from double tap
                
                lastTap = currentTime;
            }
        }, { passive: false });
        
        // Reset zoom when map is closed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (worldMap.style.display === 'none') {
                        isZoomed = false;
                        worldMapImg.classList.remove('zoomed');
                        if (tapTimeout) {
                            clearTimeout(tapTimeout);
                            tapTimeout = null;
                        }
                    }
                }
            });
        });
        
        observer.observe(worldMap, { attributes: true });
    }
    
    // Enhanced initialization for mobile-specific features
    initMobileFeatures() {
        if (!this.isMobile) return;
        
        this.setupWorldMapMobileHandling();
        this.setupInteractButtonTouch(); // Add direct touch for interact button
        this.setupInventoryMobileOptimizations(); // Add inventory mobile optimizations
        this.setupDialogueMobileOptimizations(); // Add dialogue mobile optimizations
        
        // Add viewport meta tag if not present for better mobile experience
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // Make the interact button directly touchable
    setupInteractButtonTouch() {
        const interactButton = document.getElementById('interact-button');
        if (!interactButton) return;
        
        // Add touch event listeners to the interact button
        interactButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Simulate haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Add visual feedback
            interactButton.style.transform = 'translateX(-50%) scale(0.95)';
            interactButton.style.backgroundColor = '#ffd700';
            interactButton.style.color = '#2d2929';
            
            // Simulate T key press
            this.simulateKeyPress('t');
            
            // Reset visual feedback
            setTimeout(() => {
                interactButton.style.transform = 'translateX(-50%) scale(1)';
                interactButton.style.backgroundColor = '#2d2929';
                interactButton.style.color = '#ffffff';
            }, 200);
        }, { passive: false });
        
        // Also add click event for compatibility
        interactButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Simulate T key press
            this.simulateKeyPress('t');
        });
        
        // Make the button more touch-friendly
        interactButton.style.cursor = 'pointer';
        interactButton.style.userSelect = 'none';
        interactButton.style.webkitUserSelect = 'none';
        interactButton.style.touchAction = 'manipulation';
    }
    
    setupOrientation() {
        if (!this.isMobile) return;
        
        // Check initial orientation
        this.checkOrientation();
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure the orientation change is complete
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
        
        // Also listen for resize events as a fallback
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
        
        // Listen for screen orientation API if available
        if (screen && screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.checkOrientation();
            });
        }
    }
    
    checkOrientation() {
        if (!this.isMobile) return;
        
        // Determine if device is in landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
        
        // Alternative check using screen.orientation if available
        let orientationLandscape = false;
        if (screen && screen.orientation) {
            orientationLandscape = screen.orientation.angle === 90 || screen.orientation.angle === -90;
        }
        
        // Use the most reliable method
        this.isLandscape = isLandscape || orientationLandscape;
        
        // Show/hide orientation disclaimer
        this.updateOrientationDisplay();
        
        console.log(`📱 Orientation: ${this.isLandscape ? 'Landscape' : 'Portrait'}`);
    }
    
    updateOrientationDisplay() {
        if (!this.isMobile || !this.orientationDisclaimer) return;
        
        if (this.isLandscape) {
            // Hide orientation disclaimer
            this.orientationDisclaimer.style.display = 'none';
            // Show mobile controls if game is active
            if (this.isActive && this.mobileControls) {
                this.mobileControls.style.display = 'block';
            }
        } else {
            // Show orientation disclaimer
            this.orientationDisclaimer.style.display = 'flex';
            // Hide mobile controls
            if (this.mobileControls) {
                this.mobileControls.style.display = 'none';
            }
        }
    }
    
    // Optimize dialogue for mobile devices
    setupDialogueMobileOptimizations() {
        const textboxContainer = document.getElementById('textbox-container');
        if (!textboxContainer) return;
        
        // Improve touch interaction for dialogue buttons
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (textboxContainer.style.display === 'block') {
                        this.optimizeDialogueForMobile();
                    } else {
                        this.restoreControlsVisibility();
                    }
                }
            });
        });
        
        observer.observe(textboxContainer, { attributes: true });
    }
    
    optimizeDialogueForMobile() {
        // Temporarily hide mobile controls when dialogue is open
        this.temporarilyHideControls();
        
        const textbox = document.getElementById('textbox');
        if (!textbox) return;
        
        // Add mobile-specific class
        textbox.classList.add('mobile-optimized');
        
        // Enhanced button handling for mobile
        this.setupDialogueButtons(textbox);
        
        // Add swipe gesture support for dialogue navigation
        this.setupDialogueSwipeGestures(textbox);
        
        // Ensure textbox doesn't interfere with mobile controls
        if (this.isLandscape) {
            textbox.style.marginBottom = '100px';
        }
        
        // Improve scrolling if content is too long
        textbox.style.webkitOverflowScrolling = 'touch';
        
        // Add accessibility improvements
        this.enhanceDialogueAccessibility(textbox);
    }
    
    setupDialogueButtons(textbox) {
        const buttons = textbox.querySelectorAll('.button');
        buttons.forEach((button, index) => {
            button.style.touchAction = 'manipulation';
            button.style.webkitTapHighlightColor = 'transparent';
            
            // Add enhanced touch feedback
            button.addEventListener('touchstart', (e) => {
                button.style.transform = 'scale(0.98)';
                
                // Haptic feedback for different button types
                if (navigator.vibrate) {
                    if (button.classList.contains('question-btn')) {
                        navigator.vibrate(30); // Lighter feedback for questions
                    } else {
                        navigator.vibrate(50); // Stronger feedback for actions
                    }
                }
            }, { passive: true });
            
            button.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            }, { passive: true });
            
            // Add keyboard number support for question buttons
            if (button.classList.contains('question-btn')) {
                const questionNumber = index + 1;
                button.setAttribute('data-question-number', questionNumber);
                
                // Add visual number indicator if not already present
                if (!button.querySelector('.question-number')) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'question-number';
                    numberSpan.textContent = questionNumber;
                    numberSpan.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: rgba(255, 215, 0, 0.8);
                        color: #2d2929;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.9rem;
                        font-weight: bold;
                    `;
                    button.style.position = 'relative';
                    button.appendChild(numberSpan);
                }
            }
            
            // Handle dialogue close and restore controls
            button.addEventListener('click', () => {
                setTimeout(() => {
                    const dialogueOpen = document.getElementById('textbox-container')?.style.display === 'block';
                    if (!dialogueOpen) {
                        this.restoreControlsVisibility();
                    }
                }, 200);
            });
        });
        
        // Enhanced close button handling
        const closeBtn = document.getElementById('close');
        const closeXBtn = document.getElementById('close-x');
        
        [closeBtn, closeXBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    setTimeout(() => {
                        this.restoreControlsVisibility();
                    }, 100);
                });
                
                // Enhanced touch feedback for close buttons
                btn.addEventListener('touchstart', (e) => {
                    btn.style.transform = 'scale(0.95)';
                    if (navigator.vibrate) {
                        navigator.vibrate(40);
                    }
                }, { passive: true });
                
                btn.addEventListener('touchend', (e) => {
                    setTimeout(() => {
                        btn.style.transform = '';
                    }, 150);
                }, { passive: true });
            }
        });
    }
    
    setupDialogueSwipeGestures(textbox) {
        let startY = 0;
        let startTime = 0;
        
        textbox.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        textbox.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const deltaY = startY - endY;
            const deltaTime = endTime - startTime;
            
            // Detect swipe up gesture to close dialogue (quick swipe)
            if (deltaY > 50 && deltaTime < 300) {
                const closeBtn = document.getElementById('close');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
        }, { passive: true });
    }
    
    enhanceDialogueAccessibility(textbox) {
        // Add ARIA labels and roles
        textbox.setAttribute('role', 'dialog');
        textbox.setAttribute('aria-modal', 'true');
        
        const title = textbox.querySelector('h2');
        if (title) {
            title.setAttribute('id', 'dialogue-title');
            textbox.setAttribute('aria-labelledby', 'dialogue-title');
        }
        
        const content = textbox.querySelector('p');
        if (content) {
            content.setAttribute('id', 'dialogue-content');
            textbox.setAttribute('aria-describedby', 'dialogue-content');
        }
        
        // Focus management
        const firstButton = textbox.querySelector('.button');
        if (firstButton) {
            setTimeout(() => {
                firstButton.focus();
            }, 100);
        }
    }
    
    // Optimize inventory for mobile devices
    setupInventoryMobileOptimizations() {
        const inventoryShop = document.getElementById('inventory-shop');
        if (!inventoryShop) return;
        
        // Add touch-friendly close functionality
        inventoryShop.addEventListener('click', (e) => {
            // Close inventory if clicking on the background
            if (e.target === inventoryShop) {
                const inventoryBtn = document.getElementById('show-inventory');
                if (inventoryBtn) {
                    inventoryBtn.click(); // Trigger the existing close functionality
                }
            }
        });
        
        // Improve scrolling for mobile
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (inventoryShop.style.display === 'flex') {
                        this.optimizeInventoryForMobile();
                    } else {
                        this.restoreControlsVisibility();
                    }
                }
            });
        });
        
        observer.observe(inventoryShop, { attributes: true });
    }
    
    optimizeInventoryForMobile() {
        // Temporarily hide mobile controls when inventory is open
        this.temporarilyHideControls();
        
        // Add mobile-specific classes and optimizations when inventory opens
        const inventoryContainer = document.querySelector('.inventory-shop-container');
        if (inventoryContainer) {
            inventoryContainer.classList.add('mobile-optimized');
            
            // Add mobile close button if it doesn't exist
            if (!inventoryContainer.querySelector('.mobile-close-btn')) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'mobile-close-btn';
                closeBtn.innerHTML = '×';
                closeBtn.setAttribute('aria-label', 'Close inventory');
                
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate(30);
                    }
                    
                    // Close inventory
                    const inventoryBtn = document.getElementById('show-inventory');
                    if (inventoryBtn) {
                        inventoryBtn.click();
                    }
                    
                    // Restore mobile controls
                    setTimeout(() => {
                        this.restoreControlsVisibility();
                    }, 100);
                });
                
                inventoryContainer.appendChild(closeBtn);
            }
        }
        
        // Enhanced inventory item interactions
        this.setupInventoryItemInteractions();
        
        // Ensure proper scrolling for mobile
        const shopSection = document.querySelector('.shop-section');
        const inventorySection = document.querySelector('.inventory-section');
        
        [shopSection, inventorySection].forEach(section => {
            if (section) {
                section.style.webkitOverflowScrolling = 'touch';
                section.style.overflowY = 'auto';
                
                // Add scroll indicators
                this.addScrollIndicators(section);
            }
        });
        
        // Add accessibility improvements
        this.enhanceInventoryAccessibility();
    }
    
    setupInventoryItemInteractions() {
        const items = document.querySelectorAll('.inventory-item, .shop-item');
        
        items.forEach(item => {
            // Enhanced touch feedback
            item.addEventListener('touchstart', (e) => {
                item.style.transform = 'scale(0.98)';
                
                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            }, { passive: true });
            
            item.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    item.style.transform = '';
                }, 150);
            }, { passive: true });
            
            // Enhanced button interactions within items
            const buttons = item.querySelectorAll('.button');
            buttons.forEach(button => {
                button.addEventListener('touchstart', (e) => {
                    e.stopPropagation(); // Prevent item touch feedback
                    button.style.transform = 'scale(0.95)';
                    
                    if (navigator.vibrate) {
                        navigator.vibrate(40);
                    }
                }, { passive: true });
                
                button.addEventListener('touchend', (e) => {
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 150);
                }, { passive: true });
            });
        });
    }
    
    addScrollIndicators(section) {
        // Add visual scroll indicators for better UX
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.style.cssText = `
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 60%;
            background: rgba(255, 215, 0, 0.3);
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const scrollThumb = document.createElement('div');
        scrollThumb.style.cssText = `
            width: 100%;
            background: #ffd700;
            border-radius: 2px;
            transition: all 0.3s ease;
        `;
        
        scrollIndicator.appendChild(scrollThumb);
        section.style.position = 'relative';
        section.appendChild(scrollIndicator);
        
        // Update scroll indicator
        const updateScrollIndicator = () => {
            const scrollPercentage = section.scrollTop / (section.scrollHeight - section.clientHeight);
            const thumbHeight = Math.max(20, (section.clientHeight / section.scrollHeight) * 100);
            const thumbPosition = scrollPercentage * (100 - thumbHeight);
            
            scrollThumb.style.height = `${thumbHeight}%`;
            scrollThumb.style.transform = `translateY(${thumbPosition}%)`;
            
            // Show indicator when scrolling
            scrollIndicator.style.opacity = '1';
            clearTimeout(scrollIndicator.hideTimeout);
            scrollIndicator.hideTimeout = setTimeout(() => {
                scrollIndicator.style.opacity = '0';
            }, 1000);
        };
        
        section.addEventListener('scroll', updateScrollIndicator, { passive: true });
        updateScrollIndicator(); // Initial update
    }
    
    enhanceInventoryAccessibility() {
        const inventoryShop = document.getElementById('inventory-shop');
        if (inventoryShop) {
            inventoryShop.setAttribute('role', 'dialog');
            inventoryShop.setAttribute('aria-modal', 'true');
            inventoryShop.setAttribute('aria-label', 'Inventory and Shop');
        }
        
        // Add proper ARIA labels to sections
        const shopSection = document.querySelector('.shop-section');
        const inventorySection = document.querySelector('.inventory-section');
        
        if (shopSection) {
            shopSection.setAttribute('role', 'region');
            shopSection.setAttribute('aria-label', 'Shop Items');
        }
        
        if (inventorySection) {
            inventorySection.setAttribute('role', 'region');
            inventorySection.setAttribute('aria-label', 'Inventory Items');
        }
        
        // Focus management
        const firstFocusable = inventoryShop.querySelector('.mobile-close-btn, .button');
        if (firstFocusable) {
            setTimeout(() => {
                firstFocusable.focus();
            }, 100);
        }
    }
    
    // Method to temporarily hide mobile controls (for inventory/dialogue)
    temporarilyHideControls() {
        if (this.mobileControls && this.isMobile) {
            this.mobileControls.style.opacity = '0.3';
            this.mobileControls.style.pointerEvents = 'none';
        }
    }
    
    // Method to restore mobile controls visibility
    restoreControlsVisibility() {
        if (this.mobileControls && this.isMobile && this.isLandscape) {
            this.mobileControls.style.opacity = '1';
            this.mobileControls.style.pointerEvents = 'auto';
        }
    }
    
    // Setup mobile-specific camera scaling for better navigation
    setupMobileCameraScale() {
        if (!this.isMobile) return;
        
        console.log("📱 Setting up mobile camera scaling...");
        
        // Multiple strategies to ensure camera scaling works
        this.attemptCameraScaling();
        
        // Listen for orientation changes to readjust scale
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log("📱 Orientation changed, reapplying camera scale...");
                this.attemptCameraScaling();
            }, 300);
        });
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            if (this.isMobile) {
                console.log("📱 Window resized, reapplying camera scale...");
                this.attemptCameraScaling();
            }
        });
        
        // Also try when mobile controls are activated
        this.onActivationCallbacks = this.onActivationCallbacks || [];
        this.onActivationCallbacks.push(() => {
            setTimeout(() => {
                console.log("📱 Mobile controls activated, applying camera scale...");
                this.attemptCameraScaling();
            }, 100);
        });
    }
    
    attemptCameraScaling() {
        let attempts = 0;
        const maxAttempts = 10;
        const retryDelay = 200;
        
        const tryApplyScale = () => {
            attempts++;
            console.log(`📱 Camera scaling attempt ${attempts}/${maxAttempts}`);
            
            if (this.applyMobileCameraScale()) {
                console.log("📱 Camera scaling successful!");
                return true;
            }
            
            if (attempts < maxAttempts) {
                console.log(`📱 Camera scaling failed, retrying in ${retryDelay}ms...`);
                setTimeout(tryApplyScale, retryDelay);
            } else {
                console.warn("📱 Camera scaling failed after all attempts");
            }
            return false;
        };
        
        tryApplyScale();
    }
    
    applyMobileCameraScale() {
        try {
            // Check if Kaplay context is available
            if (typeof k === 'undefined') {
                console.log("📱 Kaplay context not available yet");
                return false;
            }
            
            // Check if we're in a scene
            if (!k.scene || typeof k.camScale !== 'function') {
                console.log("📱 Kaplay scene or camScale not available yet");
                return false;
            }
            
            // Check if we have a current scene
            const currentScene = k.getSceneName ? k.getSceneName() : null;
            if (!currentScene || currentScene === 'loading') {
                console.log("📱 Not in a game scene yet, current scene:", currentScene);
                return false;
            }
            
            // Store original scale for potential restoration (only once)
            if (!this.originalCamScale) {
                try {
                    this.originalCamScale = k.camScale();
                    console.log("📱 Stored original camera scale:", this.originalCamScale);
                } catch (e) {
                    console.log("📱 Could not get current camera scale, using default");
                    this.originalCamScale = { x: 1, y: 1 };
                }
            }
            
            // Apply mobile-specific scaling based on screen size
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Calculate appropriate scale factor for mobile
            let mobileScaleFactor;
            
            if (screenWidth <= 480) {
                // Small phones - zoom out more for better overview
                mobileScaleFactor = k.vec2(0.5, 0.5); // Even more zoomed out
            } else if (screenWidth <= 768) {
                // Tablets and larger phones - moderate zoom out
                mobileScaleFactor = k.vec2(0.65, 0.65); // More zoomed out
            } else if (screenWidth <= 1024) {
                // Large tablets - minimal zoom out
                mobileScaleFactor = k.vec2(0.8, 0.8);
            } else {
                // Very large screens - slight zoom out
                mobileScaleFactor = k.vec2(0.9, 0.9);
            }
            
            // Apply the mobile scale
            k.camScale(mobileScaleFactor);
            
            console.log(`📱 Successfully applied mobile camera scale: ${mobileScaleFactor.x}x for screen ${screenWidth}x${screenHeight}px`);
            
            // Store current mobile scale for reference
            this.currentMobileScale = mobileScaleFactor;
            
            // Verify the scale was applied
            const appliedScale = k.camScale();
            console.log("📱 Verified applied scale:", appliedScale);
            
            return true;
            
        } catch (error) {
            console.warn("📱 Could not apply mobile camera scale:", error);
            return false;
        }
    }
    
    // Restore original camera scale (useful for specific scenes or when switching to desktop)
    restoreOriginalCameraScale() {
        try {
            if (this.originalCamScale) {
                k.camScale(this.originalCamScale);
                console.log("📱 Restored original camera scale");
            }
        } catch (error) {
            console.warn("Could not restore original camera scale:", error);
        }
    }
    
    // Get current mobile scale factor
    getCurrentMobileScale() {
        return this.currentMobileScale || k.vec2(1, 1);
    }
    
    // Manual method to force camera scaling (useful for testing)
    forceCameraScale() {
        console.log("📱 Manually forcing camera scale...");
        return this.attemptCameraScaling();
    }
    
    // Method to check current camera status
    getCameraStatus() {
        try {
            const currentScale = k.camScale();
            const screenSize = { width: window.innerWidth, height: window.innerHeight };
            const isMobile = this.isMobile;
            const isActive = this.isActive;
            
            return {
                currentScale,
                originalScale: this.originalCamScale,
                mobileScale: this.currentMobileScale,
                screenSize,
                isMobile,
                isActive,
                kaplayAvailable: typeof k !== 'undefined',
                sceneAvailable: typeof k !== 'undefined' && k.scene,
                currentScene: k.getSceneName ? k.getSceneName() : 'unknown'
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Create and export a singleton instance
export const mobileControls = new MobileControls();

// Expose methods globally for testing and debugging
if (typeof window !== 'undefined') {
    window.mobileControls = mobileControls;
    window.forceMobileCameraScale = () => mobileControls.forceCameraScale();
    window.getMobileCameraStatus = () => mobileControls.getCameraStatus();
    
    console.log("📱 Mobile controls debugging methods available:");
    console.log("  - window.forceMobileCameraScale() - Force apply camera scaling");
    console.log("  - window.getMobileCameraStatus() - Get current camera status");
    console.log("  - window.mobileControls - Access full mobile controls object");
}
import { k } from "./kaboomCtx";
import {setCamScale, refreshScoreUI } from "./utils";
import { sessionState, setSessionState, getSessionState, saveGame, loadGame, increaseSecureScore } from "./sessionstate.js";
import { mobileControls } from "./mobileControls.js";

// Spielkonstanten
const GAME_SPEED = 300;
const PLAYER_SPEED = 400;
const ROAD_WIDTH = 400;
const OBSTACLE_SPAWN_RATE = 0.02; // Wahrscheinlichkeit pro Frame

const DECORATION_TYPES = [
    "tree",
    "tree",
    "tree",
    "tree",
    "tree",
    "rock",
    "bush",
    "bush",
    "bush",
    "flower",
];

const BASE_DECORATION_SPAWN_RATE = 0.5; // Base decoration spawn rate at normal speed
const MAX_DECORATION_SPAWN_RATE = 0.6; // Maximum decoration spawn rate at high speeds
const DECORATION_DENSITY = 40; // Initial decoration density (how many decorations to start with)
const DECORATION_MARGIN = 20;

const STRIPE_HEIGHT = 80; // Höhe der Straßenmarkierungen
const STRIPE_GAP = 120; // Abstand zwischen Straßenmarkierungen

// Mobile controls for cure minigame
class CureMobileControls {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartX = 0;
        this.touchCurrentX = 0;
        this.isTouch = false;
        this.gameOverButtons = [];
        
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }
    
    detectMobile() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }
    
    setupTouchControls() {
        // Touch controls for car movement
        const canvas = document.getElementById('game');
        if (!canvas) return;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchCurrentX = touch.clientX;
            this.isTouch = true;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isTouch) {
                const touch = e.touches[0];
                this.touchCurrentX = touch.clientX;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouch = false;
            this.touchStartX = 0;
            this.touchCurrentX = 0;
        }, { passive: false });
        
        // Prevent scrolling during game
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#game')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    getTouchDirection() {
        if (!this.isTouch) return 'none';
        
        const deltaX = this.touchCurrentX - this.touchStartX;
        const threshold = 30; // Minimum movement threshold
        
        if (Math.abs(deltaX) < threshold) return 'none';
        
        return deltaX > 0 ? 'right' : 'left';
    }
    
    createMobileGameOverScreen(onRestart, onExit) {
        // Clear any existing game over elements
        this.clearGameOverScreen();
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isMobile = screenWidth <= 768;
        
        // Create backdrop
        const backdrop = k.add([
            k.rect(k.width(), k.height()),
            k.pos(0, 0),
            k.color(k.rgb(0, 0, 0, 0.8)),
            k.z(198),
            "game-over-ui"
        ]);
        
        // Create main panel
        const panelWidth = isMobile ? Math.min(screenWidth * 0.9, 400) : 600;
        const panelHeight = isMobile ? Math.min(screenHeight * 0.7, 500) : 400;
        
        const panel = k.add([
            k.rect(panelWidth, panelHeight),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.color(k.rgb(45, 41, 41)),
            k.outline(4, k.rgb(255, 215, 0)),
            k.z(199),
            "game-over-ui"
        ]);
        
        // Game Over title
        const titleSize = isMobile ? 36 : 48;
        const gameOverText = k.add([
            k.text("Game Over!", { 
                size: titleSize,
                font: "monogram"
            }),
            k.pos(k.width() / 2, k.height() / 2 - panelHeight / 3),
            k.anchor("center"),
            k.color(k.rgb(255, 50, 50)),
            k.z(200),
            "game-over-ui"
        ]);
        
        // Score display
        const scoreSize = isMobile ? 24 : 32;
        const scoreElement = document.getElementById("minigame-score-value");
        const currentScore = scoreElement ? scoreElement.innerText : "0";
        
        const scoreText = k.add([
            k.text(`Punkte: ${currentScore}`, { 
                size: scoreSize,
                font: "monogram"
            }),
            k.pos(k.width() / 2, k.height() / 2 - panelHeight / 6),
            k.anchor("center"),
            k.color(k.rgb(255, 215, 0)),
            k.z(200),
            "game-over-ui"
        ]);
        
        // Button dimensions
        const buttonWidth = isMobile ? panelWidth * 0.8 : 300;
        const buttonHeight = isMobile ? 60 : 50;
        const buttonSpacing = isMobile ? 20 : 15;
        const buttonFontSize = isMobile ? 20 : 24;
        
        // Restart button
        const restartButton = this.createMobileButton(
            k.width() / 2,
            k.height() / 2 + buttonSpacing,
            buttonWidth,
            buttonHeight,
            "Nochmal spielen",
            buttonFontSize,
            () => {
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                onRestart();
            }
        );
        
        // Exit button
        const exitButton = this.createMobileButton(
            k.width() / 2,
            k.height() / 2 + buttonSpacing * 2 + buttonHeight,
            buttonWidth,
            buttonHeight,
            "Zurück zum Campus",
            buttonFontSize,
            () => {
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                onExit();
            }
        );
        
        // Store buttons for cleanup
        this.gameOverButtons = [restartButton, exitButton];
        
        // Add keyboard support for non-mobile devices
        if (!this.isMobile) {
            k.onKeyPress("space", onRestart);
            k.onKeyPress("escape", onExit);
            
            // Add instruction text for keyboard users
            const instructionSize = 16;
            k.add([
                k.text("Leertaste: Neustarten | ESC: Zurück", { 
                    size: instructionSize,
                    font: "monogram"
                }),
                k.pos(k.width() / 2, k.height() / 2 + panelHeight / 2 - 30),
                k.anchor("center"),
                k.color(k.rgb(200, 200, 200)),
                k.z(200),
                "game-over-ui"
            ]);
        }
    }
    
    createMobileButton(x, y, width, height, text, fontSize, onClick) {
        // Button background
        const button = k.add([
            k.rect(width, height),
            k.pos(x, y),
            k.anchor("center"),
            k.color(k.rgb(45, 41, 41)),
            k.outline(3, k.rgb(255, 215, 0)),
            k.area(),
            k.z(200),
            "game-over-ui",
            {
                isHovered: false,
                isPressed: false,
                originalColor: k.rgb(45, 41, 41),
                hoverColor: k.rgb(255, 215, 0),
                pressColor: k.rgb(200, 180, 0)
            }
        ]);
        
        // Button text
        const buttonText = k.add([
            k.text(text, { 
                size: fontSize,
                font: "monogram"
            }),
            k.pos(x, y),
            k.anchor("center"),
            k.color(k.rgb(255, 215, 0)),
            k.z(201),
            "game-over-ui"
        ]);
        
        // Touch/click handling
        button.onHover(() => {
            if (!button.isPressed) {
                button.color = button.hoverColor;
                buttonText.color = k.rgb(45, 41, 41);
                button.isHovered = true;
            }
        });
        
        button.onHoverEnd(() => {
            if (!button.isPressed) {
                button.color = button.originalColor;
                buttonText.color = k.rgb(255, 215, 0);
                button.isHovered = false;
            }
        });
        
        button.onClick(() => {
            button.isPressed = true;
            button.color = button.pressColor;
            buttonText.color = k.rgb(45, 41, 41);
            
            // Visual feedback
            button.scale = k.vec2(0.95, 0.95);
            
            setTimeout(() => {
                button.scale = k.vec2(1, 1);
                onClick();
            }, 150);
        });
        
        return { button, text: buttonText };
    }
    
    clearGameOverScreen() {
        // Remove all game over UI elements
        k.get("game-over-ui").forEach(obj => obj.destroy());
        this.gameOverButtons = [];
    }
    
    cleanup() {
        this.clearGameOverScreen();
        this.isTouch = false;
        this.touchStartX = 0;
        this.touchCurrentX = 0;
    }
    
    // Apply mobile camera scaling for better visibility
    applyMobileCameraScale() {
        if (!this.isMobile) return;
        
        try {
            // Check if Kaplay context is available
            if (typeof k === 'undefined' || !k.camScale) {
                console.log("📱 Cure Minigame: Kaplay context not available for camera scaling");
                return false;
            }
            
            // Store original scale for potential restoration (only once)
            if (!this.originalCamScale) {
                try {
                    this.originalCamScale = k.camScale();
                    console.log("📱 Cure Minigame: Stored original camera scale:", this.originalCamScale);
                } catch (e) {
                    console.log("📱 Cure Minigame: Could not get current camera scale, using default");
                    this.originalCamScale = { x: 1, y: 1 };
                }
            }
            
            // Apply mobile-specific scaling based on screen size
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Calculate appropriate scale factor for mobile minigame
            let mobileScaleFactor;
            
            if (screenWidth <= 480) {
                // Small phones - zoom out significantly for better overview
                mobileScaleFactor = k.vec2(0.6, 0.6);
            } else if (screenWidth <= 768) {
                // Tablets and larger phones - moderate zoom out
                mobileScaleFactor = k.vec2(0.75, 0.75);
            } else if (screenWidth <= 1024) {
                // Large tablets - slight zoom out
                mobileScaleFactor = k.vec2(0.85, 0.85);
            } else {
                // Very large screens - minimal zoom out
                mobileScaleFactor = k.vec2(0.9, 0.9);
            }
            
            // Apply the mobile scale
            k.camScale(mobileScaleFactor);
            
            console.log(`📱 Cure Minigame: Applied mobile camera scale: ${mobileScaleFactor.x}x for screen ${screenWidth}x${screenHeight}px`);
            
            // Store current mobile scale for reference
            this.currentMobileScale = mobileScaleFactor;
            
            return true;
            
        } catch (error) {
            console.warn("📱 Cure Minigame: Could not apply mobile camera scale:", error);
            return false;
        }
    }
    
    // Restore original camera scale
    restoreOriginalCameraScale() {
        if (!this.isMobile) return;
        
        try {
            if (this.originalCamScale && typeof k !== 'undefined' && k.camScale) {
                k.camScale(this.originalCamScale);
                console.log("📱 Cure Minigame: Restored original camera scale");
            }
        } catch (error) {
            console.warn("📱 Cure Minigame: Could not restore original camera scale:", error);
        }
    }
}

export function loadCureSprites() {
    k.loadSprite("car", "./sprites/minigames/car.png", {
        sliceX: 1,
        sliceY: 1,
    });

    k.loadSprite("roadblock", "./sprites/minigames/roadblock.png");
    k.loadSprite("rock", "./sprites/minigames/rock.png");
    k.loadSprite("tree", "./sprites/minigames/tree.png");
    k.loadSprite("bush", "./sprites/minigames/bush.png");
}

export function defineCureScene() {
    k.scene("cure_minigame", async () => {
        // Reset all game state variables at the start of the scene
        let timePassed = 0;
        let gameSpeed = GAME_SPEED;
        let obstacles = [];
        let decorations = [];
        let isGameOver = false;
        let stripes = [];
        let music = undefined;
        let isRestarting = false; // Flag to track if we're restarting vs actually leaving
        
        // Initialize mobile controls for cure minigame
        const cureMobileControls = new CureMobileControls();

        // Clean up any existing game objects from previous runs
        k.destroyAll("player");
        k.destroyAll("road");
        k.destroyAll("boundary");
        k.destroyAll("stripe");
        k.destroyAll("obstacle");
        k.destroyAll("decoration");
        k.destroyAll("decoration_part");
        k.destroyAll("game-over-ui");
        
        // Clean up any game over UI elements that might still exist
        k.get().forEach(obj => {
            if (obj.text && (obj.text.includes("Game Over") || obj.text.includes("ESC:") || obj.text.includes("Leertaste:"))) {
                obj.destroy();
            }
        });
        
        // Clean up any background panels from game over screen
        k.get().forEach(obj => {
            if (obj.color && obj.color.r === 150 && obj.color.g === 0 && obj.color.b === 0) {
                obj.destroy();
            }
        });

        const music_volume = sessionState.settings.musicVolume || 0.5;

        // Hide world map and inventory buttons during minigame
        const showWorldMapBtn = document.getElementById("show-world-map");
        const showInventoryBtn = document.getElementById("show-inventory");
        if (showWorldMapBtn) showWorldMapBtn.style.display = "none";
        if (showInventoryBtn) showInventoryBtn.style.display = "none";

        // Hide mobile controls during minigame (they're not needed for this simple left/right game)
        mobileControls.setActive(false);

        if (music === undefined) {
            // Play the map-specific background music only if volume is > 0
            if (music_volume === 0) {
                music = null;
                window.currentBgm = null;
            } else {
                music = k.play("bgm_cureMinigame", {
                    volume: music_volume,
                    loop: true,
                });
                // Set this as the current background music for global volume control
                window.currentBgm = music;
            }
        } else if (music && window.currentBgm !== music) {
            // If music already exists but isn't the current bgm, update the reference
            window.currentBgm = music;
        }

        const during_minigame = document.getElementsByClassName("during-minigame");
        for (let i = 0; i < during_minigame.length; i++) {
            during_minigame[i].style.display = "block";
            during_minigame[i].style.opacity = 1;
        }
        k.setBackground(k.rgb(83, 162, 83));
        const player = k.add([
            k.sprite("car"),
            k.area({ shape: new k.Rect(k.vec2(0), 400, 800) }),
            k.anchor("center"),
            k.pos(k.width() / 2, k.height() / 1.5),
            k.z(9),
            k.scale(0.15),
            {
                speed: PLAYER_SPEED,
                direction: "down",
            },
            "player",
        ]);

        k.add([
            k.rect(ROAD_WIDTH, k.height()),
            k.color(k.rgb(50, 50, 50)),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.z(1),
            "road",
        ]);

        k.add([
            k.rect(20, k.height()),
            k.color(k.rgb(200, 200, 0)),
            k.pos(k.width() / 2 - ROAD_WIDTH / 2 - 10, k.height() / 2),
            k.anchor("center"),
            k.area(),
            k.z(2),
            "boundary",
        ]);

        k.add([
            k.rect(20, k.height()),
            k.color(k.rgb(200, 200, 0)),
            k.pos(k.width() / 2 + ROAD_WIDTH / 2 + 10, k.height() / 2),
            k.anchor("center"),
            k.area(),
            k.z(2),
            "boundary",
        ]);

        // Straßenmarkierungen initialisieren
        function initializeStripes() {
            const totalLength = k.height() + STRIPE_HEIGHT + STRIPE_GAP;
            const numStripes =
                Math.ceil(totalLength / (STRIPE_HEIGHT + STRIPE_GAP)) + 1;

            // Stripes array leeren, falls es bereits Elemente enthält
            stripes.forEach((stripe) => stripe.destroy());
            stripes = [];

            // Erstelle die Markierungen mit exakt gleichmäßigem Abstand
            for (let i = 0; i < numStripes; i++) {
                const yPos = i * (STRIPE_HEIGHT + STRIPE_GAP);

                const stripe = k.add([
                    k.rect(10, STRIPE_HEIGHT),
                    k.color(k.rgb(255, 255, 255)),
                    k.pos(k.width() / 2, yPos),
                    k.anchor("center"),
                    k.z(2),
                    "stripe",
                ]);

                stripes.push(stripe);
            }
        }

        initializeStripes();

        function createDecorationAt(x, y, type) {
            const decorationId = "dec_" + Math.random().toString(36).substr(2, 9);
            let decorationObj;

            switch (type) {
                case "tree":
                    decorationObj = k.add([
                        k.sprite("tree"),
                        k.pos(x, y),
                        k.anchor("bot"),
                        k.z(10),
                        "decoration",
                        {
                            decorationId: decorationId,
                            speed: gameSpeed,
                            type: "tree",
                        },
                    ]);
                    break;

                case "bush":
                    decorationObj = k.add([
                        k.sprite("bush"),
                        k.pos(x, y),
                        k.scale(0.07),
                        k.anchor("center"),
                        k.z(3),
                        "decoration",
                        {
                            decorationId: decorationId,
                            speed: gameSpeed,
                            type: "bush",
                        },
                    ]);
                    break;

                case "rock":
                    decorationObj = k.add([
                        k.sprite("rock"),
                        k.scale(0.25),
                        k.pos(x, y),
                        k.anchor("center"),
                        k.z(3),
                        "decoration",
                        {
                            decorationId: decorationId,
                            speed: gameSpeed,
                            type: "rock",
                        },
                    ]);
                    break;

                case "flower":
                    // Stängel
                    k.add([
                        k.rect(3, 15),
                        k.color(k.rgb(20, 150, 20)),
                        k.pos(x, y + 15),
                        k.anchor("center"),
                        k.z(2),
                        "decoration_part",
                        {
                            decorationId: decorationId,
                            speed: gameSpeed,
                        },
                    ]);

                    // Blüte
                    decorationObj = k.add([
                        k.circle(5),
                        k.color(k.rgb(255, 200, 0)),
                        k.pos(x, y),
                        k.anchor("center"),
                        k.z(3),
                        "decoration",
                        {
                            decorationId: decorationId,
                            speed: gameSpeed,
                            type: "flower",
                        },
                    ]);
                    break;
            }

            decorations.push(decorationObj);
            return decorationObj;
        }

        function initializeDecorations() {

            for (let i = 0; i < DECORATION_DENSITY; i++) {
                // Random y position within the visible area and slightly beyond
                const yPos = -k.height() * 0.5 + k.rand(0, k.height() * 2);

                // Generate x position on either side of the road
                let decorX;

                // Randomly decide left or right side, excluding the road area
                if (k.rand() < 0.5) {
                    // Left side of the screen up to the road edge
                    decorX = k.rand(
                        DECORATION_MARGIN,
                        k.width() / 2 - ROAD_WIDTH / 2 - DECORATION_MARGIN
                    );
                } else {
                    // Right side of the screen from the road edge
                    decorX = k.rand(
                        k.width() / 2 + ROAD_WIDTH / 2 + DECORATION_MARGIN,
                        k.width() - DECORATION_MARGIN
                    );
                }

                const type = k.choose(DECORATION_TYPES);
                createDecorationAt(decorX, yPos, type);
            }
        }

        initializeDecorations();

        /*
            // Erste Dekorationen platzieren
            for (let i = 0; i < 10; i++) {
              const decoration = createDecoration();
              decoration.pos.y = k.rand(-k.height(), k.height() * 2);
            }*/


        function createObstacle() {
            const obstacleX =
                k.width() / 2 + k.rand(-ROAD_WIDTH / 2 + 50, ROAD_WIDTH / 2 - 50);

            const obstacle = k.add([
                k.sprite("roadblock") || k.rect(40, 100),
                //k.color(k.rgb(255, 0, 0)),
                k.pos(obstacleX, -100),
                k.anchor("center"),
                k.area(),
                k.scale(0.7),
                k.z(5),
                "obstacle",
                {
                    speed: gameSpeed,
                },
            ]);

            obstacles.push(obstacle);
            return obstacle;
        }

        // Kollisionen
        player.onCollide("obstacle", () => {
            if (!isGameOver) {
                isGameOver = true;
                
                // Use mobile-friendly game over screen
                cureMobileControls.createMobileGameOverScreen(
                    () => {
                        // Restart function
                        isRestarting = true;
                        
                        // Restore camera scale before restarting
                        cureMobileControls.restoreOriginalCameraScale();
                        
                        // Clean up current game state before restarting
                        if (music) {
                            music.stop();
                        }
                        music = undefined;
                        window.currentBgm = null;
                        
                        // Clean up mobile controls
                        cureMobileControls.cleanup();
                        
                        // Restart the minigame scene
                        k.go("cure_minigame");
                    },
                    () => {
                        // Exit function
                        
                        // Restore camera scale before exiting
                        cureMobileControls.restoreOriginalCameraScale();
                        
                        if (music) {
                            music.stop();
                        }
                        music = undefined;
                        window.currentBgm = null;
                        
                        // Clean up mobile controls
                        cureMobileControls.cleanup();
                        
                        k.go("campus");
                    }
                );
            }
        });

        function calculateScore(timePassed) {
            return Math.floor(timePassed / 10);
        }

        // Update-Logik
        k.onUpdate(() => {
            if (isGameOver) return;

            timePassed += k.dt();
            const scoreElement = document.getElementById("minigame-score-value");
            if (scoreElement) {
                scoreElement.innerText = calculateScore(timePassed).toString();
            } else {
                console.error("Element with ID 'minigame-score-value' not found");
            }

            // Geschwindigkeit erhöhen mit der Zeit
            const baseSpeed = GAME_SPEED;
            const maxSpeedIncrease = 300; // Maximum additional speed
            const difficultyFactor = 0.15; // Lower = slower progression

            gameSpeed =
                baseSpeed +
                maxSpeedIncrease *
                (1 - Math.exp(-difficultyFactor * Math.floor(timePassed / 5)));

            function updateStripes() {
                // NUR Straßenmarkierungen bewegen
                for (let i = 0; i < stripes.length; i++) {
                    const stripe = stripes[i];
                    stripe.pos.y += gameSpeed * k.dt();

                    // Wenn eine Markierung aus dem Bildschirm verschwindet, setzen wir sie zurück nach oben
                    if (stripe.pos.y > k.height() + STRIPE_HEIGHT / 2) {
                        // Finde die aktuelle Position des obersten Streifens
                        let topStripeY = Infinity;
                        for (let j = 0; j < stripes.length; j++) {
                            if (stripes[j].pos.y < topStripeY) {
                                topStripeY = stripes[j].pos.y;
                            }
                        }

                        // Platziere den Streifen exakt STRIPE_HEIGHT + STRIPE_GAP oberhalb des aktuell höchsten Streifens
                        stripe.pos.y = topStripeY - (STRIPE_HEIGHT + STRIPE_GAP);
                    }
                }
            }
            updateStripes();

            // Dekorationen bewegen
            for (let i = decorations.length - 1; i >= 0; i--) {
                const decoration = decorations[i];
                const decorId = decoration.decorationId;
                decoration.pos.y += gameSpeed * k.dt();
                decoration.z = decoration.pos.y / 10;
                if (decoration.ty)
                    // Bewege alle zusammengehörigen Teile
                    k.get("decoration_part").forEach((part) => {
                        if (part.decorationId === decorId) {
                            part.pos.y += gameSpeed * k.dt();
                        }
                    });

                // Dekorationen entfernen, die aus dem Bildschirm verschwinden
                if (decoration.pos.y > k.height() + 100) {
                    // Zugehörige Teile entfernen
                    k.get("decoration_part").forEach((part) => {
                        if (part.decorationId === decorId) {
                            part.destroy();
                        }
                    });

                    decoration.destroy();
                    decorations.splice(i, 1);
                }
            }

            // Calculate dynamic decoration spawn rate based on game speed
            const speedRatio =
                (gameSpeed - GAME_SPEED) / (GAME_SPEED + maxSpeedIncrease - GAME_SPEED);
            const currentDecorationSpawnRate =
                BASE_DECORATION_SPAWN_RATE +
                (MAX_DECORATION_SPAWN_RATE - BASE_DECORATION_SPAWN_RATE) *
                Math.min(1, speedRatio);

            // Generate new decorations across the entire screen (except road)
            if (k.rand() < currentDecorationSpawnRate) {
                let decorX;

                // Randomly decide left or right side, excluding the road area
                if (k.rand() < 0.5) {
                    // Left side of the screen up to the road edge
                    decorX = k.rand(
                        DECORATION_MARGIN,
                        k.width() / 2 - ROAD_WIDTH / 2 - DECORATION_MARGIN
                    );
                } else {
                    // Right side of the screen from the road edge
                    decorX = k.rand(
                        k.width() / 2 + ROAD_WIDTH / 2 + DECORATION_MARGIN,
                        k.width() - DECORATION_MARGIN
                    );
                }

                createDecorationAt(decorX, -100, k.choose(DECORATION_TYPES));
            }

            // Hindernisse bewegen
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                obstacle.pos.y += gameSpeed * k.dt();

                // Hindernisse entfernen, die aus dem Bildschirm verschwinden
                if (obstacle.pos.y > k.height() + 100) {
                    obstacle.destroy();
                    obstacles.splice(i, 1);
                }
            }

            // Zufällig neue Hindernisse erstellen
            if (k.rand() < OBSTACLE_SPAWN_RATE * (1 + timePassed / 100)) {
                createObstacle();
            }
        });


        k.onUpdate(() => {
            if (isGameOver) return;
            const directionVector = k.vec2(0, 0);
            let moveDirection = "none";
            
            // Mouse/touch controls
            if(k.isMouseDown()) {
                if (Math.abs(k.mousePos().x - player.pos.x) > 50) {
                    moveDirection = k.mousePos().x > (player.pos.x) ? "right" : "left";
                }
            }
            
            // Mobile touch controls
            const touchDirection = cureMobileControls.getTouchDirection();
            if (touchDirection !== "none") {
                moveDirection = touchDirection;
            }
            
            // Keyboard controls
            if (k.isKeyDown("left") || k.isKeyDown("a") || moveDirection === "left") {
                player.direction = "left";
                directionVector.x = -1;
            }
            if (k.isKeyDown("right") || k.isKeyDown("d") || moveDirection === "right") {
                player.direction = "right";
                directionVector.x = 1;
            }

            // Calculate the new position
            const potentialX =
                player.pos.x + directionVector.x * player.speed * k.dt();

            // Road boundaries - use ROAD_WIDTH to calculate the left and right edges
            const roadLeftEdge = k.width() / 2 - ROAD_WIDTH / 2 + 30; // Adding padding
            const roadRightEdge = k.width() / 2 + ROAD_WIDTH / 2 - 30; // Adding padding

            // Only move if the new position would be within road boundaries
            if (potentialX >= roadLeftEdge && potentialX <= roadRightEdge) {
                player.pos.x = potentialX;
            } else {
                // Snap to the boundary if going too far
                if (potentialX < roadLeftEdge) {
                    player.pos.x = roadLeftEdge;
                } else if (potentialX > roadRightEdge) {
                    player.pos.x = roadRightEdge;
                }
            }
        });

        setCamScale(k);
        
        // Apply mobile camera scaling for better visibility on mobile devices
        if (cureMobileControls.isMobile) {
            // Small delay to ensure everything is set up
            setTimeout(() => {
                cureMobileControls.applyMobileCameraScale();
            }, 100);
            
            // Show touch control hint for mobile users
            setTimeout(() => {
                const hint = k.add([
                    k.text("Wische links/rechts zum Steuern", { 
                        size: 20,
                        font: "monogram"
                    }),
                    k.pos(k.width() / 2, k.height() - 80),
                    k.anchor("center"),
                    k.color(k.rgb(255, 215, 0)),
                    k.z(1000),
                    k.opacity(0),
                    "touch-hint"
                ]);
                
                // Fade in
                k.tween(hint.opacity, 1, 0.5, k.easings.easeOutQuad, (val) => {
                    hint.opacity = val;
                });
                
                // Fade out after 3 seconds
                setTimeout(() => {
                    if (hint && hint.opacity !== undefined) {
                        k.tween(hint.opacity, 0, 0.5, k.easings.easeInQuad, (val) => {
                            hint.opacity = val;
                        }).then(() => {
                            if (hint && hint.destroy) {
                                hint.destroy();
                            }
                        });
                    }
                }, 3000);
            }, 500);
        }

        k.onResize(() => {
            setCamScale(k);
            
            // Reapply mobile camera scaling on resize
            if (cureMobileControls.isMobile) {
                setTimeout(() => {
                    cureMobileControls.applyMobileCameraScale();
                }, 50);
            }
        });

        k.onSceneLeave(async () => {
            // Restore original camera scale before leaving
            cureMobileControls.restoreOriginalCameraScale();
            
            // Clean up mobile controls
            cureMobileControls.cleanup();
            
            // If we're restarting, skip score processing and UI changes
            if (isRestarting) {
                console.log("Restarting minigame - skipping score processing");
                
                // Only do essential cleanup for restart
                obstacles.forEach((obstacle) => obstacle.destroy());
                decorations.forEach((decoration) => decoration.destroy());
                stripes.forEach((stripe) => stripe.destroy());
                
                // Stop the music if it exists
                if (music) {
                    music.stop();
                }
                
                // Clear the background music reference
                window.currentBgm = null;
                
                // Reset game state
                obstacles = [];
                decorations = [];
                stripes = [];
                timePassed = 0;
                isGameOver = false;
                music = undefined;
                
                return; // Exit early for restart
            }

            // Normal exit logic (going back to main game)
            const currentScore = calculateScore(timePassed);
            console.log("Minigame completed with score:", currentScore);
            
            // Update minigame-specific scores
            sessionState.minigames.cureMinigame.lastScore = currentScore;
            if (currentScore > sessionState.minigames.cureMinigame.bestScore) {
                sessionState.minigames.cureMinigame.bestScore = currentScore;
                console.log("🏆 New best minigame score:", currentScore);
            }
            
            // Add minigame score to main secure score
            if (currentScore > 0) {
                await increaseSecureScore(currentScore);
                console.log("🔒 Added", currentScore, "points to secure score");
            }
            
            await refreshScoreUI();

            // Show world map and inventory buttons when leaving minigame
            const showWorldMapBtn = document.getElementById("show-world-map");
            const showInventoryBtn = document.getElementById("show-inventory");
            if (showWorldMapBtn) showWorldMapBtn.style.display = "flex";
            if (showInventoryBtn) showInventoryBtn.style.display = "flex";

            // Restore mobile controls when leaving minigame
            mobileControls.setActive(true);

            // Clean up resources
            k.setBackground(k.Color.fromHex("#311047"));
            obstacles.forEach((obstacle) => obstacle.destroy());
            decorations.forEach((decoration) => decoration.destroy());
            stripes.forEach((stripe) => stripe.destroy());

            // Stop the music if it exists
            if (music) {
                music.stop();
            }

            // Clear the background music reference
            window.currentBgm = null;

            // Reset game state
            obstacles = [];
            decorations = [];
            stripes = [];
            timePassed = 0;
            isGameOver = false;
            music = undefined;

            //Hide minigame-specific HTML
            const during_minigame = document.getElementsByClassName("during-minigame");
            for (let i = 0; i < during_minigame.length; i++) {
                during_minigame[i].style.display = "none";
                during_minigame[i].style.opacity = 0;
            }
        });
    });
}

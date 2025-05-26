import { k } from './kaboomCtx';
import { dialogue } from './utils';
import { scaleFactor, companyMapsVisible } from './constants';

// Store company locations for the current map
let companyLocations = [];
let currentPrompt = null;
let currentSpaceHandler = null;
let isCompanyPromptActive = false; // Flag to coordinate with main interaction system

// Initialize company locations from map data
export function initCompanyFlags(mapData) {
    console.log("Initializing company flags with map data:", mapData.name);
    
    // Reset locations and cleanup
    companyLocations = [];
    cleanupCurrentPrompt();

    // Find the flags layer
    const flagsLayer = mapData.layers.find(layer => layer.name === "flags");
    if (!flagsLayer?.objects) {
        console.log("No flags layer found in map:", mapData.name);
        return;
    }

    console.log("Found flags layer with", flagsLayer.objects.length, "objects");

    // Store the positions and names
    companyLocations = flagsLayer.objects
        .filter(obj => obj.name && obj.name.trim().length > 0)
        .map(obj => {
            console.log("Adding company location:", obj.name, "at", obj.x, obj.y);
            return {
                name: obj.name,
                x: obj.x * scaleFactor,
                y: obj.y * scaleFactor,
                companyMap: `companies/${obj.name}` // Use companies/name format
            };
        });

    console.log("Initialized", companyLocations.length, "company locations");
}

// Clean up current prompt and handlers
function cleanupCurrentPrompt() {
    if (currentPrompt) {
        currentPrompt.destroy();
        currentPrompt = null;
    }
    
    if (currentSpaceHandler) {
        currentSpaceHandler.cancel();
        currentSpaceHandler = null;
    }
    
    isCompanyPromptActive = false;
}

// Create an enhanced retro-style prompt with better styling
function createEnhancedPrompt(text, companyName) {
    cleanupCurrentPrompt();

    const screenWidth = k.width();
    const screenHeight = k.height();

    // Create main background with gradient effect
    const promptBox = k.add([
        k.rect(500, 80, { radius: 8 }),
        k.color(k.Color.fromHex("#1a0d2e")), // Darker purple background
        k.outline(3, k.Color.fromHex("#8a2be2")), // Purple border
        k.anchor("center"),
        k.pos(screenWidth / 2, 100), // Position at top center
        k.fixed(),
        k.opacity(0.95),
        k.z(150), // Higher z-index to ensure it's above other UI
        "company-prompt"
    ]);

    // Create inner glow effect
    const glowBox = k.add([
        k.rect(494, 74, { radius: 6 }),
        k.color(k.Color.fromHex("#4a1a5a")), // Lighter purple for inner glow
        k.anchor("center"),
        k.pos(screenWidth / 2, 100),
        k.fixed(),
        k.opacity(0.3),
        k.z(151),
        "company-prompt"
    ]);

    // Company name header
    const headerText = k.add([
        k.text(companyName.toUpperCase(), {
            size: 18,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffff00"), // Yellow for company name
                outline: { width: 2, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, 85),
        k.fixed(),
        k.z(152),
        "company-prompt"
    ]);

    // Main prompt text
    const promptText = k.add([
        k.text(text, {
            size: 20,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffffff"),
                outline: { width: 2, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, 110),
        k.fixed(),
        k.z(152),
        "company-prompt"
    ]);

    // Create animated border effect
    let animTimer = 0;
    const borderAnimation = k.onUpdate(() => {
        animTimer += k.dt();
        const pulse = Math.sin(animTimer * 3) * 0.2 + 0.8; // Pulsing effect
        promptBox.opacity = pulse;
        glowBox.opacity = pulse * 0.3;
    });

    // Create blinking text effect for the main prompt
    let blinkTimer = 0;
    const blinkInterval = k.onUpdate(() => {
        blinkTimer += k.dt();
        if (blinkTimer > 0.8) {
            promptText.opacity = promptText.opacity === 1 ? 0.6 : 1;
            blinkTimer = 0;
        }
    });

    currentPrompt = {
        destroy: () => {
            k.destroyAll("company-prompt");
            borderAnimation.cancel();
            blinkInterval.cancel();
        }
    };

    isCompanyPromptActive = true;
}

// Create "work in progress" alert for unavailable companies
function createWorkInProgressAlert(companyName) {
    const screenWidth = k.width();
    const screenHeight = k.height();

    // Semi-transparent overlay
    const overlay = k.add([
        k.rect(screenWidth, screenHeight),
        k.color(k.Color.fromHex("#000000")),
        k.opacity(0.7),
        k.pos(0, 0),
        k.fixed(),
        k.z(200),
        "wip-alert"
    ]);

    // Main alert box
    const alertBox = k.add([
        k.rect(500, 180, { radius: 12 }),
        k.color(k.Color.fromHex("#1a0d2e")),
        k.outline(4, k.Color.fromHex("#ff6b35")), // Orange border for alert
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2),
        k.fixed(),
        k.opacity(0.98),
        k.z(201),
        "wip-alert"
    ]);

    // Inner glow
    const innerGlow = k.add([
        k.rect(490, 170, { radius: 10 }),
        k.color(k.Color.fromHex("#4a2a1a")), // Orange-tinted glow
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2),
        k.fixed(),
        k.opacity(0.4),
        k.z(202),
        "wip-alert"
    ]);

    // Warning icon
    const warningIcon = k.add([
        k.text("⚠", {
            size: 48,
            font: "monospace"
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 - 40),
        k.fixed(),
        k.color(k.Color.fromHex("#ff6b35")),
        k.z(203),
        "wip-alert"
    ]);

    // Company name
    const companyText = k.add([
        k.text(companyName.toUpperCase(), {
            size: 24,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffff00"),
                outline: { width: 2, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 - 5),
        k.fixed(),
        k.z(203),
        "wip-alert"
    ]);

    // Work in progress message
    const wipText = k.add([
        k.text("WORK IN PROGRESS", {
            size: 20,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ff6b35"),
                outline: { width: 2, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 + 20),
        k.fixed(),
        k.z(203),
        "wip-alert"
    ]);

    // Come back soon message
    const comeBackText = k.add([
        k.text("COME BACK SOON!", {
            size: 16,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffffff"),
                outline: { width: 1, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 + 45),
        k.fixed(),
        k.z(203),
        "wip-alert"
    ]);

    // Close instruction
    const closeText = k.add([
        k.text("PRESS ANY KEY TO CLOSE", {
            size: 14,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#aaaaaa"),
                outline: { width: 1, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 + 70),
        k.fixed(),
        k.z(203),
        "wip-alert"
    ]);

    // Blinking effect for the warning icon
    let blinkTimer = 0;
    const blinkEffect = k.onUpdate(() => {
        blinkTimer += k.dt();
        if (blinkTimer > 0.5) {
            warningIcon.opacity = warningIcon.opacity === 1 ? 0.5 : 1;
            blinkTimer = 0;
        }
    });

    // Close on any key press
    const closeHandler = k.onKeyPress(() => {
        k.destroyAll("wip-alert");
        blinkEffect.cancel();
        closeHandler.cancel();
    });
}

// Check if a company is available for visiting
function isCompanyAvailable(companyName) {
    return companyMapsVisible[companyName.toLowerCase()] === true;
}

// Check player proximity to company locations and coordinate with main interaction system
export function checkFlagProximity(player) {
    if (!player || companyLocations.length === 0) {
        if (isCompanyPromptActive) {
            cleanupCurrentPrompt();
        }
        return { hasCompanyInteraction: false };
    }

    const playerPos = player.worldPos();
    const INTERACTION_RADIUS = 170;

    // Find nearest company location
    let nearest = null;
    let bestDist = Infinity;

    for (const loc of companyLocations) {
        const dist = playerPos.dist(k.vec2(loc.x, loc.y));
        if (dist < bestDist) {
            bestDist = dist;
            nearest = loc;
        }
    }

    // Check if player is near a company location
    if (bestDist < INTERACTION_RADIUS) {
        // Check if company is available
        const isAvailable = isCompanyAvailable(nearest.name);
        
        // Show appropriate prompt if not already active
        if (!isCompanyPromptActive) {
            if (isAvailable) {
                createEnhancedPrompt(`DRUECKE LEERTASTE UM ZU BESUCHEN`, nearest.name);
            } else {
                createEnhancedPrompt(`IN ARBEIT, SCHAU SPÄTER NOCH MAL VORBEI`, nearest.name);
            }
        }

        // Create space handler if one doesn't exist
        if (!currentSpaceHandler) {
            currentSpaceHandler = k.onKeyPress("space", () => {
                if (player.isInDialogue || player.isFrozen) {
                    console.log("Player in dialogue or frozen, ignoring space press");
                    return;
                }

                if (isAvailable) {
                    console.log("Space pressed near available company:", nearest.name, "- navigating directly");
                    
                    // Clean up current prompt
                    cleanupCurrentPrompt();

                    // Navigate directly to company map
                    k.go(nearest.companyMap);
                } else {
                    console.log("Space pressed near unavailable company:", nearest.name, "- showing work in progress alert");
                    
                    // Clean up current prompt
                    cleanupCurrentPrompt();
                    
                    // Show work in progress alert
                    createWorkInProgressAlert(nearest.name);
                }
            });
        }

        return { 
            hasCompanyInteraction: true, 
            companyName: nearest.name,
            distance: bestDist,
            isAvailable: isAvailable
        };
    } else {
        // Player moved away, clean up
        if (isCompanyPromptActive) {
            cleanupCurrentPrompt();
        }
        return { hasCompanyInteraction: false };
    }
}

// Get current company interaction status (for coordination with main system)
export function getCompanyInteractionStatus() {
    return {
        isActive: isCompanyPromptActive,
        hasPrompt: currentPrompt !== null
    };
}

// Cleanup function
export function cleanupFlags() {
    console.log("Cleaning up company locations");
    cleanupCurrentPrompt();
    companyLocations = [];
    k.destroyAll("company-prompt");
    k.destroyAll("wip-alert");
} 
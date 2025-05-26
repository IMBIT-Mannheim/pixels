import { k } from './kaboomCtx';
import { scaleFactor } from './constants';

// Store goto area labels and their state
let gotoLabels = [];
let isGotoSystemActive = false;

// Configuration for goto area displays
const GOTO_CONFIG = {
    displayRadius: 200, // Distance at which labels become visible
    fadeDistance: 50,   // Distance over which labels fade in/out
    labelHeight: 60,    // Height above the goto area
    animationSpeed: 2,  // Speed of floating animation
    textSize: 28,       // Size of the label text
};

// Initialize goto area display system
export function initGotoAreaDisplay(mapData) {
    console.log("Initializing goto area display system");
    
    // Clean up existing labels
    cleanupGotoLabels();
    
    if (!mapData || !mapData.layers) {
        console.log("No map data available for goto areas");
        return;
    }
    
    // Find the goto layer
    const gotoLayer = mapData.layers.find(layer => layer.name === "goto");
    if (!gotoLayer || !gotoLayer.objects) {
        console.log("No goto layer found in map data");
        return;
    }
    
    console.log("Found goto layer with", gotoLayer.objects.length, "objects");
    
    // Create label data for each goto area
    gotoLabels = gotoLayer.objects
        .filter(obj => obj.name && obj.name.trim().length > 0)
        .map(obj => {
            const labelText = formatGotoName(obj.name);
            console.log("Creating goto label for:", obj.name, "->", labelText);
            
            return {
                name: obj.name,
                displayName: labelText,
                x: obj.x * scaleFactor + (obj.width * scaleFactor) / 2, // Center of goto area
                y: obj.y * scaleFactor + (obj.height * scaleFactor) / 2, // Center of goto area
                width: obj.width * scaleFactor,
                height: obj.height * scaleFactor,
                labelObject: null,
                isVisible: false,
                opacity: 0,
                animationOffset: Math.random() * Math.PI * 2, // Random start for animation
            };
        });
    
    console.log("Initialized", gotoLabels.length, "goto area labels");
    isGotoSystemActive = true;
}

// Format goto area names for display
function formatGotoName(name) {
    // Convert name to display format
    const formatted = name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    // Special cases for better display names
    const specialCases = {
        'Campus': 'CAMPUS',
        'Mensa': 'MENSA',
        'Klassenzimmer': 'KLASSENZIMMER',
        'Unternehmensausstellung': 'UNTERNEHMENSAUSSTELLUNG',
        'Almeria': 'ALMERIA',
    };
    
    return specialCases[formatted] || formatted.toUpperCase();
}

// Create floating label for a goto area
function createGotoLabel(labelData) {
    if (labelData.labelObject) return; // Already created
    
    const labelY = labelData.y - GOTO_CONFIG.labelHeight;
    
    // Create single label with enhanced styling
    labelData.labelObject = k.add([
        k.text(labelData.displayName, {
            size: GOTO_CONFIG.textSize,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffffff"), // White text
                outline: { 
                    width: 4, 
                    color: k.Color.fromHex("#8a2be2") // Purple outline for retro effect
                }
            }
        }),
        k.anchor("center"),
        k.pos(labelData.x, labelY),
        k.z(26), // Above map elements
        k.opacity(0),
        "goto-label"
    ]);
    
    console.log("Created goto label for:", labelData.name, "at", labelData.x, labelY);
}

// Remove floating label for a goto area
function removeGotoLabel(labelData) {
    if (labelData.labelObject) {
        k.destroy(labelData.labelObject);
        labelData.labelObject = null;
    }
    
    labelData.isVisible = false;
    labelData.opacity = 0;
}

// Update goto area display system
export function updateGotoAreaDisplay(player) {
    if (!isGotoSystemActive || !player || gotoLabels.length === 0) return;
    
    // Skip if player is in dialogue or frozen
    if (player.isInDialogue || player.isFrozen) return;
    
    const playerPos = player.worldPos();
    
    // Update each goto label
    for (const labelData of gotoLabels) {
        // Calculate distance from player to goto area center
        const distance = playerPos.dist(k.vec2(labelData.x, labelData.y));
        
        // Determine if label should be visible
        const shouldBeVisible = distance <= GOTO_CONFIG.displayRadius;
        
        // Handle visibility changes
        if (shouldBeVisible && !labelData.isVisible) {
            // Show label
            createGotoLabel(labelData);
            labelData.isVisible = true;
        } else if (!shouldBeVisible && labelData.isVisible) {
            // Hide label
            removeGotoLabel(labelData);
        }
        
        // Update opacity and animation for visible labels
        if (labelData.isVisible && labelData.labelObject) {
            // Calculate opacity based on distance
            let targetOpacity = 1;
            if (distance > GOTO_CONFIG.displayRadius - GOTO_CONFIG.fadeDistance) {
                const fadeProgress = (GOTO_CONFIG.displayRadius - distance) / GOTO_CONFIG.fadeDistance;
                targetOpacity = Math.max(0, Math.min(1, fadeProgress));
            }
            
            // Smooth opacity transition
            labelData.opacity = k.lerp(labelData.opacity, targetOpacity, k.dt() * 5);
            
            // Apply opacity to the label
            labelData.labelObject.opacity = labelData.opacity;
            
            // Floating animation
            labelData.animationOffset += k.dt() * GOTO_CONFIG.animationSpeed;
            const floatOffset = Math.sin(labelData.animationOffset) * 8; // 8 pixels up/down
            
            const baseY = labelData.y - GOTO_CONFIG.labelHeight;
            labelData.labelObject.pos.y = baseY + floatOffset;
            
            // Subtle scale animation for emphasis
            const scaleOffset = Math.sin(labelData.animationOffset * 0.5) * 0.05 + 1; // Slight scale variation
            labelData.labelObject.scale = k.vec2(scaleOffset, scaleOffset);
        }
    }
}

// Clean up all goto labels
export function cleanupGotoLabels() {
    console.log("Cleaning up goto area labels");
    
    for (const labelData of gotoLabels) {
        removeGotoLabel(labelData);
    }
    
    gotoLabels = [];
    
    // Destroy any remaining label objects
    k.destroyAll("goto-label");
    
    isGotoSystemActive = false;
}

// Get goto area information for debugging
export function getGotoAreaInfo() {
    return {
        isActive: isGotoSystemActive,
        labelCount: gotoLabels.length,
        visibleLabels: gotoLabels.filter(label => label.isVisible).length,
        labels: gotoLabels.map(label => ({
            name: label.name,
            displayName: label.displayName,
            isVisible: label.isVisible,
            opacity: label.opacity
        }))
    };
}

// Force show all goto labels (for debugging)
export function debugShowAllGotoLabels() {
    console.log("Debug: Showing all goto labels");
    
    for (const labelData of gotoLabels) {
        if (!labelData.isVisible) {
            createGotoLabel(labelData);
            labelData.isVisible = true;
        }
        
        if (labelData.labelObject) {
            labelData.opacity = 1;
            labelData.labelObject.opacity = 1;
        }
    }
}

// Force hide all goto labels (for debugging)
export function debugHideAllGotoLabels() {
    console.log("Debug: Hiding all goto labels");
    
    for (const labelData of gotoLabels) {
        removeGotoLabel(labelData);
    }
} 
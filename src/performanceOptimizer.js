// Performance Optimization System
// Handles lazy loading, viewport culling, and optimized rendering

import { k } from "./kaboomCtx.js";
import { getAllMaps, getAvailableMaps, mapMusic, music, scaleFactor } from "./constants.js";

// Performance configuration
const PERFORMANCE_CONFIG = {
    // Viewport culling
    CULLING_RADIUS: 800,
    COLLISION_CULLING_RADIUS: 600,
    
    // Lazy loading
    PRELOAD_DISTANCE: 1200, // Distance to start preloading adjacent maps
    
    // Rendering optimization
    MAX_OBJECTS_PER_FRAME: 50, // Maximum objects to process per frame
    FRAME_BUDGET_MS: 16, // Target frame time (60fps = 16.67ms)
    
    // Loading priorities
    PRIORITY_MAPS: ['campus'], // Maps to load immediately
    BACKGROUND_LOAD_DELAY: 100, // Delay between background loads (ms)
};

// Global state for performance optimization
const performanceState = {
    loadedMaps: new Set(),
    loadingMaps: new Set(),
    mapLoadQueue: [],
    isBackgroundLoading: false,
    currentMap: null,
    viewportObjects: new Map(), // Map of object types to visible objects
    lastCullingUpdate: 0,
    frameStartTime: 0,
};

// Expose performance state globally for other modules
window.performanceState = performanceState;

// Initialize performance-optimized map loading
export function initializePerformanceOptimizedMaps() {
    // console.log("🚀 Initializing performance-optimized map system...");
    
    // Load only essential maps immediately (campus)
    loadEssentialMaps();
    
    // Setup viewport culling system immediately
    setupViewportCulling();
    
    // DON'T start background loading automatically - wait for game to start
    // console.log("✅ Performance optimization system initialized - background loading will start after game begins");
}

// Load only essential maps for immediate gameplay
function loadEssentialMaps() {
    // console.log("📦 Loading essential maps...");
    
    const essentialMaps = PERFORMANCE_CONFIG.PRIORITY_MAPS;
    
    for (const mapName of essentialMaps) {
        loadMapAssets(mapName, true); // true = high priority
        performanceState.loadedMaps.add(mapName);
    }
    
    // console.log(`✅ Loaded ${essentialMaps.length} essential maps`);
}

// Start background loading (call this after the game actually starts)
export function startBackgroundLoading() {
    if (performanceState.isBackgroundLoading) {
        console.log("Background loading already active");
        return;
    }
    
    // console.log("🔄 Starting background map loading after game start...");
    
    // Start background loading after a delay to let the game settle
    setTimeout(() => {
        startBackgroundMapLoadingInternal();
    }, 2000); // 2 second delay after game starts
}

// Internal function to start background loading of remaining maps
function startBackgroundMapLoadingInternal() {
    if (performanceState.isBackgroundLoading) return;
    
    // console.log("🔄 Starting background map loading...");
    performanceState.isBackgroundLoading = true;
    
    const allMaps = getAllMaps();
    const remainingMaps = allMaps.filter(map => !performanceState.loadedMaps.has(map));
    
    // Add remaining maps to load queue
    performanceState.mapLoadQueue = [...remainingMaps];
    
    // Start loading maps one by one
    processMapLoadQueue();
}

// Process the map loading queue with delays to prevent blocking
function processMapLoadQueue() {
    if (performanceState.mapLoadQueue.length === 0) {
        // console.log("✅ Background map loading completed");
        performanceState.isBackgroundLoading = false;
        return;
    }
    
    const mapName = performanceState.mapLoadQueue.shift();
    
    // console.log(`🔄 Background loading: ${mapName} (${performanceState.mapLoadQueue.length} remaining)`);
    
    // Load map assets
    loadMapAssets(mapName, false); // false = low priority
    performanceState.loadedMaps.add(mapName);
    
    // Schedule next map load
    setTimeout(() => {
        processMapLoadQueue();
    }, PERFORMANCE_CONFIG.BACKGROUND_LOAD_DELAY);
}

// Load assets for a specific map
function loadMapAssets(mapName, highPriority = false) {
    try {
        // Load map sprite
        if (mapName.includes('ksb') || mapName.includes('companies/')) {
            loadLargeMapSprite(mapName);
        } else {
            k.loadSprite(mapName, `./maps/${mapName}.png`);
        }
        
        // Load foreground objects (if they exist)
        loadForegroundObjects(mapName);
        
        // Load map-specific music
        loadMapMusic(mapName);
        
        // Always setup scene immediately - no more deferring
        // This ensures scenes are available when player tries to enter them
        setupSceneForMap(mapName);
        
    } catch (error) {
        console.warn(`Failed to load assets for ${mapName}:`, error);
    }
}

// Async version of loadMapAssets for better control
async function loadMapAssetsAsync(mapName, highPriority = false) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`📦 Loading assets for ${mapName} (priority: ${highPriority ? 'high' : 'low'})`);
            
            // Load map sprite
            if (mapName.includes('ksb') || mapName.includes('companies/')) {
                loadLargeMapSprite(mapName);
            } else {
                k.loadSprite(mapName, `./maps/${mapName}.png`);
            }
            
            // Load foreground objects (if they exist)
            loadForegroundObjects(mapName);
            
            // Load map-specific music
            loadMapMusic(mapName);
            
            // Always setup scene immediately - no more deferring
            // This ensures scenes are available when player tries to enter them
            setupSceneForMap(mapName);
            
            // Wait a brief moment for assets to load
            setTimeout(() => {
                console.log(`✅ Assets loaded for ${mapName}`);
                resolve();
            }, 100);
            
        } catch (error) {
            console.warn(`Failed to load assets for ${mapName}:`, error);
            reject(error);
        }
    });
}

// Preload map tiles for large maps (without showing loading screen)
async function preloadMapTiles(mapName) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`🧩 Starting silent tile preload for ${mapName}`);
            
            // Import the tile loading function
            const { createTiledMap, loadMapTiles } = await import('./mapRenderingFix.js');
            
            // Create tiled map info
            const tiledMapInfo = createTiledMap(mapName, null);
            if (!tiledMapInfo) {
                console.log(`📋 Map ${mapName} doesn't need tiling, skipping tile preload`);
                resolve();
                return;
            }
            
            console.log(`🔧 Created tiled map info for ${mapName}, loading tiles silently...`);
            
            // Load tiles without showing loading screen (silent mode)
            await loadMapTiles(mapName, true);
            
            console.log(`✅ Tiles preloaded successfully for ${mapName}`);
            resolve();
            
        } catch (error) {
            console.warn(`⚠️ Failed to preload tiles for ${mapName}:`, error);
            resolve(); // Don't reject, just continue without tiles
        }
    });
}

// Show subtle notification that a company map is ready
function showMapReadyNotification(mapName) {
    try {
        // Only show notification for company maps
        if (!mapName.includes('companies/')) return;
        
        const friendlyName = mapName.replace('companies/', '').toUpperCase();
        console.log(`🎯 ${friendlyName} company map is now ready for instant access`);
        
        // Add a subtle visual indicator (small, non-intrusive)
        const notification = k.add([
            k.rect(200, 30, { radius: 15 }),
            k.color(0, 100, 0, 0.8), // Semi-transparent green
            k.pos(k.width() - 220, 20), // Top right corner
            k.fixed(),
            k.z(150),
            k.opacity(0),
            "preload-notification"
        ]);
        
        const notificationText = k.add([
            k.text(`${friendlyName} Ready`, {
                size: 14,
                font: "monospace"
            }),
            k.color(255, 255, 255),
            k.pos(k.width() - 120, 35),
            k.anchor("center"),
            k.fixed(),
            k.z(151),
            k.opacity(0),
            "preload-notification"
        ]);
        
        // Fade in and out animation
        k.tween(notification.opacity, 1, 0.5, (val) => notification.opacity = val);
        k.tween(notificationText.opacity, 1, 0.5, (val) => notificationText.opacity = val);
        
        // Remove after 3 seconds
        k.wait(3, () => {
            k.tween(notification.opacity, 0, 0.5, (val) => notification.opacity = val);
            k.tween(notificationText.opacity, 0, 0.5, (val) => notificationText.opacity = val);
            
            k.wait(0.5, () => {
                k.destroy(notification);
                k.destroy(notificationText);
            });
        });
        
    } catch (error) {
        console.warn("Failed to show map ready notification:", error);
    }
}

// Setup scene for a map (will be called from main.js)
function setupSceneForMap(mapName) {
    // This will be set by main.js
    if (window.setupScene) {
        window.setupScene(mapName, `./maps/${mapName}.json`, mapName);
    } else {
        console.warn(`setupScene function not available for ${mapName}, retrying in 100ms...`);
        // Retry after a short delay
        setTimeout(() => {
            if (window.setupScene) {
                console.log(`Retrying scene setup for ${mapName}...`);
                window.setupScene(mapName, `./maps/${mapName}.json`, mapName);
            } else {
                console.error(`Failed to setup scene for ${mapName} - setupScene function still not available`);
            }
        }, 100);
    }
}

// Load large map sprites with optimization
function loadLargeMapSprite(mapName) {
    const img = new Image();
    img.style.imageRendering = 'pixelated';
    img.style.imageRendering = '-moz-crisp-edges';
    img.style.imageRendering = 'crisp-edges';
    
    img.onload = () => {
        k.loadSprite(mapName, img.src);
    };
    
    img.onerror = () => {
        console.warn(`Failed to load large map image: ${mapName}`);
        k.loadSprite(mapName, `./maps/${mapName}.png`);
    };
    
    img.src = `./maps/${mapName}.png`;
}

// Load foreground objects for a map
function loadForegroundObjects(mapName) {
    const foregroundImg = new Image();
    foregroundImg.onload = () => {
        try {
            k.loadSprite(`${mapName}-ForegroundObjects`, `./maps/${mapName}-ForegroundObjects.png`);
        } catch (e) {
            // Silently fail - foreground objects are optional
        }
    };
    foregroundImg.onerror = () => {
        // Silently fail - foreground objects are optional
    };
    foregroundImg.src = `./maps/${mapName}-ForegroundObjects.png`;
}

// Load music for a map
function loadMapMusic(mapName) {
    try {
        const mapSpecificMusic = mapMusic[mapName] || music[Math.floor(Math.random() * music.length)];
        const musicFilePath = `./sounds/music/${encodeURIComponent(mapSpecificMusic)}.mp3`;
        k.loadSound(`bgm_${mapName}`, musicFilePath);
    } catch (error) {
        console.warn(`Failed to load music for ${mapName}:`, error);
    }
}

// Setup viewport culling system
function setupViewportCulling() {
    // console.log("🎯 Setting up viewport culling system...");
    
    // Initialize viewport object tracking
    performanceState.viewportObjects.set('boundaries', []);
    performanceState.viewportObjects.set('collisions', []);
    performanceState.viewportObjects.set('decorations', []);
    performanceState.viewportObjects.set('npcs', []);
    
    // Setup culling update loop
    k.onUpdate(() => {
        updateViewportCulling();
    });
}

// Update viewport culling (called every frame)
function updateViewportCulling() {
    const now = performance.now();
    
    // Limit culling updates to maintain performance
    if (now - performanceState.lastCullingUpdate < 100) { // Update every 100ms
        return;
    }
    
    performanceState.frameStartTime = now;
    performanceState.lastCullingUpdate = now;
    
    // Get player position for culling calculations
    const players = k.get("player");
    if (players.length === 0) return;
    
    const playerPos = players[0].worldPos();
    
    // Cull different object types
    cullBoundaries(playerPos);
    cullCollisions(playerPos);
    cullDecorations(playerPos);
    
    // Check frame budget
    const frameTime = performance.now() - performanceState.frameStartTime;
    if (frameTime > PERFORMANCE_CONFIG.FRAME_BUDGET_MS) {
        console.warn(`⚠️ Culling exceeded frame budget: ${frameTime.toFixed(2)}ms`);
    }
}

// Cull boundary objects based on distance
function cullBoundaries(playerPos) {
    const boundaries = k.get("boundary");
    let visibleCount = 0;
    let culledCount = 0;
    
    for (const boundary of boundaries) {
        const distance = playerPos.dist(boundary.worldPos());
        
        if (distance <= PERFORMANCE_CONFIG.CULLING_RADIUS) {
            if (!boundary.visible) {
                boundary.visible = true;
                visibleCount++;
            }
        } else {
            if (boundary.visible) {
                boundary.visible = false;
                culledCount++;
            }
        }
    }
    
    if (visibleCount > 0 || culledCount > 0) {
        // console.log(`🎯 Boundaries: +${visibleCount} visible, -${culledCount} culled`);
    }
}

// Cull collision objects based on distance
function cullCollisions(playerPos) {
    const collisions = k.get("collision");
    let processedCount = 0;
    
    for (const collision of collisions) {
        if (processedCount >= PERFORMANCE_CONFIG.MAX_OBJECTS_PER_FRAME) break;
        
        const distance = playerPos.dist(collision.worldPos());
        collision.visible = distance <= PERFORMANCE_CONFIG.COLLISION_CULLING_RADIUS;
        
        processedCount++;
    }
}

// Cull decoration objects based on distance
function cullDecorations(playerPos) {
    const decorations = k.get("decoration");
    
    for (const decoration of decorations) {
        const distance = playerPos.dist(decoration.worldPos());
        decoration.visible = distance <= PERFORMANCE_CONFIG.CULLING_RADIUS;
    }
}

// Enhanced preloading system with company map prioritization
export function checkMapPreloading(currentMapName, playerPos) {
    // Skip if background loading is still active
    if (performanceState.isBackgroundLoading) {
        return;
    }
    
    // Define map adjacency relationships
    const mapAdjacency = {
        'campus': ['mensa', 'almeria', 'klassenzimmer', 'unternehmensausstellung'],
        'mensa': ['campus'],
        'almeria': ['campus'],
        'klassenzimmer': ['campus'],
        'unternehmensausstellung': ['campus', 'companies/ksb'],
        'companies/ksb': ['unternehmensausstellung'],
    };
    
    const adjacentMaps = mapAdjacency[currentMapName] || [];
    
    // Special handling for unternehmensausstellung - prioritize KSB preloading
    if (currentMapName === 'unternehmensausstellung') {
        // Immediately start preloading KSB map if not already loaded
        if (!performanceState.loadedMaps.has('companies/ksb') && 
            !performanceState.loadingMaps.has('companies/ksb')) {
            
            console.log(`🎯 Priority preloading KSB map for company exhibition`);
            preloadCompanyMap('companies/ksb');
            return; // Exit early to focus on KSB preloading
        }
    }
    
    // Check if player is near map boundaries (simplified approach)
    // In a real implementation, you'd check actual map boundaries
    const mapBoundaryDistance = PERFORMANCE_CONFIG.PRELOAD_DISTANCE;
    
    for (const adjacentMap of adjacentMaps) {
        // Only preload if not already loaded and not currently loading
        if (!performanceState.loadedMaps.has(adjacentMap) && 
            !performanceState.loadingMaps.has(adjacentMap)) {
            
            // Add to loading set to prevent duplicate loading
            performanceState.loadingMaps.add(adjacentMap);
            
            console.log(`🔄 Preloading adjacent map: ${adjacentMap} from ${currentMapName}`);
            
            // Load the adjacent map with low priority
            loadMapAssets(adjacentMap, false);
            performanceState.loadedMaps.add(adjacentMap);
            
            // Remove from loading set
            performanceState.loadingMaps.delete(adjacentMap);
            
            // Only preload one map at a time to avoid performance impact
            break;
        }
    }
}

// Get performance statistics
export function getPerformanceStats() {
    return {
        loadedMaps: performanceState.loadedMaps.size,
        totalMaps: getAllMaps().length,
        isBackgroundLoading: performanceState.isBackgroundLoading,
        queueLength: performanceState.mapLoadQueue.length,
        viewportObjects: Object.fromEntries(
            Array.from(performanceState.viewportObjects.entries()).map(([key, value]) => [key, value.length])
        )
    };
}

// Debug function to log performance stats
export function logPerformanceStats() {
    const stats = getPerformanceStats();
    console.group("📊 Performance Statistics");
    console.log(`Maps loaded: ${stats.loadedMaps}/${stats.totalMaps}`);
    console.log(`Background loading: ${stats.isBackgroundLoading ? 'Active' : 'Inactive'}`);
    console.log(`Queue length: ${stats.queueLength}`);
    console.log(`Viewport objects:`, stats.viewportObjects);
    console.groupEnd();
}

// Enhanced company map preloading with tile prioritization
export function preloadCompanyMap(mapName) {
    if (performanceState.loadedMaps.has(mapName)) {
        console.log(`✅ Company map ${mapName} already loaded`);
        return Promise.resolve();
    }
    
    if (performanceState.loadingMaps.has(mapName)) {
        console.log(`🔄 Company map ${mapName} already loading`);
        return Promise.resolve();
    }
    
    console.log(`🎯 Starting enhanced preload for company map: ${mapName}`);
    
    // Add to loading set
    performanceState.loadingMaps.add(mapName);
    
    // Create a promise for the preloading process
    const preloadPromise = new Promise(async (resolve) => {
        try {
            // Load basic map assets first
            await loadMapAssetsAsync(mapName, true); // High priority for company maps
            
            // For company maps, also preload tiles if it's a large map
            if (mapName.includes('ksb') || mapName.includes('companies/')) {
                console.log(`🔧 Preloading tiles for large company map: ${mapName}`);
                await preloadMapTiles(mapName);
            }
            
            // Mark as loaded
            performanceState.loadedMaps.add(mapName);
            performanceState.loadingMaps.delete(mapName);
            
            // Show subtle notification that map is ready
            showMapReadyNotification(mapName);
            
            console.log(`✅ Company map ${mapName} fully preloaded and ready`);
            resolve();
            
        } catch (error) {
            console.warn(`⚠️ Failed to preload company map ${mapName}:`, error);
            performanceState.loadingMaps.delete(mapName);
            resolve(); // Still resolve to prevent blocking
        }
    });
    
    return preloadPromise;
}

// Force load a specific map (for immediate access)
export function forceLoadMap(mapName) {
    if (performanceState.loadedMaps.has(mapName)) {
        console.log(`✅ Map ${mapName} already loaded`);
        return Promise.resolve();
    }
    
    // console.log(`⚡ Force loading map: ${mapName}`);
    
    return new Promise((resolve) => {
        loadMapAssets(mapName, true);
        performanceState.loadedMaps.add(mapName);
        
        // Remove from queue if it was there
        const queueIndex = performanceState.mapLoadQueue.indexOf(mapName);
        if (queueIndex !== -1) {
            performanceState.mapLoadQueue.splice(queueIndex, 1);
        }
        
        resolve();
    });
}

// Cleanup function for when leaving a map
export function cleanupMapResources(mapName) {
    console.log(`🧹 Cleaning up resources for map: ${mapName}`);
    
    try {
        // Update current map state
        performanceState.currentMap = null;
        
        // Clear viewport object tracking for the current map
        performanceState.viewportObjects.clear();
        performanceState.viewportObjects.set('boundaries', []);
        performanceState.viewportObjects.set('collisions', []);
        performanceState.viewportObjects.set('decorations', []);
        performanceState.viewportObjects.set('npcs', []);
        
        // Stop any map-specific background music
        try {
            const bgmSound = k.get(`bgm_${mapName}`);
            if (bgmSound && bgmSound.length > 0) {
                bgmSound.forEach(sound => {
                    if (sound.stop) sound.stop();
                });
            }
        } catch (error) {
            // Silently handle music cleanup errors
        }
        
        // Clean up map-specific cached data
        // Note: We keep the map loaded in memory for quick re-entry
        // but clean up runtime objects and state
        
        // Reset culling timers
        performanceState.lastCullingUpdate = 0;
        performanceState.frameStartTime = 0;
        
        // Force garbage collection hint (if available)
        if (window.gc && typeof window.gc === 'function') {
            // Only available in development/debug environments
            setTimeout(() => {
                try {
                    window.gc();
                } catch (e) {
                    // Silently fail if gc is not available
                }
            }, 100);
        }
        
        console.log(`✅ Cleanup completed for ${mapName}`);
        
    } catch (error) {
        console.warn(`⚠️ Error during cleanup for ${mapName}:`, error);
    }
}

// Set the current map (call this when entering a new scene)
export function setCurrentMap(mapName) {
    performanceState.currentMap = mapName;
    console.log(`📍 Current map set to: ${mapName}`);
}

// Get the current map
export function getCurrentMap() {
    return performanceState.currentMap;
} 
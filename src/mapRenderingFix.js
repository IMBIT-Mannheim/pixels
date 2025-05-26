import { k } from './kaboomCtx';
import { scaleFactor } from './constants';

// Map rendering configuration
const RENDERING_CONFIG = {
    // Prevent texture filtering/blurring
    pixelPerfect: true,
    // Camera bounds buffer
    cameraBoundsBuffer: 50,
    // Minimum zoom level to prevent over-scaling
    minZoom: 0.5,
    maxZoom: 2.0,
    // Kaboom.js texture size limit
    maxTextureSize: 2048
};

// Store map dimensions for camera bounds
let currentMapBounds = {
    width: 0,
    height: 0,
    initialized: false
};

// Store tiled map information
let tiledMapInfo = {
    tiles: [],
    tileSize: 2048,
    isActive: false
};

// Loading screen elements
let loadingScreen = {
    background: null,
    progressBar: null,
    progressFill: null,
    loadingText: null,
    isActive: false
};

// Initialize map rendering fixes
export function initMapRendering(mapSprite, mapData = null) {
    console.log("Initializing map rendering fixes for:", mapSprite);
    console.log("Map data received:", mapData);
    
    // Note: setPixelDensity doesn't exist in this Kaboom version, so we'll skip it
    // k.setPixelDensity(1);
    
    // Get map dimensions with better detection for larger maps
    if (mapData && mapData.width && mapData.height) {
        currentMapBounds.width = mapData.width * scaleFactor;
        currentMapBounds.height = mapData.height * scaleFactor;
        console.log("Using mapData dimensions:", mapData.width, "x", mapData.height);
    } else {
        // Fallback: estimate from sprite if available
        try {
            const sprite = k.getSprite(mapSprite);
            console.log("Sprite info:", sprite);
            
            if (sprite && sprite.width && sprite.height) {
                currentMapBounds.width = sprite.width * scaleFactor;
                currentMapBounds.height = sprite.height * scaleFactor;
                console.log("Using sprite dimensions:", sprite.width, "x", sprite.height);
            } else {
                // Special handling for KSB map and other large maps
                if (mapSprite.includes('ksb')) {
                    currentMapBounds.width = 3200 * scaleFactor; // Larger dimensions for KSB
                    currentMapBounds.height = 2400 * scaleFactor;
                    console.log("Using KSB-specific dimensions");
                } else {
                    // Default fallback dimensions
                    currentMapBounds.width = 2000 * scaleFactor;
                    currentMapBounds.height = 1500 * scaleFactor;
                    console.log("Using default fallback dimensions");
                }
            }
        } catch (error) {
            console.warn("Could not get sprite dimensions, using fallback:", error);
            // Special handling for KSB map
            if (mapSprite.includes('ksb')) {
                currentMapBounds.width = 3200 * scaleFactor;
                currentMapBounds.height = 2400 * scaleFactor;
                console.log("Using KSB-specific fallback dimensions");
            } else {
                currentMapBounds.width = 2000 * scaleFactor;
                currentMapBounds.height = 1500 * scaleFactor;
                console.log("Using default fallback dimensions");
            }
        }
    }
    
    currentMapBounds.initialized = true;
    console.log("Final map bounds set to:", currentMapBounds);
    
    // Apply rendering fixes
    applyRenderingFixes();
}

// Apply various rendering fixes
function applyRenderingFixes() {
    // Fix 1: Ensure crisp pixel rendering
    const canvas = k.canvas;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
            // Additional fixes for texture stretching
            ctx.imageSmoothingQuality = 'low';
            if (ctx.webkitImageSmoothingQuality) {
                ctx.webkitImageSmoothingQuality = 'low';
            }
        }
    }
    
    // Fix 2: Set proper camera constraints
    setupCameraConstraints();
    
    // Fix 3: Monitor and fix camera position
    setupCameraMonitoring();
    
    // Fix 4: Apply additional texture fixes
    applyTextureStrechingFix();
}

// New function to specifically handle texture stretching
function applyTextureStrechingFix() {
    // Force a canvas redraw to fix any existing stretching
    k.wait(0.1, () => {
        const canvas = k.canvas;
        if (canvas) {
            // Force canvas to recalculate its rendering
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            
            // Temporarily change size to force redraw
            canvas.width = originalWidth + 1;
            canvas.height = originalHeight + 1;
            
            // Restore original size
            k.wait(0.05, () => {
                canvas.width = originalWidth;
                canvas.height = originalHeight;
                
                // Reapply context settings
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;
                }
            });
        }
    });
}

// Setup camera constraints to prevent rendering issues
function setupCameraConstraints() {
    if (!currentMapBounds.initialized) return;
    
    const screenWidth = k.width();
    const screenHeight = k.height();
    
    // Add buffer to prevent edge rendering issues
    const buffer = RENDERING_CONFIG.cameraBoundsBuffer;
    
    // Calculate camera bounds with buffer
    const minX = screenWidth / 2 + buffer;
    const maxX = currentMapBounds.width - screenWidth / 2 - buffer;
    const minY = screenHeight / 2 + buffer;
    const maxY = currentMapBounds.height - screenHeight / 2 - buffer;
    
    // Ensure bounds are valid (for very small maps)
    const validMinX = Math.min(minX, currentMapBounds.width / 2);
    const validMaxX = Math.max(maxX, currentMapBounds.width / 2);
    const validMinY = Math.min(minY, currentMapBounds.height / 2);
    const validMaxY = Math.max(maxY, currentMapBounds.height / 2);
    
    console.log("Camera constraints with buffer:", { 
        minX: validMinX, 
        maxX: validMaxX, 
        minY: validMinY, 
        maxY: validMaxY,
        mapWidth: currentMapBounds.width,
        mapHeight: currentMapBounds.height,
        screenWidth,
        screenHeight
    });
    
    // Store bounds for monitoring
    window.cameraBounds = { 
        minX: validMinX, 
        maxX: validMaxX, 
        minY: validMinY, 
        maxY: validMaxY 
    };
}

// Monitor camera position and fix issues
function setupCameraMonitoring() {
    k.onUpdate(() => {
        try {
            if (!currentMapBounds.initialized || !window.cameraBounds) return;
            
            const camPos = k.camPos();
            if (!camPos) return; // Safety check
            
            const { minX, maxX, minY, maxY } = window.cameraBounds;
            
            let needsUpdate = false;
            let newX = camPos.x;
            let newY = camPos.y;
            
            // Constrain camera X position
            if (camPos.x < minX) {
                newX = minX;
                needsUpdate = true;
            } else if (camPos.x > maxX) {
                newX = maxX;
                needsUpdate = true;
            }
            
            // Constrain camera Y position
            if (camPos.y < minY) {
                newY = minY;
                needsUpdate = true;
            } else if (camPos.y > maxY) {
                newY = maxY;
                needsUpdate = true;
            }
            
            // Update camera position if needed
            if (needsUpdate) {
                k.camPos(newX, newY);
            }
            
            // Ensure proper zoom level
            const currentZoom = k.camScale();
            if (currentZoom && (currentZoom.x < RENDERING_CONFIG.minZoom || currentZoom.x > RENDERING_CONFIG.maxZoom)) {
                const clampedZoom = Math.max(RENDERING_CONFIG.minZoom, 
                                    Math.min(RENDERING_CONFIG.maxZoom, currentZoom.x));
                k.camScale(clampedZoom, clampedZoom);
            }
        } catch (error) {
            console.warn("Error in camera monitoring:", error);
        }
    });
}

// Fix texture rendering for a specific sprite
export function fixSpriteRendering(sprite) {
    if (!sprite) return;
    
    // Ensure pixel-perfect rendering
    sprite.smooth = false;
    
    // Fix positioning to pixel boundaries
    if (sprite.pos) {
        sprite.pos.x = Math.round(sprite.pos.x);
        sprite.pos.y = Math.round(sprite.pos.y);
    }
}

// Force reload a map sprite with pixel-perfect settings
export function reloadMapSprite(mapName) {
    console.log("Reloading map sprite with pixel-perfect settings:", mapName);
    
    try {
        // Remove existing sprite from cache if it exists
        if (k.assets && k.assets.sprites && k.assets.sprites[mapName]) {
            delete k.assets.sprites[mapName];
            console.log("Removed existing sprite from cache:", mapName);
        }
        
        // Create a new image element with pixel-perfect settings
        const img = new Image();
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = '-moz-crisp-edges';
        img.style.imageRendering = 'crisp-edges';
        
        // Load the sprite with explicit pixel-perfect settings
        img.onload = () => {
            console.log("Image loaded, creating pixel-perfect sprite:", mapName);
            
            // Force canvas context to use pixel-perfect rendering
            const canvas = k.canvas;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;
                }
            }
            
            // Reload the sprite in Kaboom with the pixel-perfect image
            k.loadSprite(mapName, img.src);
            
            // Wait a bit then try to update any existing map objects
            setTimeout(() => {
                const mapObjects = k.get("*").filter(obj => 
                    obj.sprite && obj.sprite === mapName
                );
                
                mapObjects.forEach(mapObj => {
                    console.log("Updating map object with new sprite");
                    mapObj.smooth = false;
                    
                    // Force the object to re-render
                    if (mapObj.pos) {
                        const originalPos = mapObj.pos.clone();
                        mapObj.pos.x += 0.1;
                        setTimeout(() => {
                            mapObj.pos = originalPos;
                        }, 10);
                    }
                });
            }, 100);
        };
        
        img.onerror = (error) => {
            console.error("Failed to reload map sprite:", mapName, error);
        };
        
        img.src = `./maps/${mapName}.png`;
        
    } catch (error) {
        console.error("Error reloading map sprite:", mapName, error);
    }
}

// Reset camera to safe position
export function resetCameraToSafePosition(player = null) {
    if (!currentMapBounds.initialized) return;
    
    let targetX, targetY;
    
    // Try to get player if not provided
    if (!player) {
        try {
            const players = k.get("player");
            if (players && players.length > 0) {
                player = players[0];
            }
        } catch (error) {
            // Player not available, that's fine
        }
    }
    
    if (player && player.pos) {
        // Center on player
        targetX = player.pos.x;
        targetY = player.pos.y;
    } else {
        // Center on map
        targetX = currentMapBounds.width / 2;
        targetY = currentMapBounds.height / 2;
    }
    
    // Apply constraints
    if (window.cameraBounds) {
        const { minX, maxX, minY, maxY } = window.cameraBounds;
        targetX = Math.max(minX, Math.min(maxX, targetX));
        targetY = Math.max(minY, Math.min(maxY, targetY));
    }
    
    k.camPos(targetX, targetY);
    k.camScale(1, 1); // Reset zoom
    
    console.log("Camera reset to safe position:", targetX, targetY);
}

// Handle window resize to update camera bounds
export function handleWindowResize() {
    if (currentMapBounds.initialized) {
        setupCameraConstraints();
        resetCameraToSafePosition();
    }
}

// Clean up rendering fixes
export function cleanupMapRendering() {
    currentMapBounds = {
        width: 0,
        height: 0,
        initialized: false
    };
    
    if (window.cameraBounds) {
        delete window.cameraBounds;
    }
    
    console.log("Map rendering cleanup completed");
}

// Emergency fix for rendering issues
export function emergencyRenderingFix() {
    console.log("Applying emergency rendering fix...");
    
    // Reset camera
    k.camPos(k.width() / 2, k.height() / 2);
    k.camScale(1, 1);
    
    // Force canvas refresh with more aggressive approach
    const canvas = k.canvas;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Clear and reset context
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.save();
            ctx.restore();
        }
    }
    
    // Trigger a redraw
    k.wait(0.1, () => {
        if (currentMapBounds.initialized) {
            resetCameraToSafePosition();
        }
    });
}

// Specific fix for KSB map rendering issues
export function fixKSBMapRendering() {
    console.log("Applying KSB-specific rendering fix...");
    
    // Step 1: Reload the KSB sprite with pixel-perfect settings
    reloadMapSprite("companies/ksb");
    
    // Force recalculate bounds for KSB
    if (currentMapBounds.initialized) {
        currentMapBounds.width = 3200 * scaleFactor;
        currentMapBounds.height = 2400 * scaleFactor;
        setupCameraConstraints();
    }
    
    // Apply aggressive canvas fixes
    const canvas = k.canvas;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            console.log("Applying aggressive canvas fixes for KSB map...");
            
            // Force pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
            // Set transform to identity to prevent stretching
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Additional fixes for texture stretching
            if (ctx.imageSmoothingQuality) {
                ctx.imageSmoothingQuality = 'low';
            }
            
            // Force canvas to recalculate its internal state
            const originalWidth = canvas.width;
            const originalHeight = canvas.height;
            
            // Temporarily resize to force redraw
            canvas.width = originalWidth + 1;
            canvas.height = originalHeight + 1;
            
            // Restore size and reapply settings
            setTimeout(() => {
                canvas.width = originalWidth;
                canvas.height = originalHeight;
                
                const newCtx = canvas.getContext('2d');
                if (newCtx) {
                    newCtx.imageSmoothingEnabled = false;
                    newCtx.webkitImageSmoothingEnabled = false;
                    newCtx.mozImageSmoothingEnabled = false;
                    newCtx.msImageSmoothingEnabled = false;
                    newCtx.setTransform(1, 0, 0, 1, 0, 0);
                }
            }, 50);
        }
    }
    
    // Reset camera to center of map
    const centerX = (currentMapBounds.width / 2);
    const centerY = (currentMapBounds.height / 2);
    
    // Apply camera constraints
    if (window.cameraBounds) {
        const { minX, maxX, minY, maxY } = window.cameraBounds;
        const constrainedX = Math.max(minX, Math.min(maxX, centerX));
        const constrainedY = Math.max(minY, Math.min(maxY, centerY));
        k.camPos(constrainedX, constrainedY);
    } else {
        k.camPos(centerX, centerY);
    }
    
    k.camScale(1, 1);
    
    // Force a complete redraw after a short delay
    k.wait(0.1, () => {
        // Try to force all sprites to re-render
        const allSprites = k.get("*").filter(obj => obj.sprite);
        allSprites.forEach(sprite => {
            if (sprite.pos) {
                // Slightly move and restore position to force redraw
                const originalPos = sprite.pos.clone();
                sprite.pos.x += 0.1;
                k.wait(0.01, () => {
                    sprite.pos = originalPos;
                });
            }
        });
    });
    
    console.log("KSB fix applied - camera positioned at:", k.camPos());
    console.log("Canvas dimensions:", canvas ? `${canvas.width}x${canvas.height}` : "Canvas not found");
    console.log("Map bounds:", currentMapBounds);
}

// Force tiled rendering for specific maps that are known to be large
export function shouldUseTiledRendering(mapSprite) {
    // List of maps that should always use tiled rendering
    const forceTiledMaps = [
        'companies/ksb',
        'ksb',
    ];
    
    // Check if this map is in the force list
    const shouldForce = forceTiledMaps.some(forcedMap => 
        mapSprite.includes(forcedMap) || forcedMap.includes(mapSprite)
    );
    
    if (shouldForce) {
        console.log(`Map ${mapSprite} is in forced tiling list`);
        return true;
    }
    
    // Check if it's any company map
    if (mapSprite.includes('companies/')) {
        console.log(`Map ${mapSprite} is a company map, forcing tiled rendering`);
        return true;
    }
    
    return false;
}

// Create a tiled map system for large maps that exceed Kaboom's texture limits
export function createTiledMap(mapSprite, mapData = null) {
    console.log("Creating tiled map system for:", mapSprite);
    
    // Check if this map should be forced to use tiling
    const forceTiling = shouldUseTiledRendering(mapSprite);
    
    // Determine map dimensions
    let mapWidth, mapHeight;
    let needsTiling = forceTiling;
    
    // First, try to get actual image dimensions
    try {
        const img = new Image();
        img.src = `./maps/${mapSprite}.png`;
        
        // If image is already loaded (cached), we can get dimensions immediately
        if (img.complete && img.naturalWidth > 0) {
            mapWidth = img.naturalWidth;
            mapHeight = img.naturalHeight;
            console.log("Got actual image dimensions:", mapWidth, "x", mapHeight);
        }
    } catch (error) {
        console.log("Could not get actual image dimensions, using fallback");
    }
    
    // If we couldn't get actual dimensions, use fallback logic
    if (!mapWidth || !mapHeight) {
        if (mapData && mapData.width && mapData.height) {
            mapWidth = mapData.width;
            mapHeight = mapData.height;
            console.log("Got dimensions from mapData:", mapWidth, "x", mapHeight);
        } else {
            // Fallback based on known map sizes - be more aggressive for company maps
            if (mapSprite.includes('ksb') || mapSprite.includes('companies/ksb')) {
                mapWidth = 3200;
                mapHeight = 2400;
                needsTiling = true; // Force tiling for KSB
                console.log("Using KSB-specific dimensions (forced tiling):", mapWidth, "x", mapHeight);
            } else if (mapSprite.includes('companies/')) {
                // Assume other company maps are also large
                mapWidth = 2500;
                mapHeight = 2000;
                needsTiling = true; // Force tiling for company maps
                console.log("Using company map dimensions (forced tiling):", mapWidth, "x", mapHeight);
            } else {
                // Default dimensions for regular maps
                mapWidth = 2000;
                mapHeight = 1500;
                console.log("Using default dimensions:", mapWidth, "x", mapHeight);
            }
        }
    }
    
    console.log("Final map dimensions:", mapWidth, "x", mapHeight);
    console.log("Texture size limit:", RENDERING_CONFIG.maxTextureSize);
    console.log("Force tiling:", needsTiling);
    
    // Check if map exceeds texture limits OR if we've forced tiling
    const exceedsLimits = mapWidth > RENDERING_CONFIG.maxTextureSize || mapHeight > RENDERING_CONFIG.maxTextureSize;
    
    if (!exceedsLimits && !needsTiling) {
        console.log("Map is within texture limits and no forced tiling, using normal rendering");
        return null; // Use normal rendering
    }
    
    if (needsTiling) {
        console.log("Map requires forced tiling (company map), creating tiled system");
    } else {
        console.log("Map exceeds texture limits, creating tiled system");
    }
    
    // Calculate tile grid
    const tilesX = Math.ceil(mapWidth / RENDERING_CONFIG.maxTextureSize);
    const tilesY = Math.ceil(mapHeight / RENDERING_CONFIG.maxTextureSize);
    
    console.log("Tile grid:", tilesX, "x", tilesY, "tiles");
    
    // Create tile information
    const tiles = [];
    for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
            const tileX = x * RENDERING_CONFIG.maxTextureSize;
            const tileY = y * RENDERING_CONFIG.maxTextureSize;
            const tileWidth = Math.min(RENDERING_CONFIG.maxTextureSize, mapWidth - tileX);
            const tileHeight = Math.min(RENDERING_CONFIG.maxTextureSize, mapHeight - tileY);
            
            tiles.push({
                x: tileX,
                y: tileY,
                width: tileWidth,
                height: tileHeight,
                tileIndex: y * tilesX + x,
                gameObject: null,
                loaded: false
            });
            
            console.log(`Tile ${y * tilesX + x}: ${tileWidth}x${tileHeight} at (${tileX}, ${tileY})`);
        }
    }
    
    tiledMapInfo = {
        tiles,
        tileSize: RENDERING_CONFIG.maxTextureSize,
        isActive: true,
        mapSprite,
        mapWidth,
        mapHeight,
        tilesX,
        tilesY
    };
    
    console.log("Tiled map info created:", tiledMapInfo);
    return tiledMapInfo;
}

// Load and create tile sprites using canvas manipulation
export function loadMapTiles(mapSprite) {
    if (!tiledMapInfo.isActive) return Promise.resolve();
    
    console.log("Loading map tiles for:", mapSprite);
    
    // Create loading screen
    createLoadingScreen();
    updateLoadingProgress(0, tiledMapInfo.tiles.length + 1, "PREPARING MAP IMAGE...");
    
    return new Promise((resolve, reject) => {
        // Create an image element to load the full map
        const fullMapImage = new Image();
        fullMapImage.crossOrigin = "anonymous";
        
        fullMapImage.onload = () => {
            console.log("Full map image loaded, creating tiles...");
            console.log("Image dimensions:", fullMapImage.width, "x", fullMapImage.height);
            
            updateLoadingProgress(1, tiledMapInfo.tiles.length + 1, "CREATING MAP TILES...");
            
            try {
                // Create a canvas to extract tiles
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    console.error("Failed to get canvas context");
                    removeLoadingScreen();
                    reject(new Error("Canvas context not available"));
                    return;
                }
                
                // Disable smoothing for pixel-perfect extraction
                ctx.imageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                
                let tilesLoaded = 0;
                const totalTiles = tiledMapInfo.tiles.length;
                
                // Process tiles with a small delay to allow UI updates
                const processTile = (index) => {
                    if (index >= totalTiles) {
                        console.log("All tiles loaded successfully");
                        updateLoadingProgress(totalTiles + 1, totalTiles + 1, "TILES READY!");
                        
                        // Small delay before resolving to show completion
                        setTimeout(() => {
                            resolve();
                        }, 200);
                        return;
                    }
                    
                    const tile = tiledMapInfo.tiles[index];
                    
                    try {
                        // Update progress
                        updateLoadingProgress(index + 1, totalTiles + 1, `PROCESSING TILE ${index + 1}/${totalTiles}...`);
                        
                        // Set canvas size to actual tile size
                        canvas.width = tile.width;
                        canvas.height = tile.height;
                        
                        // Clear canvas
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw the portion of the full image for this tile
                        ctx.drawImage(
                            fullMapImage,
                            tile.x, tile.y, tile.width, tile.height, // Source rectangle
                            0, 0, tile.width, tile.height // Destination rectangle
                        );
                        
                        // Convert canvas to data URL
                        const tileDataURL = canvas.toDataURL('image/png');
                        
                        // Load this tile as a sprite in Kaboom
                        const tileName = `${mapSprite}_tile_${index}`;
                        
                        // Use a promise-based approach for loading
                        k.loadSprite(tileName, tileDataURL);
                        
                        tile.loaded = true;
                        tile.spriteName = tileName;
                        tilesLoaded++;
                        
                        console.log(`Loaded tile ${index + 1}/${totalTiles}: ${tile.width}x${tile.height} at (${tile.x}, ${tile.y})`);
                        
                        // Process next tile with a small delay for smooth animation
                        setTimeout(() => processTile(index + 1), 50);
                        
                    } catch (error) {
                        console.error(`Error loading tile ${index}:`, error);
                        removeLoadingScreen();
                        reject(error);
                    }
                };
                
                // Start processing tiles
                processTile(0);
                
            } catch (error) {
                console.error("Error in tile creation process:", error);
                removeLoadingScreen();
                reject(error);
            }
        };
        
        fullMapImage.onerror = (error) => {
            console.error("Failed to load full map image:", error);
            console.error("Image src:", fullMapImage.src);
            removeLoadingScreen();
            reject(new Error("Failed to load map image"));
        };
        
        const imagePath = `./maps/${mapSprite}.png`;
        console.log("Loading image from:", imagePath);
        fullMapImage.src = imagePath;
    });
}

// Create tile game objects in the scene
export function createTileGameObjects() {
    if (!tiledMapInfo.isActive) return [];
    
    console.log("Creating tile game objects...");
    
    const tileObjects = [];
    
    tiledMapInfo.tiles.forEach((tile) => {
        if (tile.loaded && tile.spriteName) {
            // Create game object for this tile
            const tileObj = k.add([
                k.sprite(tile.spriteName),
                k.pos(tile.x * scaleFactor, tile.y * scaleFactor),
                k.scale(scaleFactor),
                k.z(0), // Background layer
                "map-tile"
            ]);
            
            // Apply pixel-perfect rendering
            tileObj.smooth = false;
            
            tile.gameObject = tileObj;
            tileObjects.push(tileObj);
        }
    });
    
    console.log(`Created ${tileObjects.length} tile game objects`);
    return tileObjects;
}

// Clean up tiled map system
export function cleanupTiledMap() {
    if (tiledMapInfo.isActive) {
        console.log("Cleaning up tiled map system");
        
        // Destroy all tile game objects
        k.destroyAll("map-tile");
        
        // Reset tiled map info
        tiledMapInfo = {
            tiles: [],
            tileSize: 2048,
            isActive: false
        };
    }
}

// Create loading screen for tile loading
export function createLoadingScreen() {
    if (loadingScreen.isActive) return;
    
    console.log("Creating loading screen for tile loading...");
    
    const screenWidth = k.width();
    const screenHeight = k.height();
    
    // Create semi-transparent background
    loadingScreen.background = k.add([
        k.rect(screenWidth, screenHeight),
        k.pos(0, 0),
        k.color(k.Color.fromHex("#311047")),
        k.opacity(0.9),
        k.fixed(),
        k.z(1000),
        "loading-screen"
    ]);
    
    // Create loading text
    loadingScreen.loadingText = k.add([
        k.text("LOADING HIGH QUALITY MAP...", {
            size: 32,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffffff"),
                outline: { width: 2, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 - 60),
        k.fixed(),
        k.z(1001),
        "loading-screen"
    ]);
    
    // Create progress bar background
    const progressBarWidth = 400;
    const progressBarHeight = 20;
    
    loadingScreen.progressBar = k.add([
        k.rect(progressBarWidth, progressBarHeight),
        k.pos(screenWidth / 2 - progressBarWidth / 2, screenHeight / 2),
        k.color(k.Color.fromHex("#444444")),
        k.outline(2, k.Color.fromHex("#ffffff")),
        k.fixed(),
        k.z(1001),
        "loading-screen"
    ]);
    
    // Create progress bar fill
    loadingScreen.progressFill = k.add([
        k.rect(0, progressBarHeight - 4),
        k.pos(screenWidth / 2 - progressBarWidth / 2 + 2, screenHeight / 2 + 2),
        k.color(k.Color.fromHex("#8a2be2")), // Purple color matching game theme
        k.fixed(),
        k.z(1002),
        "loading-screen"
    ]);
    
    // Create percentage text
    loadingScreen.percentageText = k.add([
        k.text("0%", {
            size: 18,
            font: "monospace",
            styles: {
                fill: k.Color.fromHex("#ffffff"),
                outline: { width: 1, color: k.Color.fromHex("#000000") }
            }
        }),
        k.anchor("center"),
        k.pos(screenWidth / 2, screenHeight / 2 + 40),
        k.fixed(),
        k.z(1001),
        "loading-screen"
    ]);
    
    // Add some animated dots to the loading text
    let dotCount = 0;
    const dotAnimation = k.onUpdate(() => {
        if (!loadingScreen.isActive) {
            dotAnimation.cancel();
            return;
        }
        
        dotCount = (dotCount + 1) % 120; // Update every 2 seconds at 60fps
        const dots = ".".repeat((Math.floor(dotCount / 30) % 4));
        loadingScreen.loadingText.text = `LOADING HIGH QUALITY MAP${dots}`;
    });
    
    loadingScreen.isActive = true;
    console.log("Loading screen created");
}

// Update loading progress
export function updateLoadingProgress(current, total, message = null) {
    if (!loadingScreen.isActive) return;
    
    const percentage = Math.round((current / total) * 100);
    const progressBarWidth = 396; // 400 - 4 for padding
    const fillWidth = (progressBarWidth * current) / total;
    
    // Update progress bar fill
    if (loadingScreen.progressFill) {
        loadingScreen.progressFill.width = fillWidth;
    }
    
    // Update percentage text
    if (loadingScreen.percentageText) {
        loadingScreen.percentageText.text = `${percentage}%`;
    }
    
    // Update loading message if provided
    if (message && loadingScreen.loadingText) {
        loadingScreen.loadingText.text = message;
    }
    
    console.log(`Loading progress: ${current}/${total} (${percentage}%)`);
}

// Remove loading screen
export function removeLoadingScreen() {
    if (!loadingScreen.isActive) return;
    
    console.log("Removing loading screen...");
    
    // Destroy all loading screen elements
    k.destroyAll("loading-screen");
    
    // Reset loading screen state
    loadingScreen = {
        background: null,
        progressBar: null,
        progressFill: null,
        loadingText: null,
        percentageText: null,
        isActive: false
    };
    
    console.log("Loading screen removed");
} 
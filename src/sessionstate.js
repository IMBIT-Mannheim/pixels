// sessionState.js

import { 
    createSecureScore, 
    validateSecureScore, 
    getValidatedScore, 
    updateSecureScore, 
    decreaseSecureScore as decreaseSecureScoreCore,
    migrateToSecureScore,
    debugScoreIntegrity 
} from './secureScore.js';

// Defines the main session state object to track game settings, progress, and timestamps
export const sessionState = {
    sessionId: null, 
    settings: {
        musicVolume: 0.5,
        soundEffectsVolume: 0.5,
        spawnpoint: null,
        character: 'character-male',
        dogName: 'Bello',
        introWatched: false,
    },
    progress: {
        answeredDialogues: [],
        score: 0,                 // Legacy score (will be migrated)
        secureScore: null,        // New secure score object
        scoreInMinigame: 0,       // Last played score from minigame
        unlockedMaps: [],
    },
    minigames: {
        cureMinigame: {
            bestScore: 0,         
            lastScore: 0,          
        },
    },
    timestamps: {
        sessionStart: Date.now(),
        lastSave: null,
    },
    inventory: {
        purchasedItems: [],
        activeCharacter: null,
    },
    // Flag to prevent multiple tampering alerts
    _tamperingAlertShown: false
};

// Sets a top-level key in the session state object
export function setSessionState(key, value) {
    sessionState[key] = value;
}

// Retrieves a top-level key from the session state object
export function getSessionState(key) {
    return sessionState[key];
}

// Serializes the current session state to a JSON string
export function serializeSessionState() {
    return JSON.stringify(sessionState);
}

// Deserializes a JSON string to update the session state
export function deserializeSessionState(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed === "object" && parsed !== null) {
            Object.assign(sessionState, parsed);
        } else {
            console.error("Failed to load session state: Invalid format.");
        }
    } catch (error) {
        console.error("Failed to parse session state JSON:", error);
    }
}

// Saves the session state to localStorage
// Saves the session state to localStorage
export function saveGame() {
    try {
        const data = serializeSessionState();
        localStorage.setItem("gameSave", data);
        sessionState.timestamps.lastSave = Date.now();
        
        console.groupCollapsed(`%c[Session Saved] Session ID: ${sessionState.sessionId}`, "color: green; font-weight: bold;");
        // console.log(JSON.parse(JSON.stringify(sessionState)));
        console.groupEnd();

    } catch (error) {
        console.error("Failed to save game:", error);
    }
}

// Loads the session state from localStorage
// Loads the session state from localStorage
export function loadGame() {
    try {
        const data = localStorage.getItem("gameSave");
        if (data) {
            deserializeSessionState(data);
            console.groupCollapsed(`%c[Session Loaded] Session ID: ${sessionState.sessionId}`, "color: purple; font-weight: bold;");
            // console.log(JSON.parse(JSON.stringify(sessionState)));
            console.groupEnd();
            // console.log("Game loaded successfully.");
        } else {
            console.warn("No saved game found.");
        }
    } catch (error) {
        console.error("Failed to load game:", error);
    }
}


function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to delete a cookie
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to show tampering alert only once per session
export function showTamperingAlert() {
    if (!sessionState._tamperingAlertShown) {
        sessionState._tamperingAlertShown = true;
        alert("Detected cheat, resetting score");
        console.warn("🚨 Tampering detected - showing alert to user");
    }
}

// Function to clear all game-related data when tampering is detected
export function clearGameData() {
    console.warn("🧹 Clearing all game data due to tampering detection");
    
    // Clear localStorage
    localStorage.removeItem("gameSave");
    
    // Clear session-related cookies
    deleteCookie("sessionStateId");
    
    // Reset session state to defaults
    Object.assign(sessionState, {
        sessionId: null,
        settings: {
            musicVolume: 0.5,
            soundEffectsVolume: 0.5,
            spawnpoint: null,
            character: 'character-male',
            dogName: 'Bello',
            introWatched: false,
        },
        progress: {
            answeredDialogues: [],
            score: 0,
            secureScore: null,
            scoreInMinigame: 0,
            unlockedMaps: [],
        },
        minigames: {
            cureMinigame: {
                bestScore: 0,
                lastScore: 0,
            },
        },
        timestamps: {
            sessionStart: Date.now(),
            lastSave: null,
        },
        inventory: {
            purchasedItems: [],
            activeCharacter: null,
        },
        // Flag to prevent multiple tampering alerts
        _tamperingAlertShown: false
    });
    
    // console.log("🧹 Game data cleared successfully");
}

// Private cookie getter
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

// Ensures the sessionState has a valid sessionId
export function ensureSessionId() {
    // Check if sessionState already has an ID before looking at cookies
    if (sessionState.sessionId) {
        // console.log("Using existing session ID:", sessionState.sessionId);
        return;
    }
    
    const cookieId = getCookie("sessionStateId");

    if (cookieId) {
        // console.log("Using cookie session ID:", cookieId);
        sessionState.sessionId = cookieId;
    } else {
        let newId;
        try {
            // Try using the crypto API to generate a UUID
            if (window.crypto && window.crypto.randomUUID) {
                newId = window.crypto.randomUUID();
            } else if (window.crypto && window.crypto.getRandomValues) {
                // Alternative method using getRandomValues
                const array = new Uint8Array(16);
                window.crypto.getRandomValues(array);
                
                // Format as UUID
                newId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
                newId = newId.slice(0, 8) + '-' + newId.slice(8, 12) + '-4' + 
                       newId.slice(13, 16) + '-' + newId.slice(16, 20) + '-' + newId.slice(20);
            } else {
                throw new Error("Crypto API not available");
            }
        } catch (error) {
            console.warn("Using fallback UUID generation:", error);
            // Fallback implementation to generate a UUID
            newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // console.log("Generated new session ID:", newId);
        sessionState.sessionId = newId;
        setCookie("sessionStateId", newId, 365);
    }
}

// ===== SECURE SCORE MANAGEMENT =====

// Get the current validated score
export async function getSecureScore() {
    // Ensure we have a session ID
    if (!sessionState.sessionId) {
        ensureSessionId();
    }
    
    // If we have a secure score, validate and return it
    if (sessionState.progress.secureScore) {
        try {
            const validatedScore = await getValidatedScore(
                sessionState.progress.secureScore, 
                sessionState.sessionId, 
                sessionState.progress.answeredDialogues,
                showTamperingAlert
            );
            
            // If validation failed (returned 0), clear all game data
            if (validatedScore === 0 && sessionState.progress.secureScore.score > 0) {
                console.warn("🚨 Tampering detected during score validation - clearing all game data");
                clearGameData();
                // Generate new session ID for fresh start
                ensureSessionId();
                return 0;
            }
            
            // Update the legacy score for compatibility
            sessionState.progress.score = validatedScore;
            return validatedScore;
        } catch (error) {
            console.error("Error during score validation:", error);
            console.warn("🚨 Score validation error - clearing all game data");
            showTamperingAlert();
            clearGameData();
            ensureSessionId();
            return 0;
        }
    }
    
    // If no secure score but we have a legacy score, migrate it
    if (sessionState.progress.score > 0) {
        // console.log("Migrating legacy score to secure score system");
        try {
            sessionState.progress.secureScore = await migrateToSecureScore(
                sessionState.progress.score,
                sessionState.sessionId,
                sessionState.progress.answeredDialogues,
                showTamperingAlert
            );
            saveGame();
            return sessionState.progress.score;
        } catch (error) {
            console.error("Error during score migration:", error);
            console.warn("🚨 Score migration error - clearing all game data");
            showTamperingAlert();
            clearGameData();
            ensureSessionId();
            return 0;
        }
    }
    
    // No score at all, return 0
    return 0;
}

// Increase the score securely for dialogue answers (handles answeredDialogues update)
export async function increaseScoreForDialogue(amount, dialogueId) {
    // Ensure we have a session ID
    if (!sessionState.sessionId) {
        ensureSessionId();
    }
    
    try {
        // Get current validated score
        const currentScore = await getSecureScore();
        const newScore = currentScore + amount;
        
        // Create updated answeredDialogues array with the new dialogue
        const updatedAnsweredDialogues = [...sessionState.progress.answeredDialogues];
        if (!updatedAnsweredDialogues.includes(dialogueId)) {
            updatedAnsweredDialogues.push(dialogueId);
        }
        
        // Create new secure score with the updated answeredDialogues array
        sessionState.progress.secureScore = await updateSecureScore(
            sessionState.progress.secureScore,
            newScore,
            sessionState.sessionId,
            updatedAnsweredDialogues, // Use the updated array for hash generation
            showTamperingAlert
        );
        
        // Update the answeredDialogues array in sessionState
        sessionState.progress.answeredDialogues = updatedAnsweredDialogues;
        
        // Update legacy score for compatibility
        sessionState.progress.score = newScore;
        
        // Save the game
        saveGame();
        
        // console.log(`🔒 Secure score increased by ${amount} for dialogue ${dialogueId}. New score: ${newScore}`);
        return newScore;
    } catch (error) {
        console.error("Error during dialogue score increase:", error);
        console.warn("🚨 Dialogue score increase error - clearing all game data");
        showTamperingAlert();
        clearGameData();
        ensureSessionId();
        return 0;
    }
}

// Increase the score securely
export async function increaseSecureScore(amount) {
    // Ensure we have a session ID
    if (!sessionState.sessionId) {
        ensureSessionId();
    }
    
    try {
        // Get current validated score
        const currentScore = await getSecureScore();
        const newScore = currentScore + amount;
        
        // Create new secure score
        sessionState.progress.secureScore = await updateSecureScore(
            sessionState.progress.secureScore,
            newScore,
            sessionState.sessionId,
            sessionState.progress.answeredDialogues,
            showTamperingAlert
        );
        
        // Update legacy score for compatibility
        sessionState.progress.score = newScore;
        
        // Save the game
        saveGame();
        
        // console.log(`🔒 Secure score increased by ${amount}. New score: ${newScore}`);
        return newScore;
    } catch (error) {
        console.error("Error during score increase:", error);
        console.warn("🚨 Score increase error - clearing all game data");
        showTamperingAlert();
        clearGameData();
        ensureSessionId();
        return 0;
    }
}

// Decrease the score securely (for purchases)
export async function decreaseSecureScore(amount) {
    // Ensure we have a session ID
    if (!sessionState.sessionId) {
        ensureSessionId();
    }
    
    try {
        // Get current validated score
        const currentScore = await getSecureScore();
        
        // Check if we have enough score
        if (currentScore < amount) {
            console.warn(`Cannot decrease score by ${amount}. Current score: ${currentScore}`);
            return currentScore; // Return current score unchanged
        }
        
        const newScore = currentScore - amount;
        
        // Create new secure score
        sessionState.progress.secureScore = await decreaseSecureScoreCore(
            sessionState.progress.secureScore,
            amount,
            sessionState.sessionId,
            sessionState.progress.answeredDialogues,
            showTamperingAlert
        );
        
        // Update legacy score for compatibility
        sessionState.progress.score = newScore;
        
        // Save the game
        saveGame();
        
        // console.log(`🔒 Secure score decreased by ${amount}. New score: ${newScore}`);
        return newScore;
    } catch (error) {
        console.error("Error during score decrease:", error);
        console.warn("🚨 Score decrease error - clearing all game data");
        showTamperingAlert();
        clearGameData();
        ensureSessionId();
        return 0;
    }
}

// Reset the score securely
export async function resetSecureScore() {
    // Ensure we have a session ID
    if (!sessionState.sessionId) {
        ensureSessionId();
    }
    
    // Create new secure score with 0
    sessionState.progress.secureScore = await createSecureScore(
        0,
        sessionState.sessionId,
        []
    );
    
    // Reset legacy data
    sessionState.progress.score = 0;
    sessionState.progress.answeredDialogues = [];
    
    // Save the game
    saveGame();
    
    // console.log("🔒 Secure score reset to 0");
    return 0;
}

// Validate current score integrity (for debugging/admin purposes)
export async function validateCurrentScore() {
    if (!sessionState.progress.secureScore) {
        // console.log("No secure score to validate");
        return false;
    }
    
    return await debugScoreIntegrity(
        sessionState.progress.secureScore,
        sessionState.sessionId,
        sessionState.progress.answeredDialogues
    );
}

// Initialize secure scoring system (call this after loading game)
export async function initializeSecureScoring() {
    // console.log("🔒 Initializing secure scoring system...");
    
    // Ensure session ID exists
    ensureSessionId();
    
    // Validate current score
    const currentScore = await getSecureScore();
    
    // console.log(`🔒 Secure scoring initialized. Current score: ${currentScore}`);
    
    // Optional: Validate integrity in development
    if (process.env.NODE_ENV === 'development') {
        await validateCurrentScore();
    }
    
    return currentScore;
}
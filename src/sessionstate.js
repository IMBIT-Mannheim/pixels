// sessionState.js

// Defines the main session state object to track game settings, progress, and timestamps
export const sessionState = {
    settings: {
        musicVolume: 0.5,         // Background music volume (0.0 to 1.0)
        soundEffectsVolume: 0.5,  // Sound effects volume (0.0 to 1.0)
        spawnpoint: null,         // Player's chosen spawnpoint (e.g., 'campus')
        character: 'character-male', // Character sprite selected
        dogName: 'Bello',         // Name of the player's dog companion
        introWatched: false,      // Whether the player has watched the intro video
    },
    progress: {
        answeredDialogues: [],    // List of dialogue IDs the player has answered
        score: 0,                 // Overall score in the main game
        scoreInMinigame: 0,       // Score achieved in the minigame
        unlockedMaps: [],         // Maps unlocked by the player
    },
    minigames: {
        cureMinigame: {
            bestScore: 0,          // Highest score achieved in the Cure minigame
            lastScore: 0,          // Last score achieved in the Cure minigame
        },
    },
    timestamps: {
        sessionStart: Date.now(), // Timestamp when the session started
        lastSave: null,           // Timestamp of the last manual save (optional)
    },
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
export function saveGame() {
    try {
        const data = serializeSessionState();
        localStorage.setItem("gameSave", data);
        sessionState.timestamps.lastSave = Date.now();
        console.log("Game saved successfully.");
    } catch (error) {
        console.error("Failed to save game:", error);
    }
}

// Loads the session state from localStorage
export function loadGame() {
    try {
        const data = localStorage.getItem("gameSave");
        if (data) {
            deserializeSessionState(data);
            console.log("Game loaded successfully.");
        } else {
            console.warn("No saved game found.");
        }
    } catch (error) {
        console.error("Failed to load game:", error);
    }
}

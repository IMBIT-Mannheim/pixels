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
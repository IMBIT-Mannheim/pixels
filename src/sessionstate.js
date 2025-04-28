// sessionState.js

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
        score: 0,                 // Points from dialogues
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
        console.log(JSON.parse(JSON.stringify(sessionState)));
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
            console.log(JSON.parse(JSON.stringify(sessionState)));
            console.groupEnd();
            console.log("Game loaded successfully.");
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
    const cookieId = getCookie("sessionStateId");

    if (cookieId) {
        sessionState.sessionId = cookieId;
    } else {
        const newId = crypto.randomUUID(); // Use crypto API to generate random UUID
        sessionState.sessionId = newId;
        setCookie("sessionStateId", newId, 365);
    }
}
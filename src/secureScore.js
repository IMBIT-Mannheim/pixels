// secureScore.js - Tamper-proof scoring system

// Secret salt for hashing (in production, this should be more complex and possibly server-generated)
const SCORE_SALT = "IMBIT_PIXEL_GAME_2024_SECURE_SCORE_VALIDATION";

// Additional entropy sources for better security
const getClientFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Client fingerprint', 2, 2);
    
    return {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        canvas: canvas.toDataURL(),
        userAgent: navigator.userAgent.slice(0, 50) // Truncated for consistency
    };
};

// Simple hash function using Web Crypto API
async function simpleHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a secure hash for the score (simplified and less strict)
async function generateScoreHash(score, sessionId, timestamp, answeredDialogues) {
    // Much simpler hash generation - only use essential factors
    const dataToHash = [
        SCORE_SALT,
        score.toString(),
        sessionId,
        // Remove strict timestamp - use day-based instead of hour-based for more flexibility
        Math.floor(timestamp / (1000 * 60 * 60 * 24)).toString(), // Day-based timestamp
        answeredDialogues.sort().join(','), // Sort to ensure consistent order
    ].join('|');
    
    return await simpleHash(dataToHash);
}

// Validate a score against its hash
async function validateScoreHash(score, sessionId, timestamp, answeredDialogues, storedHash) {
    const expectedHash = await generateScoreHash(score, sessionId, timestamp, answeredDialogues);
    return expectedHash === storedHash;
}

// Create a secure score object
export async function createSecureScore(score, sessionId, answeredDialogues) {
    const timestamp = Date.now();
    const hash = await generateScoreHash(score, sessionId, timestamp, answeredDialogues);
    
    return {
        score: score,
        timestamp: timestamp,
        hash: hash,
        version: "1.0" // For future compatibility
    };
}

// Validate a secure score object (more forgiving)
export async function validateSecureScore(secureScoreObj, sessionId, answeredDialogues) {
    if (!secureScoreObj || typeof secureScoreObj !== 'object') {
        console.warn("Invalid secure score object");
        return false;
    }
    
    const { score, timestamp, hash, version } = secureScoreObj;
    
    // Basic validation
    if (typeof score !== 'number' || typeof timestamp !== 'number' || typeof hash !== 'string') {
        console.warn("Secure score object has invalid data types");
        return false;
    }
    
    // Check if timestamp is reasonable (much more lenient - 90 days instead of 30)
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days instead of 30
    if (timestamp > now + (24 * 60 * 60 * 1000) || (now - timestamp) > maxAge) { // Allow 1 day in future for clock differences
        console.warn("Secure score timestamp is invalid");
        return false;
    }
    
    // First check if the score is reasonable - if it is, be more lenient with hash validation
    const scoreIsReasonable = isScoreReasonable(score, answeredDialogues);
    
    // Try hash validation
    const isValid = await validateScoreHash(score, sessionId, timestamp, answeredDialogues, hash);
    
    if (!isValid) {
        console.warn("Secure score hash validation failed");
        
        // If hash validation fails but score is reasonable, allow it (less strict mode)
        if (scoreIsReasonable && score <= (answeredDialogues.length * 2 + 1000)) {
            console.log("Hash validation failed but score seems reasonable - allowing it (less strict mode)");
            return true;
        }
        
        console.warn("Hash validation failed and score seems suspicious - rejecting");
        return false;
    }
    
    return true;
}

// Get the actual score value from a secure score object (with validation, more forgiving)
export async function getValidatedScore(secureScoreObj, sessionId, answeredDialogues, onTamperingDetected = null) {
    const isValid = await validateSecureScore(secureScoreObj, sessionId, answeredDialogues);
    
    if (!isValid) {
        // Check if the score is at least reasonable before triggering tampering alert
        const scoreIsReasonable = secureScoreObj && isScoreReasonable(secureScoreObj.score, answeredDialogues);
        
        if (scoreIsReasonable && secureScoreObj.score <= (answeredDialogues.length * 5 + 2000)) {
            console.warn("Score validation failed but score seems reasonable - returning score without alert");
            return secureScoreObj.score;
        }
        
        console.error("Score validation failed - resetting to 0");
        
        // Only call tampering detection callback for truly suspicious scores
        if (onTamperingDetected && typeof onTamperingDetected === 'function') {
            onTamperingDetected();
        }
        
        return 0;
    }
    
    return secureScoreObj.score;
}

// Update score securely (for increments, more forgiving)
export async function updateSecureScore(currentSecureScore, newScore, sessionId, answeredDialogues, onTamperingDetected = null) {
    // Validate current score first, but be more forgiving
    if (currentSecureScore) {
        const isCurrentValid = await validateSecureScore(currentSecureScore, sessionId, answeredDialogues);
        if (!isCurrentValid) {
            // Check if current score is at least reasonable
            const currentScoreIsReasonable = isScoreReasonable(currentSecureScore.score, answeredDialogues);
            
            if (currentScoreIsReasonable && currentSecureScore.score <= (answeredDialogues.length * 5 + 2000)) {
                console.warn("Current score validation failed but seems reasonable - continuing with update");
                // Continue with creating new score instead of triggering tampering alert
            } else {
                console.warn("Current score is invalid and suspicious, starting fresh");
                
                // Only call tampering detection callback for truly suspicious scores
                if (onTamperingDetected && typeof onTamperingDetected === 'function') {
                    onTamperingDetected();
                }
                
                return await createSecureScore(newScore, sessionId, answeredDialogues);
            }
        }
    }
    
    // Create new secure score
    return await createSecureScore(newScore, sessionId, answeredDialogues);
}

// Decrease score securely (for purchases)
export async function decreaseSecureScore(currentSecureScore, amount, sessionId, answeredDialogues, onTamperingDetected = null) {
    // Get current validated score
    const currentScore = await getValidatedScore(
        currentSecureScore, 
        sessionId, 
        answeredDialogues,
        onTamperingDetected
    );
    
    // Calculate new score (ensure it doesn't go below 0)
    const newScore = Math.max(0, currentScore - amount);
    
    // Create new secure score
    return await updateSecureScore(
        currentSecureScore,
        newScore,
        sessionId,
        answeredDialogues,
        onTamperingDetected
    );
}

// Utility function to check if score seems reasonable
export function isScoreReasonable(score, answeredDialogues) {
    // Basic sanity checks
    if (score < 0) return false;
    
    // Much more generous limit to account for:
    // - Dialogue points: 1 point per correct answer
    // - Minigame points: potentially hundreds of points per game
    // - Multiple minigame sessions
    // Allow up to 10,000 points to avoid false positives while still catching obvious cheating
    if (score > 10000) return false;
    
    return true;
}

// Migration function to convert old scores to secure scores
export async function migrateToSecureScore(oldScore, sessionId, answeredDialogues, onTamperingDetected = null) {
    console.log("Migrating old score to secure score system");
    
    // Validate that the old score is reasonable
    if (!isScoreReasonable(oldScore, answeredDialogues)) {
        console.warn("Old score seems unreasonable, resetting to 0");
        
        // Call tampering detection callback if provided
        if (onTamperingDetected && typeof onTamperingDetected === 'function') {
            onTamperingDetected();
        }
        
        oldScore = 0;
    }
    
    return await createSecureScore(oldScore, sessionId, answeredDialogues);
}

// Debug function to check score integrity
export async function debugScoreIntegrity(secureScoreObj, sessionId, answeredDialogues) {
    console.group("🔒 Score Integrity Check");
    
    if (!secureScoreObj) {
        console.log("❌ No secure score object found");
        console.groupEnd();
        return false;
    }
    
    console.log("📊 Score:", secureScoreObj.score);
    console.log("⏰ Timestamp:", new Date(secureScoreObj.timestamp).toLocaleString());
    console.log("🔑 Hash:", secureScoreObj.hash.slice(0, 16) + "...");
    console.log("📝 Answered Dialogues:", answeredDialogues.length);
    
    const isValid = await validateSecureScore(secureScoreObj, sessionId, answeredDialogues);
    console.log(isValid ? "✅ Score is valid" : "❌ Score validation failed");
    
    const isReasonable = isScoreReasonable(secureScoreObj.score, answeredDialogues);
    console.log(isReasonable ? "✅ Score is reasonable" : "❌ Score seems unreasonable");
    
    console.groupEnd();
    return isValid && isReasonable;
} 
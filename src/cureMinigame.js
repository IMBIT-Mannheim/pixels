
import { k } from "./kaboomCtx";
import {setCamScale, refreshScoreUI } from "./utils";
import { sessionState, setSessionState, getSessionState, saveGame, loadGame, updateTotalScore} from "./sessionstate.js";

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
    let timePassed = 0;
    let gameSpeed = GAME_SPEED;
    let obstacles = [];
    let decorations = [];
    let isGameOver = false;
    let stripes = []; // Array für alle Straßenmarkierungen
    let music = undefined;

    k.scene("cure_minigame", async () => {
        const music_volume = sessionState.settings.musicVolume || 0.5;

        if (music === undefined) {
            // Play the map-specific background music
            music = k.play("bgm_cureMinigame", {
                volume: music_volume, // Verwende die gleiche Lautstärke wie im Intro
                loop: true,
            });
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
                // First, add a background panel
                k.add([
                    k.rect(700, 400), // Width and height of the panel
                    k.pos(k.width() / 2, k.height() / 2 + 50),
                    k.anchor("center"),
                    k.color(k.rgb(150, 0, 0, 0.1)), // Black with 80% opacity
                    k.opacity(0.3),
                    k.outline(4, k.rgb(255, 0, 0)), // Red outline
                    k.z(199), // Just below the text
                ]);

                // Game over text with a slight shadow effect
                k.add([
                    k.text("Game Over!", { size: 48 }),
                    k.pos(k.width() / 2, k.height() / 2 - 15),
                    k.anchor("center"),
                    k.color(k.rgb(255, 50, 50)), // Brighter red
                    k.z(200),
                ]);

                k.add([
                    k.text("ESC: zurück zum Campus"),
                    k.pos(k.width() / 2, k.height() / 2 + 80),
                    k.anchor("center"),
                    k.z(200),
                ]);

                k.add([
                    k.text("Leertaste: Minispiel neustarten"),
                    k.pos(k.width() / 2, k.height() / 2 + 120),
                    k.anchor("center"),
                    k.z(200),
                ]);

                k.onKeyPress("escape", () => {
                    music.stop();
                    music = undefined;
                    k.go("campus");
                });
                k.onKeyPress("space", () => {
                    k.go("cure_minigame");
                });
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
            if (k.isKeyDown("left") || k.isKeyDown("a")) {
                player.direction = "left";
                directionVector.x = -1;
            }
            if (k.isKeyDown("right") || k.isKeyDown("d")) {
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

        k.onResize(() => {
            setCamScale(k);
        });

        k.onSceneLeave(() => {
            const currentScore = calculateScore(timePassed);
            const lastScore = sessionState.progress.scoreInMinigame; // Optionally update lastScore as well

            if (currentScore > lastScore) {
                sessionState.progress.scoreInMinigame = currentScore;
            }
            updateTotalScore();  // 
            refreshScoreUI();
        
            saveGame();

            // Clean up resources
            k.setBackground(k.Color.fromHex("#311047"));
            obstacles.forEach((obstacle) => obstacle.destroy());
            decorations.forEach((decoration) => decoration.destroy());
            stripes.forEach((stripe) => stripe.destroy());

            // Reset game state
            obstacles = [];
            decorations = [];
            stripes = [];
            timePassed = 0;
            isGameOver = false;

            //Hide minigame-specific HTML
            for (let i = 0; i < during_minigame.length; i++) {
                during_minigame[i].style.display = "none";
                during_minigame[i].style.opacity = 0;
            }
        });
    });
}

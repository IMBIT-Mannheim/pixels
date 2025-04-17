import { dialogueData, maps, music, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { dialogue, setCamScale, setCookie, getCookie } from "./utils";

// Spielkonstanten
const GAME_SPEED = 300;
const PLAYER_SPEED = 400;
const ROAD_WIDTH = 400;
const OBSTACLE_SPAWN_RATE = 0.02; // Wahrscheinlichkeit pro Frame

const DECORATION_SPAWN_RATE = 0.03; // Wahrscheinlichkeit pro Frame für Dekoration
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
const DECORATION_SPAWN_DISTANCE = 100; // Min vertical distance between decorations
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
    let roadSegments = [];
    let obstacles = [];
    let decorations = [];
    let isGameOver = false;
    let stripes = []; // Array für alle Straßenmarkierungen

    k.scene("cure_minigame", async () => {
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

        const road = k.add([
            k.rect(ROAD_WIDTH, k.height()),
            k.color(k.rgb(50, 50, 50)),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.z(1),
            "road",
        ]);

        const leftBoundary = k.add([
            k.rect(20, k.height()),
            k.color(k.rgb(200, 200, 0)),
            k.pos(k.width() / 2 - ROAD_WIDTH / 2 - 10, k.height() / 2),
            k.anchor("center"),
            k.area(),
            k.z(2),
            "boundary",
        ]);

        const rightBoundary = k.add([
            k.rect(20, k.height()),
            k.color(k.rgb(200, 200, 0)),
            k.pos(k.width() / 2 + ROAD_WIDTH / 2 + 10, k.height() / 2),
            k.anchor("center"),
            k.area(),
            k.z(2),
            "boundary",
        ]);


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
            console.log("Exiting racing minigame scene");
            setCookie("scoreAchievedInMinigame", calculateScore(timePassed));
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

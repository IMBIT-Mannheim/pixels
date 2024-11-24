import { dialogueData, maps, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { dialogue, enableFullMapView, disableFullMapView, setCamScale } from "./utils";


k.loadSprite("character-male", "./sprites/character-male.png", {
	sliceX: 3,
	sliceY: 3,
	anims: {
		"idle-down": 0,
		"idle-up": 3,
		"idle-side": 6,
		"walk-down": { from: 0, to: 2, loop: true, speed: 8 },
		"walk-up": { from: 3, to: 5, loop: true, speed: 8 },
		"walk-side": { from: 6, to: 8, loop: true, speed: 8 },
	},
});

k.loadSprite("character-female", "./sprites/character-female.png", {
	sliceX: 3,
	sliceY: 3,
	anims: {
		"idle-down": 0,
		"idle-up": 3,
		"idle-side": 6,
		"walk-down": { from: 0, to: 2, loop: true, speed: 8 },
		"walk-up": { from: 3, to: 5, loop: true, speed: 8 },
		"walk-side": { from: 6, to: 8, loop: true, speed: 8 },
	},
});

k.loadSprite("dog-spritesheet", "./sprites/dog-spritesheet.png", {
	sliceX: 4,
	sliceY: 3,
	anims: {
		"dog-idle-side": 0,
		"dog-idle-up": 4,
		"dog-idle-down": 8,
		"dog-walk-side": { from: 0, to: 3, loop: true, speed: 8 },
		"dog-walk-up": { from: 4, to: 7, loop: true, speed: 8 },
		"dog-walk-down": { from: 8, to: 11, loop: true, speed: 8 },
	},
});

for (let i = 0; i < maps.length; i++) {
	const map = maps[i];
	k.loadSprite(map, `./maps/${map}.png`)
	setupScene(map, `./maps/${map}.json`, map);
}

//läd die Sounds im Hintergrund
k.loadSound("bgm", "./sounds/bg-music.mp3");
k.loadSound("boundary", "./sounds/boundary.mp3");
k.loadSound("talk", "./sounds/talk.mp3");

//setzt die Hintergrundfarbe
k.setBackground(k.Color.fromHex("#311047"));

//LVL 0: SCENE LOADING
let character = "character-male";
let spawnpoint = "mensa";

k.scene("loading", () => {
	const starting_screen = document.getElementById("starting-screen");
	const during_game = document.getElementsByClassName("during-game");
	const male_button = document.getElementById("male-button");
	const female_button = document.getElementById("female-button");
	const select_spawnpoint = document.getElementById("spawnpoint");
	const game = document.getElementById("game");
	male_button.addEventListener("click", () => {
		character = "character-male";
		female_button.classList.remove("selected");
		male_button.classList.add("selected");
		game.focus();
	});
	female_button.addEventListener("click", () => {
		character = "character-female";
		male_button.classList.remove("selected");
		female_button.classList.add("selected");
		game.focus();
	});
	select_spawnpoint.addEventListener("change", () => {
		spawnpoint = select_spawnpoint.value;
		game.focus();
	});
	k.onKeyPress(["enter", "space"], () => {
		const music = k.play("bgm", {
			volume: 0.2,
			loop: true
		})
		starting_screen.style.display = "none";
		for (let i = 0; i < during_game.length; i++) {
			during_game[i].style.display = "block";
		}
		k.go(spawnpoint);
	});
});

function setupScene(sceneName, mapFile, mapSprite) {
	k.scene(sceneName, async () => {
		let isFullMapView = false;  // Variable to track if in full map view
		const showWorldMapBtn = document.getElementById("show-world-map");

		//Lädt die Mapdaten
		const mapData = await (await fetch(mapFile)).json();
		const layers = mapData.layers;

		//Fügt die Karte hinzu, macht sie sichtbar und skaliert sie
		const map = k.add([k.sprite(mapSprite), k.pos(0), k.scale(scaleFactor)]);

		//Erstellt den Spieler
		const player = k.make([
			k.sprite(character, { anim: "idle-down" }),
			k.area(),
			k.body(),
			k.anchor("center"),
			k.pos(),
			k.scale(scaleFactor),
			{
				speed: 250,
				direction: "down",
				get isInDialogue () {return dialogue.inDialogue()},
				get score () {return dialogue.getScore()},
			},
			"player",
		]);

		const dog = k.make([
			k.sprite("dog-spritesheet", { anim: "dog-idle-side" }),
			k.area(),
			k.body(),
			k.anchor("center"),
			k.pos(),
			k.scale(scaleFactor - 1.5),
			{
				speed: 150,
				direction: "right",
			},
			"dog",
		]);

		const dogNameTag = k.make([
			k.text("JJ", { size: 18 }),
			k.pos(dog.pos.x, dog.pos.y - 50),
			{ followOffset: k.vec2(0, -50) },
		]);

		dogNameTag.onUpdate(() => {
			dogNameTag.pos = dog.pos.add(dogNameTag.followOffset);
		});

		const followDistance = 130;
		let previousPos = dog.pos.clone();

		// Track the previous direction to use when idling
		let previousDirection = "down"; // Default direction

		dog.onUpdate(() => {
			const distance = dog.pos.dist(player.pos);
			const maxDistance = 200;
			let speed = dog.speed;

			if (distance > maxDistance + 200) {
				dog.pos = player.pos.clone();
			} else if (distance > maxDistance) {
				speed = 300;
			}

			// If the follower is farther than the followDistance, it should move towards the player
			if (distance > followDistance) {
				const direction = player.pos.sub(dog.pos).unit();
				dog.move(direction.scale(speed));

				// Determine animation based on direction
				if (Math.abs(direction.x) > Math.abs(direction.y)) {
					// Horizontal movement
					if (direction.x < 0) {
						dog.flipX = true; // Face left
						if (dog.curAnim() !== "dog-walk-side") {
							dog.play("dog-walk-side");
						}
						previousDirection = "side";
					} else {
						dog.flipX = false; // Face right
						if (dog.curAnim() !== "dog-walk-side") {
							dog.play("dog-walk-side");
						}
						previousDirection = "side";
					}
				} else {
					// Vertical movement
					if (direction.y < 0) {
						// Moving up
						if (dog.curAnim() !== "dog-walk-up") {
							dog.play("dog-walk-up");
						}
						previousDirection = "up";
					} else {
						// Moving down
						if (dog.curAnim() !== "dog-walk-down") {
							dog.play("dog-walk-down");
						}
						previousDirection = "down";
					}
				}
			} else {
				// If within follow distance, switch to "idle" animation based on previous direction
				if (previousDirection === "side") {
					if (dog.curAnim() !== "dog-idle-side") {
						dog.play("dog-idle-side");
					}
				} else if (previousDirection === "up") {
					if (dog.curAnim() !== "dog-idle-up") {
						dog.play("dog-idle-up");
					}
				} else if (previousDirection === "down") {
					if (dog.curAnim() !== "dog-idle-down") {
						dog.play("dog-idle-down");
					}
				}
			}

			// Update previous position for the next frame
			previousPos = dog.pos.clone();
		});

		k.onUpdate(() => {
			k.camPos(player.worldPos().x, player.worldPos().y - 100);
		});
		// Show full world map while holding down m key
		k.onKeyDown("m", () => {
			isFullMapView = true;
			stopAnims();
			enableFullMapView(k, map);
		});
		// Return to player view when releasing m key
		k.onKeyRelease("m", () => {
			isFullMapView = false;
			disableFullMapView(k);
		});

		showWorldMapBtn.addEventListener("click", () => {
			if (!isFullMapView) {
				isFullMapView = true;
				stopAnims();
				showWorldMapBtn.innerHTML = "Hide World Map (M)";
				enableFullMapView(k, map);
			} else {
				isFullMapView = false;
				showWorldMapBtn.innerHTML = "Show World Map (M)";
				document.getElementById("game").focus();
				disableFullMapView(k);
			}
		});

		k.onUpdate(() => {
			if (!isFullMapView) {
				// Follow the player only if not in full map view
				k.camPos(player.worldPos().x, player.worldPos().y - 100);
			}
		});

		//Fügt die Collider hinzu und prüft, ob der collider einen Namen hat. Wenn ja, wird ein Dialog angezeigt. Der dialog wird in der Datei constants.js definiert.
		for (const layer of layers) {
			if (layer.name === "boundaries") {
				for (const boundary of layer.objects) {
					map.add([
						k.area({
							shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
						}),
						k.body({ isStatic: true }),
						k.pos(boundary.x, boundary.y),
						k.rotate(boundary.rotation),
						boundary.name,
					]);

					if (boundary.name !== "boundary") {
						player.onCollide(boundary.name, () => {
							showWorldMapBtn.style.display = "none";
							k.play("talk");
							dialogue.display(
								dialogueData[boundary.name],
								() => (showWorldMapBtn.style.display = "block")
							);
						});
					}
				}

				continue;
			}

			k.onCollide("player", "boundary", () => {
				k.play("boundary");
			});

			if (layer.name === "goto") {
				for (const boundary of layer.objects) {
					map.add([
						k.area({
							shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
						}),
						k.body({ isStatic: true }),
						k.pos(boundary.x, boundary.y),
						k.rotate(boundary.rotation),
						boundary.name,
					]);

					if (boundary.name) {
						player.onCollide(boundary.name, () => {
							k.go(boundary.name);
						});
					}
				}
				continue;
			}

			//Setzt den Spieler auf die Spawnposition
			if (layer.name === "spawnpoints") {
				for (const entity of layer.objects) {
					if (entity.name === "player") {
						player.pos = k.vec2(
							(map.pos.x + entity.x) * scaleFactor,
							(map.pos.y + entity.y) * scaleFactor
						);
						k.add(player);
					}
					else if (entity.name === "dog") {
						dog.pos = k.vec2(
							(map.pos.x + entity.x) * scaleFactor,
							(map.pos.y + entity.y) * scaleFactor
						);
						k.add(dog);
						k.add(dogNameTag);
					}
				}
			}
		}

		setCamScale(k);

		k.onResize(() => {
			setCamScale(k);
		});

		//Bewegung des Spielers mit der Maus
		k.onMouseDown((mouseBtn) => {
			if (isFullMapView) return; // Disable player movement when in full map view
			if (mouseBtn !== "left" || player.isInDialogue) return;

			const worldMousePos = k.toWorld(k.mousePos());
			player.moveTo(worldMousePos, player.speed);

			const mouseAngle = player.pos.angle(worldMousePos);

			const lowerBound = 50;
			const upperBound = 125;

			if (
				mouseAngle > lowerBound &&
				mouseAngle < upperBound &&
				player.getCurAnim().name !== "walk-up"
			) {
				player.play("walk-up");
				player.direction = "up";
				return;
			}

			if (
				mouseAngle < -lowerBound &&
				mouseAngle > -upperBound &&
				player.getCurAnim().name !== "walk-down"
			) {
				player.play("walk-down");
				player.direction = "down";
				return;
			}

			if (Math.abs(mouseAngle) > upperBound) {
				player.flipX = true;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "left";
				return;
			}

			if (Math.abs(mouseAngle) < lowerBound) {
				player.flipX = false;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "left";

			}
		});

		function stopAnims() {
			if (player.direction === "down") {
				player.play("idle-down");
				return;
			}
			if (player.direction === "up") {
				player.play("idle-up");
				return;
			}

			player.play("idle-side");
		}

		function stopDogAnims() {
			if (dog.direction === "down") {
				dog.play("dog-idle-down");
				return;
			}
			if (dog.direction === "up") {
				dog.play("dog-idle-up");
				return;
			}

			dog.play("dog-idle-side");
		}

		k.onMouseRelease(stopAnims);

		k.onKeyRelease(() => {
			stopAnims();
			stopDogAnims();
		});

		k.onKeyDown(() => {
			if (isFullMapView) return; // Disable player movement when in full map view
			const keyMap = [
				k.isKeyDown("right"),
				k.isKeyDown("left"),
				k.isKeyDown("up"),
				k.isKeyDown("down"),
				k.isKeyDown("w"),
				k.isKeyDown("a"),
				k.isKeyDown("s"),
				k.isKeyDown("d"),
			];

			let nbOfKeyPressed = 0;
			for (const key of keyMap) {
				if (key) {
					nbOfKeyPressed++;
				}
			}

			if (nbOfKeyPressed > 1) return;

			if (player.isInDialogue) return;

			//Player keyboard movement
			if (keyMap[0] || keyMap[7]) {
				player.flipX = true;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "right";
				player.move(player.speed, 0);
				return;
			}

			if (keyMap[1] || keyMap[5]) {
				player.flipX = false;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "left";
				player.move(-player.speed, 0);
				return;
			}

			if (keyMap[2] || keyMap[4]) {
				if (player.getCurAnim().name !== "walk-up") player.play("walk-up");
				player.direction = "up";
				player.move(0, -player.speed);
				return;
			}

			if (keyMap[3] || keyMap[6]) {
				if (player.getCurAnim().name !== "walk-down") player.play("walk-down");
				player.direction = "down";
				player.move(0, player.speed);
			}
		});
	});
}

k.go("loading");
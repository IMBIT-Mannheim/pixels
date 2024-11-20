import { dialogueData, maps, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, enableFullMapView, disableFullMapView, setCamScale } from "./utils";

const select_spawnpoint = document.getElementById("spawnpoint");
let character = "character-male";
let spawnpoint;
let sound_effects_volume = "0.5";

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
	let opt = document.createElement('option');
	opt.value = map;
	opt.innerHTML = map;
	select_spawnpoint.appendChild(opt);
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
k.scene("loading", () => {
	const starting_screen = document.getElementById("starting-screen");
	const during_game = document.getElementsByClassName("during-game");
	const start_game = document.getElementById("start");
	const music_toggle = document.getElementById("music-toggle");
	const sound_effects_toggle = document.getElementById("sound-effects-toggle");
	const male_button = document.getElementById("male-button");
	const female_button = document.getElementById("female-button");
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
		game.focus();
	});
	start_game.addEventListener("click", () => {
		startGame();
	});
	k.onKeyPress(["enter", "space"], () => {
		startGame()
	});
	function startGame() {
		const volume = music_toggle.checked ? 0 : 0.2;
		sound_effects_volume = sound_effects_toggle.checked ? 0 : 0.5;
		spawnpoint = select_spawnpoint.value;
		const music = k.play("bgm", {
			volume: volume,
			loop: true
		})
		starting_screen.style.display = "none";
		for (let i = 0; i < during_game.length; i++) {
			during_game[i].style.display = "block";
		}
		game.focus();
		k.go(spawnpoint);
	}
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
				isInDialogue: false,
			},
			"player",
		]);

		//Erstellt den Hund
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

		//Erstellt den Hundename-Tag
		const dogNameTag = k.make([
			k.text("JJ", { size: 18 }),
			k.pos(dog.pos.x, dog.pos.y - 50),
			{ followOffset: k.vec2(0, -50) },
		]);

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
							player.isInDialogue = true;
							k.play("talk", {
								volume: sound_effects_volume,
							});
							displayDialogue(
								dialogueData[boundary.name],
								() => (player.isInDialogue = false)
							);
						});
					}
				}

				continue;
			}

			k.onCollide("player", "boundary", () => {
				k.play("boundary", {
					volume: sound_effects_volume,
				});
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

			//Teleports to other scenes
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
		}

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

		//Player movement with keyboard
		const diagonalFactor = 1 / Math.sqrt(2);

		k.onUpdate(() => {
			if (player.isInDialogue) return;
			if (isFullMapView) return;

			const directionVector = k.vec2(0, 0);
			if (k.isKeyDown("left") || k.isKeyDown("a")) {
				player.flipX = false;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "left";
				directionVector.x = -1;
			}
			if (k.isKeyDown("right") || k.isKeyDown("d")) {
				player.flipX = true;
				if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
				player.direction = "right";
				directionVector.x = 1;
			}
			if (k.isKeyDown("up") || k.isKeyDown("w")) {
				if (player.getCurAnim().name !== "walk-up") player.play("walk-up");
				player.direction = "up";
				directionVector.y = -1;
			}
			if (k.isKeyDown("down") || k.isKeyDown("s")) {
				if (player.getCurAnim().name !== "walk-down") player.play("walk-down");
				player.direction = "down";
				directionVector.y = 1;
			}

			// this is true when the player is moving diagonally
			if (directionVector.x && directionVector.y) {
				player.move(directionVector.scale(diagonalFactor * player.speed));
				return;
			}

			player.move(directionVector.scale(player.speed));
		});

		// Stop animations
		k.onMouseRelease(stopAnims);

		k.onKeyRelease(() => {
			stopAnims();
			stopDogAnims();
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

		//Sound Effects
		k.onCollide("player", "boundary", () => {
			k.play("boundary");
		});

		//Visuals
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

		setCamScale(k);

		k.onResize(() => {
			setCamScale(k);
		});

		//Dog movement
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
	});
}

k.go("loading");
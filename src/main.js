import { dialogueData, maps, music, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { dialogue, setCamScale, setCookie, getCookie } from "./utils";

const select_spawnpoint = document.getElementById("spawnpoint");
const spawnpoints_world_map = document.getElementById("spawnpoints");
const world_map = document.getElementById("world-map");
const showWorldMapBtn = document.getElementById("show-world-map");
let character = "character-male";
let spawnpoint;
let dogName;
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
	let button = document.createElement('button');
	button.className = "button";
	button.innerHTML = map.toUpperCase();
	button.addEventListener("click", () => {
		world_map.style.display = "none";
		showWorldMapBtn.innerHTML = "Weltkarte anzeigen (M)";
		k.go(map);
		game.focus();
	});
	spawnpoints_world_map.appendChild(button);
	k.loadSprite(map, `./maps/${map}.png`)
	setupScene(map, `./maps/${map}.json`, map);
}

const random_song = music[Math.floor(Math.random() * music.length)];
k.loadSound("bgm", `./sounds/music/${random_song}.mp3`);

//läd die Sounds im Hintergrund
k.loadSound("boundary", "./sounds/effects/sfx_spike_impact.mp3");
k.loadSound("talk", "./sounds/effects/talk.mp3");
k.loadSound("footstep", "./sounds/effects/sfx_player_footsteps.mp3");

//setzt die Hintergrundfarbe
k.setBackground(k.Color.fromHex("#311047"));

//LVL 0: SCENE LOADING
k.scene("loading", () => {
	const starting_screen = document.getElementById("starting-screen");
	const during_game = document.getElementsByClassName("during-game");
	const start_game = document.getElementById("start");
	const music_volume_slider = document.getElementById("music-volume");
	const sounds_volume = document.getElementById("sounds-volume");
	const male_button = document.getElementById("male-button");
	const female_button = document.getElementById("female-button");
	const game = document.getElementById("game");
	const dog_name_input = document.getElementById("dog-name");

	const lastSpawnpoint = getCookie("spawnpoint");
	const lastMusicVolume = getCookie("music_volume");
	const lastSoundEffectsVolume = getCookie("sound_effects_volume");
	const lastDogName = getCookie("dog_name");

	music_volume_slider.value = lastMusicVolume ? lastMusicVolume * 10 : 50;
	sounds_volume.value = lastSoundEffectsVolume ? lastSoundEffectsVolume * 10 : 50;
	select_spawnpoint.value = lastSpawnpoint ? lastSpawnpoint : maps[0];
	dog_name_input.value = lastDogName ? lastDogName : "Bello";

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
		const music_volume = music_volume_slider.value / 10;
		sound_effects_volume = sounds_volume.value / 10;
		spawnpoint = select_spawnpoint.value;
		dogName = dog_name_input.value;

		setCookie("spawnpoint", spawnpoint, 365);
		setCookie("music_volume", music_volume, 365);
		setCookie("sound_effects_volume", sound_effects_volume, 365);
		setCookie("dog_name", dogName, 365);

		const music = k.play("bgm", {
			volume: music_volume,
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

		//Lädt die Mapdaten
		const mapData = await (await fetch(mapFile)).json();
		const layers = mapData.layers;

		//Fügt die Karte hinzu, macht sie sichtbar und skaliert sie
		const map = k.add([k.sprite(mapSprite), k.pos(0), k.scale(scaleFactor)]);

		//Erstellt den Spieler
		const player = k.make([
			k.sprite(character, { anim: "idle-down" }),
			k.area({ shape: new k.Rect(k.vec2(0), 15, 30) }),
			k.body(),
			k.anchor("center"),
			k.pos(),
			k.z(9),
			k.scale(scaleFactor),
			{
				speed: 250,
				direction: "down",
				get isInDialogue() { return dialogue.inDialogue() },
				get score() { return dialogue.getScore() },
			},
			"player",
		]);

		//Erstellt den Hund
		const dog = k.make([
			k.sprite("dog-spritesheet", { anim: "dog-idle-side" }),
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
			k.text(dogName.toUpperCase(), { size: 18 }),
			k.pos(dog.pos.x, dog.pos.y - 50),
			{ followOffset: k.vec2(-20, -50) },
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
						let bounceOffset = 0;
						let bounceSpeed = 0.001;

						const exclamation = k.add([
							k.text("!", { size: 40 }),
							k.pos(boundary.x * scaleFactor, boundary.y * scaleFactor - 10),
							k.z(10),
							"exclamation",
						]);

						k.onUpdate("exclamation", (e) => {
							bounceOffset += bounceSpeed;
							if (bounceOffset > 0.1 || bounceOffset < -0.1) {
								bounceSpeed *= -1;
							}
							e.pos.y = e.pos.y + bounceOffset;
						});

						player.onCollide(boundary.name, () => {
							showWorldMapBtn.style.display = "none";
							k.destroy(exclamation);
							k.play("talk", {
								volume: sound_effects_volume,
							});
							if (walkingSound) {
								walkingSound.stop();
								walkingSound = null;
							}
							dialogue.display(
								dialogueData[boundary.name],
								() => (showWorldMapBtn.style.display = "flex", game.focus())
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
							if (walkingSound) {
								walkingSound.stop();
								walkingSound = null;
							}
							stopAnims();
							showWorldMapBtn.innerHTML = "Weltkarte anzeigen (M)";
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
		let walkingSound = false;

		k.onUpdate(() => {
			if (player.isInDialogue) return;
			if (isFullMapView) return;

			if (k.isKeyDown("left") || k.isKeyDown("right") || k.isKeyDown("up") || k.isKeyDown("down") || k.isKeyDown("a") || k.isKeyDown("d") || k.isKeyDown("w") || k.isKeyDown("s")) {
				if (!walkingSound) {
					walkingSound = k.play("footstep", { loop: true, volume: sound_effects_volume });
				}
			} else {
				if (walkingSound) {
					walkingSound.stop();
					walkingSound = null;
				}
			}

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

		//Visuals
		k.onUpdate(() => {
			k.camPos(player.worldPos().x, player.worldPos().y - 100);
		});

		// Show full world map while holding down m key
		k.onKeyDown("m", () => {
			isFullMapView = true;
			stopAnims();
			world_map.style.display = "flex";
		});
		// Return to player view when releasing m key
		k.onKeyRelease("m", () => {
			isFullMapView = false;
			world_map.style.display = "none";
		});

		showWorldMapBtn.addEventListener("click", () => {
			if (!isFullMapView) {
				isFullMapView = true;
				stopAnims();
				showWorldMapBtn.innerHTML = "Weltkarte verstecken (M)";
				world_map.style.display = "flex";
			} else {
				isFullMapView = false;
				showWorldMapBtn.innerHTML = "Weltkarte anzeigen (M)";
				document.getElementById("game").focus();
				world_map.style.display = "none";
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
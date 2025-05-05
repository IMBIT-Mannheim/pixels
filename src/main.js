import { dialogueData, maps, music, scaleFactor, mapMusic } from "./constants";
import { k } from "./kaboomCtx";
import { dialogue, setCamScale, refreshScoreUI, getCookie, setCookie } from "./utils";
import {defineCureScene, loadCureSprites} from "./cureMinigame.js";
import { sessionState, setSessionState, getSessionState, saveGame, loadGame, ensureSessionId } from "./sessionstate.js";

const spawnpoints_world_map = document.getElementById("spawnpoints");
const world_map = document.getElementById("world-map");
const showWorldMapBtn = document.getElementById("show-world-map");
const interactButton = document.getElementById("interact-button");
let character = "character-male";
let spawnpoint = "campus";
let characterName;
let dogName;
let sound_effects_volume = "0.5";

// Dog intro variables
let dogIntroActive = false;
let dogIntroStopDistance = 50;
let dogIntroSpeed = 200;
let dogFollowSpeed = 150;
let dogHasReachedPlayer = false;

// Tooltip variables
let gameplayTimer = 0;
let homeKeyTooltipTime = 0;
let homeKeyTooltipShown = false;
let debugTooltip = false; // For debugging

loadCureSprites();
defineCureScene();

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

	//change source to divchar1 if available
	k.loadSprite("character-divchar1", "./sprites/character-male.png", {
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
	
	//change source to div char 2 if available
	k.loadSprite("character-divchar2", "./sprites/character-female.png", {
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

	// Try to load foreground objects sprite if it exists
	// Check if the file exists first before attempting to load it
	const foregroundImg = new Image();
	foregroundImg.onerror = () => {
		console.log(`No foreground objects for ${map} (expected)`);
	};
	foregroundImg.onload = () => {
		// Only load the sprite if the image exists
		try {
			k.loadSprite(`${map}-ForegroundObjects`, `./maps/${map}-ForegroundObjects.png`);
			console.log(`Loaded foreground objects for ${map}`);
		} catch (e) {
			console.log(`Error loading foreground objects for ${map}`, e);
		}
	};
	// Set source last to trigger load
	foregroundImg.src = `./maps/${map}-ForegroundObjects.png`;

	// Load map-specific music
	const mapSpecificMusic = mapMusic[map] || music[Math.floor(Math.random() * music.length)];
	const musicFilePath = `./sounds/music/${encodeURIComponent(mapSpecificMusic)}.mp3`;
	k.loadSound(`bgm_${map}`, musicFilePath);
	setupScene(map, `./maps/${map}.json`, map);
}

const random_song = music[Math.floor(Math.random() * music.length)];
k.loadSound("bgm", `./sounds/music/${random_song}.mp3`);
k.loadSound(`bgm_cureMinigame`, "./sounds/music/CureMinigame.mp3");

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
	const divchar1_button = document.getElementById("divchar1-button");
	const divchar2_button = document.getElementById("divchar2-button");
	const game = document.getElementById("game");
	const character_name_input = document.getElementById("character-name");
	const dog_name_input = document.getElementById("dog-name");

	// Properly initialize session state
	console.log("Initializing session state...");
	ensureSessionId(); // Make sure we have a session ID first
	console.log("Session ID:", sessionState.sessionId);
	loadGame(); // Then load saved data
	refreshScoreUI();
	
	// Use sessionState for settings, with cookies as fallback
	const lastMusicVolume = sessionState.settings.musicVolume || getCookie("music_volume") || 0.5;
	const lastSoundEffectsVolume = sessionState.settings.soundEffectsVolume || getCookie("sound_effects_volume") || 0.5;
	const lastcharacterName = sessionState.settings.characterName || getCookie("characterName") || "New Student";
	const lastDogName = sessionState.settings.dogName || getCookie("dog_name") || "Bello";

	music_volume_slider.value = lastMusicVolume * 100;
	sounds_volume.value = lastSoundEffectsVolume * 100;
	character_name_input.value = lastcharacterName;
	dog_name_input.value = lastDogName;

	male_button.addEventListener("click", () => {
		character = "character-male";
		female_button.classList.remove("selected");
		divchar1_button.classList.remove("selected");
		divchar2_button.classList.remove("selected");
		male_button.classList.add("selected");
		game.focus();
	});

	female_button.addEventListener("click", () => {
		character = "character-female";
		male_button.classList.remove("selected");
		divchar1_button.classList.remove("selected");
		divchar2_button.classList.remove("selected");
		female_button.classList.add("selected");
		game.focus();
	});

	divchar1_button.addEventListener("click", () => {
		character = "character-divchar1";
		male_button.classList.remove("selected");
		female_button.classList.remove("selected");
		divchar2_button.classList.remove("selected");
		divchar1_button.classList.add("selected");
		game.focus();
	});

	
	divchar2_button.addEventListener("click", () => {
		character = "character-divchar2";
		male_button.classList.remove("selected");
		female_button.classList.remove("selected");
		divchar1_button.classList.remove("selected");
		divchar2_button.classList.add("selected");
		game.focus();
	});	

	let isVideoPlaying = false; // Variable, um den Zustand des Videos zu verfolgen

	// Event-Listener für den Start-Button
	start_game.addEventListener("click", () => {
		handleStart();
	});


	music_volume_slider.addEventListener("input", () => {
		const music_volume = music_volume_slider.value / 100;
	
		// Update volume for current playing background music
		if (window.currentBgm) {
			window.currentBgm.volume(music_volume);
		}
	
		// Update sessionState instead of setting a cookie
		sessionState.settings.musicVolume = music_volume;
		saveGame();
	
		game.focus();
	});
	
	// Event-Listener für Enter- und Leertaste
	k.onKeyPress(["enter", "space"], () => {
		handleStart();
	});
	
	function handleStart() {
		if (isVideoPlaying) return; // Prevent starting multiple times
	
		// Check from sessionState instead of cookie
		if (sessionState.settings.introWatched) {
			// Intro already watched, start game directly
			startGame();
		} else {
			// Intro not yet watched, show video
			showVideoScreen();
		}
	}
	

	function showVideoScreen() {
		isVideoPlaying = true; // Setze den Zustand auf "Video wird abgespielt"

		// Erstelle einen neuen Screen für das Video
		const videoScreen = document.createElement("div");
		videoScreen.id = "video-screen";
		videoScreen.style.position = "fixed";
		videoScreen.style.top = "0";
		videoScreen.style.left = "0";
		videoScreen.style.width = "100%";
		videoScreen.style.height = "100%";
		videoScreen.style.backgroundColor = "#311047";
		videoScreen.style.display = "flex";
		videoScreen.style.flexDirection = "row"; // Ermöglicht horizontale Anordnung
		videoScreen.style.justifyContent = "center";
		videoScreen.style.alignItems = "center";
		videoScreen.style.zIndex = "1000";

		// Füge einen Text über dem Video hinzu
		const textOverlay = document.createElement("div");
		textOverlay.innerText = "Intro zu IMBIT Pixel!";
		textOverlay.style.color = "white";
		textOverlay.style.fontSize = "48px";
		textOverlay.style.marginBottom = "20px";
		textOverlay.style.textAlign = "center";

		// Füge das Video-Element hinzu
		const video = document.createElement("video");
		video.src = "/videos/Intro.mp4";
		video.style.width = "80%";
		video.style.height = "auto";
		video.autoplay = true;
		video.controls = false;

		// Setze die Lautstärke des Videos basierend auf dem Musiklautstärke-Slider
		const musicVolume = music_volume_slider.value / 100; // Slider-Wert in einen Bereich von 0 bis 1 umwandeln
		video.volume = musicVolume;

		// Füge einen "Skip Intro"-Button als Pfeil hinzu
		const skipButton = document.createElement("button");
		skipButton.style.width = "256px"; // Breite des Buttons
		skipButton.style.height = "256px"; // Höhe des Buttons
		skipButton.style.background = "url('/images/skip-arrow.png') no-repeat center"; // Bild als Hintergrund
		skipButton.style.backgroundSize = "contain"; // Skaliere das Bild proportional
		skipButton.style.border = "none"; // Entferne den Rahmen
		skipButton.style.cursor = "pointer"; // Zeige den Mauszeiger als Hand an
		skipButton.style.marginLeft = "20px";
		skipButton.addEventListener("mouseover", () => {
			skipButton.style.transform = "scale(1.2) translate(2px, 2px)";
		});
		skipButton.addEventListener("mouseout", () => {
			skipButton.style.transform = "";
		});

		skipButton.addEventListener("click", () => {
			document.body.removeChild(videoScreen);
			isVideoPlaying = false; // Reset playing state
		
			// 🛠️ Set in sessionState instead of cookie
			sessionState.settings.introWatched = true;
			saveGame();
		
			startGame(); // Start the game
		});
		

		// Füge den Text und das Video zum Video-Container hinzu
		const videoContainer = document.createElement("div");
		videoContainer.style.display = "flex";
		videoContainer.style.flexDirection = "column";
		videoContainer.style.alignItems = "center";
		videoContainer.appendChild(textOverlay);
		videoContainer.appendChild(video);

		// Füge den Video-Container und den Button zum Screen hinzu
		videoScreen.appendChild(videoContainer);
		videoScreen.appendChild(skipButton);

		// Füge den Screen zum Dokument hinzu
		document.body.appendChild(videoScreen);

		video.addEventListener("ended", () => {
			document.body.removeChild(videoScreen);
			isVideoPlaying = false;
		
			sessionState.settings.introWatched = true;
			saveGame();
		
			startGame();
		});
		
		
	}

	function startGame() {
		const music_volume = music_volume_slider.value / 100; // Consistent volume calculation
		sound_effects_volume = sounds_volume.value / 100;
		spawnpoint = "campus"; // Always start at campus
		characterName = character_name_input.value;
		dogName = dog_name_input.value;

		dialogueData.dogInitial.title = dogName;
		
		// Update both cookies and sessionState
		setCookie("spawnpoint", spawnpoint, 365);
		setCookie("music_volume", music_volume, 365);
		setCookie("sound_effects_volume", sound_effects_volume, 365);
		setCookie("characterName", characterName, 365);
		setCookie("dog_name", dogName, 365);

		// Ensure we have a session ID
		ensureSessionId();
		
		// Update session state with all current settings
		sessionState.settings.spawnpoint = spawnpoint;
		sessionState.settings.musicVolume = music_volume;
		sessionState.settings.soundEffectsVolume = sound_effects_volume;
		sessionState.settings.dogName = dogName;
		sessionState.settings.characterName = characterName;
		sessionState.settings.character = character;
		saveGame();

		starting_screen.style.display = "none";
		for (let i = 0; i < during_game.length; i++) {
			during_game[i].style.display = "block";
		}
		
		// Add game-active class to body for CSS fallback
		document.body.classList.add('game-active');
		
		game.focus();
		
		// Check if dog intro has been done before
		const dogIntroDone = getCookie("dog_intro_done");
		if (!dogIntroDone) {
			dogIntroActive = true;
			window.showDogIntro = true;
		} else {
			dogIntroActive = false;
			window.showDogIntro = false;
		}
		
		if (getCookie("dog_initial_answered")) {
			window.showDogInitialDialogue = false;
		} else {
			window.showDogInitialDialogue = true;
		}
		
		k.go(spawnpoint);
	}
});

// Function to get appropriate spawnpoint names based on source map
function getSpawnPointNamesBySource(sourceMap) {
	if (!sourceMap) {
		return { player: "player", dog: "dog" }; // Default spawnpoints
	}
	
	return {
		player: `player-${sourceMap}`,
		dog: `dog-${sourceMap}`
	};
}

function setupScene(sceneName, mapFile, mapSprite) {
	k.scene(sceneName, async (sceneData = {}) => {
		let isFullMapView = false;  // Variable to track if in full map view
		const showDebugOverlay = false; // Set to true to enable debug overlay
		// Store default spawn positions
		let defaultPlayerSpawnPos = null;
		let defaultDogSpawnPos = null;

		// Check if home key tooltip has been shown before
		if (sessionState.tooltips && sessionState.tooltips.homeKeyShown) {
			homeKeyTooltipShown = true;
			console.log("Tooltip already shown in previous session"); // Debug log
		} else {
			console.log("Tooltip not shown yet"); // Debug log
		}
		
		// Set random time for tooltip (between 2-5 minutes)
		if (!homeKeyTooltipShown && homeKeyTooltipTime === 0) {
			// For debugging/testing - short time of 20-30 seconds
			homeKeyTooltipTime = k.rand(120, 300);
			console.log("Tooltip will show after", homeKeyTooltipTime, "seconds"); // Debug log
		}

		// Create debug overlay
		const debugOverlay = k.add([
			k.text("Debug Info: No interactive objects nearby", {
				size: 16,
				font: "monospace",
				styles: {
					fill: "#ff0000",
				}
			}),
			k.pos(10, 10),
			k.fixed(),
			k.z(200),
			k.opacity(showDebugOverlay ? 1 : 0), // Only visible when showDebugOverlay is true
			{
				updateDebug: function(msg) {
					this.text = msg;
				}
			}
		]);

		const music_volume = sessionState.settings.musicVolume || 0.5;

		// Play the map-specific background music
		const music = k.play("bgm_" + sceneName, {
			volume: music_volume, // Verwende die gleiche Lautstärke wie im Intro
			loop: true,
		});

		k.onSceneLeave(() => {
			music.stop();
		});



		//Lädt die Mapdaten
		const mapData = await (await fetch(mapFile)).json();
		const layers = mapData.layers;

		//Fügt die Karte hinzu, macht sie sichtbar und skaliert sie
		const map = k.add([k.sprite(mapSprite), k.pos(0), k.scale(scaleFactor)]);

		//Erstellt den Spieler
		const player = k.make([
			k.sprite(character, { anim: "idle-down" }),
			k.area({ shape: new k.Rect(k.vec2(0, 10), 14, 10) }),
			k.body(),
			k.anchor("center"),
			k.pos(),
			k.z(9),
			k.scale(scaleFactor),
			{
				speed: 250,
				sprintSpeed: 400, // Sprint speed when space is pressed
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

		//Erstellt den Spielername-Tag
		const playerNameTag = k.make([
			k.text(characterName.toUpperCase(), { 
				size: 16,
				font: "monospace",
				styles: {
					fill: k.Color.WHITE,
					outline: { width: 2, color: k.Color.BLACK }
				}
			}),
			k.pos(0, 0), // Initial position will be set in update function
			k.anchor("center"),
			k.z(15), // Higher than player (9) to ensure visibility
			{
				offset: k.vec2(0, -80), // Increased vertical offset to account for hitbox difference
				updatePosition() {
					// This method will be called in the update function
					this.pos = k.vec2(
						player.pos.x + this.offset.x,
						player.pos.y + this.offset.y
					);
				}
			},
		]);

		//Erstellt den Hundename-Tag
		const dogNameTag = k.make([
			k.text(dogName.toUpperCase(), { size: 18 }),
			k.pos(dog.pos.x, dog.pos.y - 50),
			{ followOffset: k.vec2(-20, -50) },
		]);

		if (dogIntroActive) {
			player.isFrozen = true;
		
			// Hund außerhalb spawnen
			dog.pos = k.vec2(k.width() / 2 / scaleFactor, k.height() / scaleFactor + 50);

			dog.isWaiting = true;
			k.wait(1.0, () => {
				dog.isWaiting = false;
			});
		} else {
			// Hund normale Position (direkt wie Spieler)
			dog.isWaiting = false;
		}

		// Intro-Update für den Hund
		dog.onUpdate(() => {
			if (dogIntroActive) {
				if (dog.isWaiting) return; // Dog is still waiting, do nothing
		
				const distance = dog.pos.dist(player.pos);
		
				if (distance > dogIntroStopDistance) {
					const direction = player.pos.sub(dog.pos).unit();
					dog.move(direction.scale(dogIntroSpeed));
		
					// Dog walking animation
					if (Math.abs(direction.x) > Math.abs(direction.y)) {
						dog.play("dog-walk-side");
						dog.flipX = direction.x < 0;
					} else if (direction.y < 0) {
						dog.play("dog-walk-up");
					} else {
						dog.play("dog-walk-down");
					}
				} else {
					// Dog has reached player
					dog.move(k.vec2(0));
					dogIntroActive = false;
					setCookie("dog_intro_done", true, 365); 
					window.showDogIntro = false;

					dogHasReachedPlayer = true;
					dog.speed = dogFollowSpeed; // Set normal speed
					
					const dogIntroDialogue = JSON.parse(JSON.stringify(dialogueData["dogInitial"])); // Tiefe Kopie

					// Ersetze {dogName} im Titel und Texten
					dogIntroDialogue.title = dogIntroDialogue.title.replace("{dogName}", dogName);
					dogIntroDialogue.text = dogIntroDialogue.text.replace("{dogName}", dogName);
					dogIntroDialogue.correctText = dogIntroDialogue.correctText.replace("{dogName}", dogName);
					dogIntroDialogue.wrongText = dogIntroDialogue.wrongText.replace("{dogName}", dogName);

					// Dann zeige den Dialog an
					dialogue.display(dogIntroDialogue, () => {
						player.isFrozen = false; // Spieler wieder freigeben
					});

		
					// Dog idle animation
					if (dog.pos.x < player.pos.x) {
						dog.flipX = false;
						dog.play("dog-idle-side");
					} else {
						dog.flipX = true;
						dog.play("dog-idle-side");
					}
		
					// Player idle animation towards dog
					const directionToDog = dog.pos.sub(player.pos);
					if (Math.abs(directionToDog.x) > Math.abs(directionToDog.y)) {
						if (directionToDog.x > 0) {
							player.flipX = true;
							player.play("idle-side");
							player.direction = "right";
						} else {
							player.flipX = false;
							player.play("idle-side");
							player.direction = "left";
						}
					} else {
						if (directionToDog.y > 0) {
							player.play("idle-down");
							player.direction = "down";
						} else {
							player.play("idle-up");
							player.direction = "up";
						}
					}
		
					player.isFrozen = false; // Unfreeze player now
				}
		
				return; // VERY IMPORTANT: stop update here!
			}
		
			// Normal "follow the player" code after intro
			const distance = dog.pos.dist(player.pos);
			const followDistance = 130;
			const maxDistance = 1200;
			let speed = dog.speed;
		
			if (distance > maxDistance + 150) {
				dog.pos = player.pos.clone();
			} else if (distance > maxDistance) {
				speed = 300;
			}
		
			if (distance > followDistance) {
				const direction = player.pos.sub(dog.pos).unit();
				dog.move(direction.scale(speed));
		
				// Dog walking animation
				if (Math.abs(direction.x) > Math.abs(direction.y)) {
					if (direction.x < 0) {
						dog.flipX = true;
						if (dog.curAnim() !== "dog-walk-side") dog.play("dog-walk-side");
					} else {
						dog.flipX = false;
						if (dog.curAnim() !== "dog-walk-side") dog.play("dog-walk-side");
					}
				} else {
					if (direction.y < 0) {
						if (dog.curAnim() !== "dog-walk-up") dog.play("dog-walk-up");
					} else {
						if (dog.curAnim() !== "dog-walk-down") dog.play("dog-walk-down");
					}
				}
			} else {
				// Dog idle animation based on previous direction
				if (dog.curAnim() !== "dog-idle-side") dog.play("dog-idle-side");
			}
		});
		

		function finishDogIntro() {
			// Hund stehen lassen
			dog.move(k.vec2(0));
		
			// Spieler freigeben
			player.isFrozen = false;
		
			// Hund Idle-Animation passend einstellen
			if (dog.pos.x < player.pos.x) {
				dog.flipX = false;
				dog.play("dog-idle-side");
			} else {
				dog.flipX = true;
				dog.play("dog-idle-side");
			}
		
			// Spieler Idle-Animation passend einstellen
			const directionToDog = dog.pos.sub(player.pos);
			if (Math.abs(directionToDog.x) > Math.abs(directionToDog.y)) {
				if (directionToDog.x > 0) {
					player.flipX = true;
					player.play("idle-side");
					player.direction = "right";
				} else {
					player.flipX = false;
					player.play("idle-side");
					player.direction = "left";
				}
			} else {
				if (directionToDog.y > 0) {
					player.play("idle-down");
					player.direction = "down";
				} else {
					player.play("idle-up");
					player.direction = "up";
				}
			}
		
			// Optional: Hier könnten wir auch gleich den ersten Dialog starten!
		}

		// Add foreground objects if they exist for this map
		// Find foreground group and layers
		const foregroundGroup = layers.find(layer => 
			layer.name === "ForegroundObjects" && layer.layers);

			// If the foreground group exists and at least one of the foreground layers exists
		if (foregroundGroup) {
			// Check if the required foreground layers exist
			const hasForegroundLayers = foregroundGroup.layers.some(layer => 
				layer.name === "ForegroundObjects01" || layer.name === "ForegroundObjects02");
			
			if (hasForegroundLayers) {
				// Safely check if we have the sprite loaded
				try {
					// Try to safely access assets
					const hasSprite = (
						k.assets && 
						k.assets.sprites && 
						k.assets.sprites[`${sceneName}-ForegroundObjects`]
					) || false;
					
					// Alternative check if direct access didn't work
					const canLoadSprite = (function() {
						try {
							// Try to get the sprite in a different way
							k.sprite(`${sceneName}-ForegroundObjects`);
							return true;
						} catch (e) {
							return false;
						}
					})();
					
					if (hasSprite || canLoadSprite) {
						// Add the foreground objects sprite with a higher z-index than player
						k.add([
							k.sprite(`${sceneName}-ForegroundObjects`), 
							k.pos(0), 
							k.scale(scaleFactor),
							k.z(20) // Higher z-index than player (9) so it renders above
						]);
						console.log(`Rendered foreground objects for ${sceneName}`);
					} else {
						console.log(`Foreground sprite not loaded for ${sceneName}, skipping render`);
					}
				} catch (error) {
					console.warn(`Could not check or render foreground for ${sceneName}:`, error);
				}
			}
		}

		// Main collision prevention handler - simplified and optimized
		let inBoundaryCollision = false;
		let boundaryCollisionTimer = 0;
		let lastSoundTime = 0;
		// lastSafePosition is declared later in the code

		// Set flag when collision starts
		k.onCollide("player", "boundary", () => {
			inBoundaryCollision = true;
		});
		
		// Reset flag when collision ends
		player.onCollideEnd("boundary", () => {
			inBoundaryCollision = false;
			boundaryCollisionTimer = 0;
			lastSoundTime = 0;
		});
		
		// Single update handler for all collision-related logic
		// This is much more efficient than multiple handlers
		k.onUpdate(() => {
			// Skip processing if player is in dialogue
			if (player.isInDialogue) return;
			
			// Track safe positions for boundary handling
			if (!inBoundaryCollision) {
				lastSafePosition = player.pos.clone();
			} else {
				// Handle sound
				boundaryCollisionTimer += k.dt();
				
				// Play sound at intervals
				if (boundaryCollisionTimer >= 0.5 && 
					(boundaryCollisionTimer - lastSoundTime >= 1.0 || lastSoundTime === 0)) {
					k.play("boundary", {
						volume: sound_effects_volume,
					});
					lastSoundTime = boundaryCollisionTimer;
				}
				
				// Simple collision resolution - only if significant movement detected
				const movementDist = player.pos.dist(lastSafePosition);
				if (movementDist > 8) { // Increased threshold to avoid jittery movement
					// Use a smoother approach - move partially back to safe position
					const moveBackRatio = 0.7; // Move back 70% of the way
					const targetPos = player.pos.lerp(lastSafePosition, moveBackRatio);
					player.pos = targetPos;
				}
			}
		});

		//Fügt die Collider hinzu und prüft, ob der collider einen Namen hat. Wenn ja, wird ein Dialog angezeigt. Der dialog wird in der Datei constants.js definiert.
		for (const layer of layers) {
			if (layer.name === "boundaries") {
				// Keep a collection of all boundaries for efficient culling
				const allBoundaries = [];
				const CULLING_RADIUS = 800; // Adjust this value based on viewport size

				for (const boundary of layer.objects) {
					// Create a boundary object with all necessary properties
					const boundaryObj = {
						area: {
							shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
						},
						isStatic: true,
						pos: k.vec2(boundary.x, boundary.y),
						rotation: boundary.rotation,
						name: boundary.name,
						width: boundary.width,
						height: boundary.height,
						gameObj: null, // Will store the actual game object reference
						isVisible: false, // Track visibility state
						exclamation: null, // Reference to exclamation mark if needed
						interactionPrompt: null, // Reference to interaction prompt if needed
					};
					
					allBoundaries.push(boundaryObj);

					// Initial creation is handled later in the culling logic
				}

				// Set up a culling system that runs on each frame
				k.onUpdate(() => {
					// Skip culling if player is in dialogue
					if (player.isInDialogue) return;
					
					
					// Get player position - need to use world position for proper comparison
					const playerPos = player.worldPos();
					
					// Process each boundary
					for (const boundaryObj of allBoundaries) {
						// Calculate boundary center position in world space
						const boundaryWorldPos = k.vec2(
							boundaryObj.pos.x * scaleFactor,
							boundaryObj.pos.y * scaleFactor
						);
						
						// Calculate distance from player to boundary center
						const distance = playerPos.dist(boundaryWorldPos);
						
						// Check if boundary should be visible (within culling radius)
						const shouldBeVisible = distance <= CULLING_RADIUS;
						
						// If visibility status changed, add or remove the boundary
						if (shouldBeVisible !== boundaryObj.isVisible) {
							if (shouldBeVisible) {
								// Create and add the boundary to the map
								const newObj = map.add([
									k.area(boundaryObj.area),
									k.body({ isStatic: boundaryObj.isStatic }),
									k.pos(boundaryObj.pos.x, boundaryObj.pos.y),
									k.rotate(boundaryObj.rotation),
									boundaryObj.name,
								]);
								
								boundaryObj.gameObj = newObj;
								
								// If this boundary has a name (interactive), create the interaction elements
								if (boundaryObj.name !== "boundary") {
									let bounceOffset = 0;
									let bounceSpeed = 0.001;
									let isInProximity = false;
									const INTERACTION_RADIUS = 170;
									let promptTimer = 0;
									const PROMPT_DELAY = 1;

									// Create exclamation mark
									boundaryObj.exclamation = k.add([
										k.text("!", { size: 40 }),
										k.pos(boundaryObj.pos.x * scaleFactor, boundaryObj.pos.y * scaleFactor - 10),
										k.z(10),
										k.color(k.Color.WHITE),
										"exclamation"
									]);

									// Create interaction prompt (initially invisible)
									boundaryObj.interactionPrompt = k.add([
										k.rect(300, 50, { radius: 10 }), // Background with rounded corners
										k.color(0, 0, 0, 0.8), // More opaque black background
										k.pos(k.width() / 2 - 150, 70), // Position at top center immediately
										k.fixed(), // This makes it stay fixed on screen
										k.z(100), // Much higher z-index to ensure visibility
										k.opacity(0),
										"interactionPrompt"
									]);
									
									// Add text on top of the background
									boundaryObj.promptText = k.add([
										k.text("Press T to interact", { 
											size: 24, // Larger text size for better visibility
											font: "monospace",
											styles: {
												fill: "#ffffff",
											}
										}),
										k.pos(k.width() / 2, 85), // Position at top center immediately
										k.anchor("center"), // Center the text
										k.fixed(), // This makes it stay fixed on screen
										k.z(101), // Higher z-index than the background
										k.opacity(0),
										"promptText"
									]);

									// Add exclamation mark update logic
									const exclamationUpdateEvent = k.onUpdate("exclamation", (e) => {
										// Only process if this is the right exclamation mark
										if (e !== boundaryObj.exclamation) return;
										
										bounceOffset += bounceSpeed;
										if (bounceOffset > 0.1 || bounceOffset < -0.1) {
											bounceSpeed *= -1;
										}
										e.pos.y = e.pos.y + bounceOffset;

										// Check proximity and update prompt visibility
										const dist = player.pos.dist(k.vec2(boundaryObj.pos.x * scaleFactor, boundaryObj.pos.y * scaleFactor));
										if (dist <= INTERACTION_RADIUS && !player.isInDialogue) {
											// Update debug overlay
											debugOverlay.updateDebug(`In range of: ${boundaryObj.name} (Distance: ${Math.floor(dist)}, Timer: ${promptTimer.toFixed(1)}s)`);
											
											if (!isInProximity) {
												isInProximity = true;
												promptTimer = 0; // Reset timer when entering proximity
											}
											
											// Increment timer while in range
											promptTimer += k.dt();
											
											// Only show the prompt after PROMPT_DELAY seconds
											if (promptTimer >= PROMPT_DELAY) {
												// Show the HTML interaction button
												interactButton.style.display = "block";
											}
											
										} else {
											if (isInProximity) {
												isInProximity = false;
												// Hide the HTML interaction button
												interactButton.style.display = "none";
												promptTimer = 0; // Reset timer when leaving proximity
											}
										}
									});
									
									// Store event ID for cleanup
									boundaryObj.exclamationUpdateEvent = exclamationUpdateEvent;

									// Handle T key press for this boundary
									k.onKeyPress("t", () => {
										const dist = player.pos.dist(k.vec2(boundaryObj.pos.x * scaleFactor, boundaryObj.pos.y * scaleFactor));
										if (dist <= INTERACTION_RADIUS && !player.isInDialogue) {
											showWorldMapBtn.style.display = "none";
											// Hide the interaction button
											interactButton.style.display = "none";
											if (boundaryObj.exclamation) k.destroy(boundaryObj.exclamation);
											if (boundaryObj.interactionPrompt) k.destroy(boundaryObj.interactionPrompt);
											if (boundaryObj.promptText) k.destroy(boundaryObj.promptText);
											k.play("talk", {
												volume: sound_effects_volume,
											});
											if (walkingSound) {
												walkingSound.stop();
												walkingSound = null;
											}

											// Allow the user to open cure minigame, when he selects "Yes" in the relevant dialogue
											if (boundaryObj.name === "sportscar") {
												dialogue.setQuestionButtonClickListener((buttonIndex) => {
													dialogue.setQuestionButtonClickListener(null);
													if (buttonIndex === 1) {
														dialogue._close_or_next();
														k.go("cure_minigame");
													}
												});
												dialogue.display(
													dialogueData[boundaryObj.name],
													() => ((showWorldMapBtn.style.display = "flex"), game.focus())
												);
												return;
											}
											dialogue.display(
												dialogueData[boundaryObj.name],
												() => (showWorldMapBtn.style.display = "flex", game.focus())
											);
										}
									});
								}
							} else {
								// Remove the boundary from the game
								if (boundaryObj.gameObj) {
									k.destroy(boundaryObj.gameObj);
									boundaryObj.gameObj = null;
								}
								
								// Clean up interaction elements if they exist
								if (boundaryObj.exclamation) {
									k.destroy(boundaryObj.exclamation);
									boundaryObj.exclamation = null;
								}
								
								if (boundaryObj.interactionPrompt) {
									k.destroy(boundaryObj.interactionPrompt);
									boundaryObj.interactionPrompt = null;
								}
								
								if (boundaryObj.promptText) {
									k.destroy(boundaryObj.promptText);
									boundaryObj.promptText = null;
								}
							}
							
							// Update visibility flag
							boundaryObj.isVisible = shouldBeVisible;
						}
					}
				});
				
				continue;
			}

			// Handle collision layer
			if (layer.name === "Collisions") {
				const tileSize = 16; // Tile size in pixels
				const mapWidth = layer.width;
				const mapHeight = layer.height;
				
				// Convert the 1D array to a 2D array for easier processing
				const collisionData = [];
				for (let y = 0; y < mapHeight; y++) {
					const row = [];
					for (let x = 0; x < mapWidth; x++) {
						row.push(layer.data[y * mapWidth + x]);
					}
					collisionData.push(row);
				}

				// Create a collection to store all collision tiles for culling
				const allCollisionTiles = [];
				const COLLISION_CULLING_RADIUS = 800; // Adjust based on game needs

				// Prepare all potential collision tiles
				for (let y = 0; y < mapHeight; y++) {
					for (let x = 0; x < mapWidth; x++) {
						if (collisionData[y][x] !== 0) {
							// Create a tile object with necessary properties
							const tileObj = {
								pos: k.vec2(x * tileSize * scaleFactor, y * tileSize * scaleFactor),
								gameObj: null,
								isVisible: false
							};
							
							allCollisionTiles.push(tileObj);
						}
					}
				}

				// Set up culling for collision tiles
				k.onUpdate(() => {
					// Skip if player is in dialogue
					if (player.isInDialogue) return;
					
					// Get player position for distance calculations
					const playerPos = player.worldPos();
					
					// Process each collision tile
					for (const tileObj of allCollisionTiles) {
						// Calculate distance from player to tile
						const distance = playerPos.dist(tileObj.pos);
						
						// Check if tile should be visible
						const shouldBeVisible = distance <= COLLISION_CULLING_RADIUS;
						
						// If visibility changed, add or remove the tile
						if (shouldBeVisible !== tileObj.isVisible) {
							if (shouldBeVisible) {
								// Create and add the collision tile
								tileObj.gameObj = k.add([
									k.area({
										shape: new k.Rect(k.vec2(0), tileSize * scaleFactor, tileSize * scaleFactor),
									}),
									k.body({ isStatic: true }),
									k.pos(tileObj.pos.x, tileObj.pos.y),
									"boundary",
								]);
							} else {
								// Remove the tile
								if (tileObj.gameObj) {
									k.destroy(tileObj.gameObj);
									tileObj.gameObj = null;
								}
							}
							
							// Update visibility flag
							tileObj.isVisible = shouldBeVisible;
						}
					}
				});
				
				continue;
			}

			if (layer.name === "goto") {
				for (const boundary of layer.objects) {
				  map.add([
					k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
					k.body({ isStatic: true }),
					k.pos(boundary.x, boundary.y),
					k.rotate(boundary.rotation),
					boundary.name,
				  ]);
			  
				  if (boundary.name) {
					player.onCollide(boundary.name, () => {
						  // pass along the scene we're coming from
					  k.go(boundary.name, { from: sceneName });
			  
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
				// Get appropriate spawnpoint names based on source map
				const { player: playerSpawnName, dog: dogSpawnName } = getSpawnPointNamesBySource(sceneData.from);
				
				// Store specific and default spawn points
				let specificPlayerSpawn = null;
				let specificDogSpawn = null;
				let defaultPlayerSpawn = null;
				let defaultDogSpawn = null;
				
				// First, find all possible spawn points
				for (const entity of layer.objects) {
					if (entity.name === playerSpawnName) {
						specificPlayerSpawn = entity;
					}
					else if (entity.name === dogSpawnName) {
						specificDogSpawn = entity;
					}
					else if (entity.name === "player") {
						defaultPlayerSpawn = entity;
						// Store the default player spawn position for the "h" key teleport feature
						defaultPlayerSpawnPos = k.vec2(
							(map.pos.x + defaultPlayerSpawn.x) * scaleFactor,
							(map.pos.y + defaultPlayerSpawn.y) * scaleFactor
						);
					}
					else if (entity.name === "dog") {
						defaultDogSpawn = entity;
						// Store the default dog spawn position for the "h" key teleport feature
						defaultDogSpawnPos = k.vec2(
							(map.pos.x + defaultDogSpawn.x) * scaleFactor,
							(map.pos.y + defaultDogSpawn.y) * scaleFactor
						);
					}
				}
				
				// Use specific spawn points if available, otherwise fall back to defaults
				const playerSpawn = specificPlayerSpawn || defaultPlayerSpawn;
				const dogSpawn = specificDogSpawn || defaultDogSpawn;
				
				// Position player
				if (playerSpawn) {
					player.pos = k.vec2(
						(map.pos.x + playerSpawn.x) * scaleFactor,
						(map.pos.y + playerSpawn.y) * scaleFactor
					);
					k.add(player);
					k.add(playerNameTag);
				}
				
				// Position dog
				if (dogSpawn) {
					dog.pos = k.vec2(
						(map.pos.x + dogSpawn.x) * scaleFactor,
						(map.pos.y + dogSpawn.y) * scaleFactor
					);
					k.add(dog);
					k.add(dogNameTag);
				}
			}
		}

		//Bewegung des Spielers mit der Maus
		k.onMouseDown((mouseBtn) => {
			if (isFullMapView) return; // Disable player movement when in full map view
			if (mouseBtn !== "left" || player.isInDialogue || player.isFrozen) return;

			const worldMousePos = k.toWorld(k.mousePos());
			const currentSpeed = k.isKeyDown("space") ? player.sprintSpeed : player.speed;
			
			// Store player's position before mouse movement
			if (!inBoundaryCollision) {
				lastSafePosition = player.pos.clone();
			}
			
			// Calculate direction vector for smoother movement handling
			const direction = worldMousePos.sub(player.pos).unit();
			
			// Use moveTo with the calculated direction for better control
			player.moveTo(worldMousePos, currentSpeed);

			// Update animation based on movement direction
			const mouseAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;

			// More precise angle calculations with animation checks
			if (mouseAngle > -45 && mouseAngle < 45) {
				// Moving right
				player.flipX = false;
				if (player.curAnim() !== "walk-side") {
					player.play("walk-side");
				}
				player.direction = "right";
			} 
			else if (mouseAngle >= 45 && mouseAngle <= 135) {
				// Moving down
				if (player.curAnim() !== "walk-down") {
					player.play("walk-down");
				}
				player.direction = "down";
			}
			else if (mouseAngle > 135 || mouseAngle < -135) {
				// Moving left
				player.flipX = true;
				if (player.curAnim() !== "walk-side") {
					player.play("walk-side");
				}
				player.direction = "left";
			}
			else if (mouseAngle >= -135 && mouseAngle <= -45) {
				// Moving up
				if (player.curAnim() !== "walk-up") {
					player.play("walk-up");
				}
				player.direction = "up";
			}
		});

		//Player movement with keyboard
		const diagonalFactor = 1 / Math.sqrt(2);
		let walkingSound = false;
		
		// Keep track of last non-colliding position for both keyboard and mouse movement
		let lastSafePosition = player.pos.clone();

		// Optimized player movement handler
		k.onUpdate(() => {
			// Early returns for better performance
			if (player.isInDialogue || isFullMapView || player.isFrozen) return;
			
			// Store last safe position if not currently colliding with boundary
			if (!inBoundaryCollision) {
				lastSafePosition = player.pos.clone();
			}

			// Handle walking sound with a simplified check
			const isMoving = k.isKeyDown("left") || k.isKeyDown("right") || 
				k.isKeyDown("up") || k.isKeyDown("down") || 
				k.isKeyDown("a") || k.isKeyDown("d") || 
				k.isKeyDown("w") || k.isKeyDown("s");
				
			if (isMoving) {
				if (!walkingSound) {
					walkingSound = k.play("footstep", { loop: true, volume: sound_effects_volume });
				}
			} else if (walkingSound) {
				walkingSound.stop();
				walkingSound = null;
			}

			// Only process movement if actually moving
			if (!isMoving) return;
			
			// Create movement vector - optimized to avoid redundant checks
			const directionVector = k.vec2(0, 0);
			let animationChanged = false;
			
			// Vertical movement takes priority for diagonal movement
			if (k.isKeyDown("up") || k.isKeyDown("w")) {
				directionVector.y = -1;
				if (player.curAnim() !== "walk-up") {
					player.play("walk-up");
				}
				player.direction = "up";
				animationChanged = true;
			} else if (k.isKeyDown("down") || k.isKeyDown("s")) {
				directionVector.y = 1;
				if (player.curAnim() !== "walk-down") {
					player.play("walk-down");
				}
				player.direction = "down";
				animationChanged = true;
			}
			
			// Horizontal movement
			if (k.isKeyDown("left") || k.isKeyDown("a")) {
				directionVector.x = -1;
				if (!animationChanged) {
					player.flipX = false;
					player.direction = "left";
					if (player.curAnim() !== "walk-side") {
						player.play("walk-side");
					}
				}
			} else if (k.isKeyDown("right") || k.isKeyDown("d")) {
				directionVector.x = 1;
				if (!animationChanged) {
					player.flipX = true;
					player.direction = "right";
					if (player.curAnim() !== "walk-side") {
						player.play("walk-side");
					}
				}
			}

			// Apply movement
			const moveSpeed = k.isKeyDown("space") ? player.sprintSpeed : player.speed;
			const finalSpeed = directionVector.x && directionVector.y ? 
				moveSpeed * diagonalFactor : moveSpeed;
			
			player.move(directionVector.scale(finalSpeed));
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

		// Tooltip timer update with improved logging
		k.onUpdate(() => {
			// Skip updating timer if tooltip already shown or player is in dialogue
			if (homeKeyTooltipShown || player.isInDialogue || player.isFrozen || isFullMapView) {
				return;
			}
			
			// Increment gameplay timer
			gameplayTimer += k.dt();
			
			// Log progress occasionally for debugging
			if (Math.floor(gameplayTimer) % 10 === 0 && Math.floor(gameplayTimer) !== 0 && !debugTooltip) {
				console.log("Gameplay timer:", Math.floor(gameplayTimer), "/ Target:", homeKeyTooltipTime);
				debugTooltip = true;
			} else if (Math.floor(gameplayTimer) % 10 !== 0) {
				debugTooltip = false;
			}
			
			// Check if it's time to show the tooltip
			if (gameplayTimer >= homeKeyTooltipTime) {
				console.log("Time to show tooltip!");
				showHomeKeyTooltip();
			}
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

		//player movement
		playerNameTag.onUpdate(() => {
			// Use the custom method to update position
			playerNameTag.updatePosition();
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
			const maxDistance = 1200;
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

			if (window.showDogInitialDialogue) {
				dialogue.display(dialogueData.dogInitial, () => {
					setCookie("dog_initial_answered", true, 365);
				});
				window.showDogInitialDialogue = false;
			}
		});

		// Return to spawn points when "h" key is pressed
		k.onKeyPress("h", () => {
			if (player.isInDialogue || player.isFrozen) return;
			
			// If already on campus map, just return to spawn point
			if (sceneName === "campus" && defaultPlayerSpawnPos && defaultDogSpawnPos) {
				// Teleport player to default spawn
				player.pos = defaultPlayerSpawnPos.clone();
				
				// Teleport dog to default spawn
				dog.pos = defaultDogSpawnPos.clone();
				
				// Play a sound effect for feedback
				k.play("boundary", {
					volume: sound_effects_volume,
				});
				
				// Reset animations to idle based on direction
				stopAnims();
				stopDogAnims();
				
				// Reset any boundary collision state
				inBoundaryCollision = false;
				boundaryCollisionTimer = 0;
				lastSoundTime = 0;
				
				// Create retro-style background for text
				const bgBox = k.add([
					k.rect(340, 48, { radius: 0 }), // Rectangular box with no rounded corners for retro look
					k.color(k.Color.fromHex("#311047")), // Match the game's primary background color
					k.pos(player.pos.x, player.pos.y - 60),
					k.anchor("center"),
					k.opacity(0.85),
					k.outline(4, k.Color.fromHex("#8a2be2")), // Purple pixel-art style border
					k.lifespan(1.6, { fade: 0.6 }),
					k.z(99)
				]);
				
				// Retro pixel-style text
				k.add([
					k.text("* RETURNED TO CAMPUS *", { 
						size: 22, 
						font: "monospace", // Monospace for more pixelated look
						styles: {
							fill: k.Color.fromHex("#ffffff"),
							outline: { width: 2, color: k.Color.fromHex("#000000") } // Retro text outline
						}
					}),
					k.pos(player.pos.x, player.pos.y - 60),
					k.anchor("center"),
					k.opacity(1), // Add opacity component for lifespan fade to work
					k.lifespan(1.5, { fade: 0.5 }),
					k.z(100)
				]);
			} else {
				// Not on campus, so switch to campus scene
				if (walkingSound) {
					walkingSound.stop();
					walkingSound = null;
				}
				
				// Create retro-style background for transition message
				const transitionBox = k.add([
					k.rect(400, 60, { radius: 0 }), // Rectangular box with no rounded corners
					k.color(k.Color.fromHex("#311047")), // Match game's background
					k.outline(4, k.Color.fromHex("#8a2be2")), // Purple pixel-art style border
					k.anchor("center"),
					k.pos(k.width() / 2, k.height() / 2),
					k.fixed(),
					k.opacity(0.85),
					k.lifespan(1.1, { fade: 0.5 }),
					k.z(99)
				]);
				
				// Retro style teleport message
				k.add([
					k.text("* TELEPORTING TO CAMPUS *", { 
						size: 22, 
						font: "monospace", // Monospace for more pixelated look
						styles: {
							fill: k.Color.fromHex("#ffffff"),
							outline: { width: 2, color: k.Color.fromHex("#000000") } // Retro text outline
						}
					}),
					k.anchor("center"),
					k.pos(k.width() / 2, k.height() / 2),
					k.fixed(),
					k.z(100),
					k.opacity(1),
					k.lifespan(1, { fade: 0.5 }),
				]);
				
				// Brief pause and then go to campus
				k.wait(0.5, () => {
					k.go("campus", { from: sceneName });
				});
			}
		});

		// Function to show "Return Home" tooltip in retro style
		function showHomeKeyTooltip() {
			if (homeKeyTooltipShown) return;
			
			console.log("Showing home key tooltip!"); // Debug log
			homeKeyTooltipShown = true;
			
			// Save to session state
			sessionState.tooltips = sessionState.tooltips || {};
			sessionState.tooltips.homeKeyShown = true;
			saveGame();
			
			// Background box for tooltip
			const tooltipBox = k.add([
				k.rect(440, 100, { radius: 0 }), // Rectangular box for retro style
				k.color(k.Color.fromHex("#311047")), // Match game's background
				k.outline(4, k.Color.fromHex("#8a2be2")), // Purple pixel-art style border
				k.anchor("center"),
				k.pos(k.width() / 2, k.height() / 2),
				k.fixed(),
				k.opacity(0.95),
				k.z(150),
			]);
			
			// Header text
			const tooltipHeader = k.add([
				k.text("NEW ABILITY UNLOCKED!", { 
					size: 24, 
					font: "monospace",
					styles: {
						fill: k.Color.fromHex("#ffffff"),
						outline: { width: 2, color: k.Color.fromHex("#000000") }
					}
				}),
				k.anchor("center"),
				k.pos(k.width() / 2, k.height() / 2 - 25),
				k.fixed(),
				k.opacity(1),
				k.z(151),
			]);
			
			// Instruction text
			const tooltipText = k.add([
				k.text("Press H key to return to campus", { 
					size: 20, 
					font: "monospace",
					styles: {
						fill: k.Color.fromHex("#ffff00"), // Yellow text for emphasis
						outline: { width: 2, color: k.Color.fromHex("#000000") }
					}
				}),
				k.anchor("center"),
				k.pos(k.width() / 2, k.height() / 2 + 15),
				k.fixed(),
				k.opacity(1),
				k.z(151),
			]);
			
			// Create a continue prompt
			const continuePrompt = k.add([
				k.text("Press any key to continue", { 
					size: 16, 
					font: "monospace",
					styles: {
						fill: k.Color.fromHex("#aaaaaa"),
					}
				}),
				k.anchor("center"),
				k.pos(k.width() / 2, k.height() / 2 + 50),
				k.fixed(),
				k.opacity(1),
				k.z(151),
			]);
			
			// Make continue text blink
			let blinkTimer = 0;
			const blinkInterval = k.onUpdate(() => {
				blinkTimer += k.dt();
				if (blinkTimer > 0.5) {
					continuePrompt.opacity = continuePrompt.opacity === 1 ? 0 : 1;
					blinkTimer = 0;
				}
			});
			
			// Pause the game while tooltip is showing
			const playerWasFrozen = player.isFrozen;
			player.isFrozen = true;
			
			// Listen for any key to dismiss
			const keyHandler = k.onKeyPress(() => {
				tooltipBox.destroy();
				tooltipHeader.destroy();
				tooltipText.destroy();
				continuePrompt.destroy();
				k.onUpdate(blinkInterval, () => {});
				k.onKeyPress(keyHandler, () => {});
				player.isFrozen = playerWasFrozen;
			});
		}
	});
}

k.go("loading");

// For testing, add a key to force show the tooltip
k.onKeyPress("t", () => {
	if (k.isKeyDown("shift")) {
		showHomeKeyTooltip();
	}
});

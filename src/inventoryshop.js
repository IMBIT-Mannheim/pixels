import { k } from "./kaboomCtx.js";
import { sessionState, saveGame, decreaseSecureScore } from "./sessionstate.js";
import { refreshScoreUI } from "./utils.js";

// Function to load all avatar sprites with animations
export function loadAvatarSprites() {
    // Base animations configuration
    const baseAnims = {
        sliceX: 3,
        sliceY: 3,
        anims: {
            "idle-down": 0,
            "idle-up": 3,
            "idle-side": 6,
            "walk-down": { from: 0, to: 2, loop: true, speed: 8 },
            "walk-up": { from: 3, to: 5, loop: true, speed: 8 },
            "walk-side": { from: 6, to: 8, loop: true, speed: 8 },
        }
    };

    // Load all avatar sprites
    k.loadSprite("character-male-paid", "./sprites/avatars/character-male-paid.png", baseAnims);
    k.loadSprite("character-male", "./sprites/avatars/male.png", baseAnims);
    k.loadSprite("character-female", "./sprites/avatars/female.png", baseAnims);
    k.loadSprite("character-male-dblonde", "./sprites/avatars/male_dblonde.png", baseAnims);
    k.loadSprite("character-male-dbrown", "./sprites/avatars/male_dbrown.png", baseAnims);
    k.loadSprite("character-male-mblonde", "./sprites/avatars/male_mblonde.png", baseAnims);
    k.loadSprite("character-male-mbrown", "./sprites/avatars/male_mbrown.png", baseAnims);
    k.loadSprite("character-male-wb", "./sprites/avatars/male_wb.png", baseAnims);
    k.loadSprite("character-female-dblonde", "./sprites/avatars/female_dblonde.png", baseAnims);
    k.loadSprite("character-female-dbrown", "./sprites/avatars/female_dbrown.png", baseAnims);
    k.loadSprite("character-female-lblonde", "./sprites/avatars/female_lblonde.png", baseAnims);
    k.loadSprite("character-female-mblonde", "./sprites/avatars/female_mblonde.png", baseAnims);
    k.loadSprite("character-female-mbrown", "./sprites/avatars/female_mbrown.png", baseAnims);
    k.loadSprite("steel-boy-shop", "./sprites/avatars/steel_boy_shop.png", baseAnims);
    k.loadSprite("steel-girl-shop", "./sprites/avatars/steel_girl_shop.png", baseAnims);
    // k.loadSprite("ghost", "./sprites/avatars/ghost_shop.png", baseAnims);
}

// Shop items configuration
const SHOP_ITEMS = [
    {
        id: "character-male-paid",
        name: "Premium Male Character",
        description: "Unlock an exclusive male character skin",
        price: 1,
        type: "character",
        image: "./sprites/avatars/character-male-paid.png"
    },
   {
        id: "steel-boy-shop",
        name: "Steel Boy",
        description: "Unlock the Steel Boy character",
        price: 1,
        type: "character",
        image: "./sprites/avatars/steel_boy_shop.png"
   },
   {
        id: "steel-girl-shop",
        name: "Steel Girl",
        description: "Unlock the Steel Girl character",
        price: 1,
        type: "character",
        image: "./sprites/avatars/steel_girl_shop.png"
   }
//    , {
//         id: "ghost",
//         name: "Ghost",
//         description: "Unlock the Ghost character",
//         price: 1,
//         type: "character",
//         image: "./sprites/avatars/ghost.png"
//    }
];


// Main function to initialize the inventory and shop UI
export function initInventoryShop() {
    const inventoryShop = document.getElementById("inventory-shop");
    const inventoryShopContainer = inventoryShop.querySelector(".inventory-shop-container");

    // Clear previous content
    while (inventoryShopContainer.children.length > 1) { // keep the title
        inventoryShopContainer.removeChild(inventoryShopContainer.lastChild);
    }

    // Create container for shop and inventory
    const contentContainer = document.createElement("div");
    contentContainer.className = "inventory-shop-content";
    contentContainer.style.display = "flex";
    contentContainer.style.width = "100%";
    contentContainer.style.height = "80%";
    contentContainer.style.justifyContent = "space-around";
    contentContainer.style.padding = "20px";
    contentContainer.style.boxSizing = "border-box";
    inventoryShopContainer.appendChild(contentContainer);

    // Create the shop section
    const shopSection = document.createElement("div");
    shopSection.className = "shop-section";
    shopSection.style.width = "45%";
    shopSection.style.border = "3px solid #ffd700";
    shopSection.style.padding = "15px";
    shopSection.style.borderRadius = "10px";
    shopSection.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    shopSection.style.boxSizing = "border-box";
    contentContainer.appendChild(shopSection);

    // Shop title
    const shopTitle = document.createElement("h3");
    shopTitle.textContent = "Shop";
    shopTitle.style.color = "#ffd700";
    shopTitle.style.textAlign = "center";
    shopTitle.style.marginBottom = "15px";
    shopSection.appendChild(shopTitle);

    // Shop items container
    const shopItemsContainer = document.createElement("div");
    shopItemsContainer.style.display = "flex";
    shopItemsContainer.style.flexDirection = "column";
    shopItemsContainer.style.gap = "15px";
    shopItemsContainer.style.overflowY = "auto";
    shopItemsContainer.style.maxHeight = "70vh";
    shopSection.appendChild(shopItemsContainer);

    // Create the inventory section
    const inventorySection = document.createElement("div");
    inventorySection.className = "inventory-section";
    inventorySection.style.width = "45%";
    inventorySection.style.border = "3px solid #ffd700";
    inventorySection.style.padding = "15px";
    inventorySection.style.borderRadius = "10px";
    inventorySection.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    inventorySection.style.boxSizing = "border-box";
    contentContainer.appendChild(inventorySection);

    // Inventory title
    const inventoryTitle = document.createElement("h3");
    inventoryTitle.textContent = "Inventory";
    inventoryTitle.style.color = "#ffd700";
    inventoryTitle.style.textAlign = "center";
    inventoryTitle.style.marginBottom = "15px";
    inventorySection.appendChild(inventoryTitle);

    // Inventory items container
    const inventoryItemsContainer = document.createElement("div");
    inventoryItemsContainer.style.display = "flex";
    inventoryItemsContainer.style.flexDirection = "column";
    inventoryItemsContainer.style.gap = "15px";
    inventoryItemsContainer.style.overflowY = "auto";
    inventoryItemsContainer.style.maxHeight = "70vh";
    inventoryItemsContainer.id = "inventory-items-container";
    inventorySection.appendChild(inventoryItemsContainer);



    if(!document.getElementById("remove-items-button")) {
        const removeButton = document.createElement("div");
        removeButton.innerText = "Return to default character";
        removeButton.id = "remove-items-button"
        removeButton.className = "button-no-hover";
        removeButton.style.marginBottom = "25px";
        removeButton.addEventListener("click", takeOffItem)
        document.getElementById("inventory-items-container").appendChild(removeButton);

        if (sessionState.inventory.activeCharacter == null) {
            removeButton.style.display = "none";
        }
    }

    // Add default character to inventory
    /*
    const defaultMaleCharacter = {
        id: "character-male",
        name: "Male Character",
        description: "Your default character",
        type: "character",
        image: "./sprites/character-male.png"
    };

    const defaultFemaleCharacter = {
        id: "character-female",
        name: "Female Character",
        description: "Your default character",
        type: "character",
        image: "./sprites/character-female.png"
    };

    // Add the appropriate default character(s)
    if (sessionState.settings.character === "character-male" ||
        sessionState.settings.character === "character-male-paid") {
        renderInventoryItem(defaultMaleCharacter, inventoryItemsContainer);
    } else {
        renderInventoryItem(defaultFemaleCharacter, inventoryItemsContainer);
    }*/

    // Add purchased items to inventory
    if (sessionState.inventory.purchasedItems.length > 0) {
        sessionState.inventory.purchasedItems.forEach(itemId => {
            const item = SHOP_ITEMS.find(shopItem => shopItem.id === itemId);
            if (item) {
                renderInventoryItem(item, inventoryItemsContainer);
            }
        });
    }

    // Add items to shop
    SHOP_ITEMS.forEach(item => {
        // Only show items that haven't been purchased yet
        if (!sessionState.inventory.purchasedItems.includes(item.id)) {
            renderShopItem(item, shopItemsContainer);
        }
    });

    // Current score display
    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "score-display";
    scoreDisplay.id = "inventory-score-display";
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "20px";
    scoreDisplay.style.right = "50px";
    scoreDisplay.style.backgroundColor = "#2d2929";
    scoreDisplay.style.color = "#ffd700";
    scoreDisplay.style.padding = "10px 15px";
    scoreDisplay.style.borderRadius = "5px";
    scoreDisplay.style.border = "2px solid #ffd700";
    scoreDisplay.style.fontSize = "3rem";
    scoreDisplay.textContent = `Coins: ${sessionState.progress.score}`;
    inventoryShopContainer.appendChild(scoreDisplay);
}

// Function to render a shop item
function renderShopItem(item, container) {
    const itemElement = document.createElement("div");
    itemElement.className = "shop-item";
    itemElement.style.display = "flex";
    itemElement.style.backgroundColor = "rgba(45, 41, 41, 0.8)";
    itemElement.style.padding = "10px";
    itemElement.style.borderRadius = "5px";
    itemElement.style.alignItems = "center";

    // Create image container for better mobile layout
    const imageContainer = document.createElement("div");
    imageContainer.className = "item-image-container";
    
    // Original frame size from sprite sheet
    const originalFrameWidth = 17;
    const originalFrameHeight = 33;

    // Scale factor
    const scale = 1.75;
    const scaledFrameWidth = originalFrameWidth * scale;
    const scaledFrameHeight = originalFrameHeight * scale;

    // Create wrapper (the visible frame)
    const imageWrapper = document.createElement("div");
    imageWrapper.style.width = `${scaledFrameWidth}px`;
    imageWrapper.style.height = `${scaledFrameHeight}px`;
    imageWrapper.style.overflow = "hidden";
    imageWrapper.style.borderRadius = "3px";
    imageWrapper.style.display = "inline-block";

    // Create the full image
    const itemImage = document.createElement("img");
    itemImage.src = item.image;
    itemImage.alt = item.name;

    // Scale the image up (entire sprite sheet)
    itemImage.style.width = `${51 * scale}px`; // 153px
    itemImage.style.height = `${98 * scale}px`; // 294px
    itemImage.style.imageRendering = "pixelated";
    itemImage.style.position = "relative";

    // Offset for top-left sprite (col 0, row 0)
    itemImage.style.left = `0px`;
    itemImage.style.top = `0px`;

    // Append
    imageWrapper.appendChild(itemImage);
    imageContainer.appendChild(imageWrapper);
    itemElement.appendChild(imageContainer);

    // Item details container
    const itemDetails = document.createElement("div");
    itemDetails.className = "item-details";

    const itemName = document.createElement("h4");
    itemName.textContent = item.name;
    itemName.style.margin = "0 0 5px 0";
    itemName.style.color = "#ffd700";
    itemDetails.appendChild(itemName);

    const itemDescription = document.createElement("p");
    itemDescription.textContent = item.description;
    itemDescription.style.margin = "0";
    itemDescription.style.fontSize = "0.9rem";
    itemDescription.style.color = "#e0e0e0";
    itemDetails.appendChild(itemDescription);

    // Price
    const itemPrice = document.createElement("div");
    itemPrice.className = "item-price";
    itemPrice.textContent = `${item.price} Coins`;
    itemDetails.appendChild(itemPrice);

    itemElement.appendChild(itemDetails);

    // Action buttons container
    const itemActions = document.createElement("div");
    itemActions.className = "item-actions";

    // Buy button
    const buyButton = document.createElement("button");
    buyButton.className = "button";
    buyButton.textContent = "Kaufen";

    // Disable button if not enough score
    if (sessionState.progress.score < item.price) {
        buyButton.style.opacity = "0.5";
        buyButton.style.cursor = "not-allowed";
        buyButton.disabled = true;
    }

    buyButton.addEventListener("click", async () => {
        if (sessionState.progress.score >= item.price) {
            await purchaseItem(item);
            document.getElementById("inventory-score-display").textContent = `Coins: ${sessionState.progress.score}`;
        }
        document.getElementById("game").focus();
    });

    itemActions.appendChild(buyButton);
    itemElement.appendChild(itemActions);
    container.appendChild(itemElement);
}

// Function to render an inventory item
function renderInventoryItem(item, container) {
    if(item.description == "Your default character") return;
    const itemElement = document.createElement("div");
    itemElement.className = "inventory-item";
    itemElement.dataset.itemId = item.id; // Store item ID for selection
    itemElement.style.display = "flex";
    itemElement.style.backgroundColor = "rgba(45, 41, 41, 0.8)";
    itemElement.style.padding = "10px";
    itemElement.style.borderRadius = "5px";
    itemElement.style.alignItems = "center";

    // Highlight if active
    if (sessionState.inventory.activeCharacter === item.id) {
        itemElement.classList.add('active');
    }
    
    // Create image container for better mobile layout
    const imageContainer = document.createElement("div");
    imageContainer.className = "item-image-container";
    
    // Original frame size from sprite sheet
    const originalFrameWidth = 17;
    const originalFrameHeight = 33;

    // Scale factor
    const scale = 1.75;
    const scaledFrameWidth = originalFrameWidth * scale;
    const scaledFrameHeight = originalFrameHeight * scale;

    // Create wrapper (the visible frame)
    const imageWrapper = document.createElement("div");
    imageWrapper.style.width = `${scaledFrameWidth}px`;
    imageWrapper.style.height = `${scaledFrameHeight}px`;
    imageWrapper.style.overflow = "hidden";
    imageWrapper.style.borderRadius = "3px";
    imageWrapper.style.display = "inline-block";

    // Create the full image
    const itemImage = document.createElement("img");
    itemImage.src = item.image;
    itemImage.alt = item.name;

    // Scale the image up (entire sprite sheet)
    itemImage.style.width = `${51 * scale}px`; // 153px
    itemImage.style.height = `${98 * scale}px`; // 294px
    itemImage.style.imageRendering = "pixelated";
    itemImage.style.position = "relative";

    // Offset for top-left sprite (col 0, row 0)
    itemImage.style.left = `0px`;
    itemImage.style.top = `0px`;

    // Append
    imageWrapper.appendChild(itemImage);
    imageContainer.appendChild(imageWrapper);
    itemElement.appendChild(imageContainer);

    // Item details container
    const itemDetails = document.createElement("div");
    itemDetails.className = "item-details";

    const itemName = document.createElement("h4");
    itemName.textContent = item.name;
    itemName.style.margin = "0 0 5px 0";
    itemName.style.color = "#ffd700";
    itemDetails.appendChild(itemName);

    const itemDescription = document.createElement("p");
    itemDescription.textContent = item.description;
    itemDescription.style.margin = "0";
    itemDescription.style.fontSize = "0.9rem";
    itemDescription.style.color = "#e0e0e0";
    itemDetails.appendChild(itemDescription);

    itemElement.appendChild(itemDetails);

    // Action buttons container
    const itemActions = document.createElement("div");
    itemActions.className = "item-actions";

    // Use button (only for characters)
    if (item.type === "character" && sessionState.inventory.activeCharacter !== item.id) {
        const useButton = document.createElement("button");
        useButton.className = "button";
        useButton.textContent = "Auswaehlen";

        useButton.addEventListener("click", () => {
            selectCharacter(item.id);
        });

        itemActions.appendChild(useButton);
    } else if (sessionState.inventory.activeCharacter === item.id) {
        const activeLabel = document.createElement("span");
        activeLabel.textContent = "Aktiv";
        activeLabel.style.color = "#00ff00";
        activeLabel.style.fontWeight = "bold";
        activeLabel.style.fontSize = "1.1rem";
        itemActions.appendChild(activeLabel);
    }

    itemElement.appendChild(itemActions);
    container.appendChild(itemElement);
}

// Function to purchase an item
async function purchaseItem(item) {
    // Check if player has enough score
    if (sessionState.progress.score < item.price) {
        // Skip alert and just return
        return;
    }

    // Store original score for verification
    const originalScore = sessionState.progress.score;

    // Deduct price from score using secure scoring system
    const newScore = await decreaseSecureScore(item.price);
    
    // Verify the purchase was successful (score was actually decreased)
    if (newScore === originalScore) {
        // Purchase failed - score wasn't decreased
        // console.error("Failed to decrease score for purchase");
        return;
    }

    // Verify the decrease amount is correct
    if (originalScore - newScore !== item.price) {
        console.error(`Score decrease mismatch. Expected: ${item.price}, Actual: ${originalScore - newScore}`);
        return;
    }

    // Add item to inventory
    if (!sessionState.inventory.purchasedItems.includes(item.id)) {
        sessionState.inventory.purchasedItems.push(item.id);
    }

    // Save changes (score is already saved by decreaseSecureScore)
    saveGame();

    // Update UI
    refreshScoreUI();

    // Reset containers
    const inventoryShop = document.getElementById("inventory-shop");
    const inventoryShopContainer = inventoryShop.querySelector(".inventory-shop-container");
    const contentContainer = inventoryShopContainer.querySelector(".inventory-shop-content");

    // Get inventory section to reuse
    const inventorySection = contentContainer.querySelector(".inventory-section");
    const inventoryItemsContainer = inventorySection.querySelector("div:last-child");

    // Clear inventory items container
    while (inventoryItemsContainer.firstChild) {
        inventoryItemsContainer.removeChild(inventoryItemsContainer.firstChild);
    }

    // Define default characters
    const defaultMaleCharacter = {
        id: "character-male",
        name: "Male Character",
        description: "Your default character",
        type: "character",
        image: "./sprites/character-male.png"
    };

    const defaultFemaleCharacter = {
        id: "character-female",
        name: "Female Character",
        description: "Your default character",
        type: "character",
        image: "./sprites/character-female.png"
    };

    // Add the appropriate default character
    if (sessionState.settings.character === "character-male" ||
        sessionState.settings.character === "character-male-paid") {
        renderInventoryItem(defaultMaleCharacter, inventoryItemsContainer);
    } else {
        renderInventoryItem(defaultFemaleCharacter, inventoryItemsContainer);
    }

    // Add purchased items to inventory including the new one
    sessionState.inventory.purchasedItems.forEach(itemId => {
        const item = SHOP_ITEMS.find(shopItem => shopItem.id === itemId);
        if (item) {
            renderInventoryItem(item, inventoryItemsContainer);
        }
    });

    // Remove the purchased item from shop
    const shopItemsContainer = contentContainer.querySelector(".shop-section > div:last-child");
    while (shopItemsContainer.firstChild) {
        shopItemsContainer.removeChild(shopItemsContainer.firstChild);
    }

    // Re-add shop items that haven't been purchased
    SHOP_ITEMS.forEach(shopItem => {
        if (!sessionState.inventory.purchasedItems.includes(shopItem.id)) {
            renderShopItem(shopItem, shopItemsContainer);
        }
    });

    // No notification/alert
}

function takeOffItem() {
    sessionState.inventory.activeCharacter = undefined;
    saveGame();

    document.getElementById("remove-items-button").style.display = "none";

    // Get inventory container
    const inventoryShop = document.getElementById("inventory-shop");
    const inventoryShopContainer = inventoryShop.querySelector(".inventory-shop-container");
    const contentContainer = inventoryShopContainer.querySelector(".inventory-shop-content");
    const inventorySection = contentContainer.querySelector(".inventory-section");
    const inventoryItemsContainer = inventorySection.querySelector("div:last-child");

    // Remove active class from all items
    const inventoryItems = inventoryItemsContainer.querySelectorAll(".inventory-item");
    inventoryItems.forEach(item => {
        item.style.border = "none";
        item.style.boxShadow = "none";

        // Remove "Aktiv" label if it exists
        const activeLabel = item.querySelector("span");
        if (activeLabel && activeLabel.textContent === "Aktiv") {
            item.removeChild(activeLabel);

            // Add "Auswaehlen" button back
            const useButton = document.createElement("button");
            useButton.className = "button";
            useButton.textContent = "Auswaehlen";
            useButton.style.marginLeft = "10px";

            const itemId = item.dataset.itemId;
            useButton.addEventListener("click", () => {
                selectCharacter(itemId);
            });

            item.appendChild(useButton);
        }
    });
}

// Function to select a character
function selectCharacter(characterId) {
    // Change active character
    sessionState.inventory.activeCharacter = characterId;
    //sessionState.settings.character = characterId;

    // Save changes
    saveGame();
    if(!document.getElementById("remove-items-button")) {
        const removeButton = document.createElement("div");
        removeButton.innerText = "Return to default character";
        removeButton.id = "remove-items-button"
        removeButton.className = "button-no-hover";
        removeButton.style.marginBottom = "25px";
        removeButton.addEventListener("click", takeOffItem)
        document.getElementById("inventory-items-container").prepend(removeButton);

        if (sessionState.inventory.activeCharacter == null) {
            removeButton.style.display = "none";
        }
    }
    document.getElementById("remove-items-button").style.display = "block";

    // Get inventory container
    const inventoryShop = document.getElementById("inventory-shop");
    const inventoryShopContainer = inventoryShop.querySelector(".inventory-shop-container");
    const contentContainer = inventoryShopContainer.querySelector(".inventory-shop-content");
    const inventorySection = contentContainer.querySelector(".inventory-section");
    const inventoryItemsContainer = inventorySection.querySelector("div:last-child");

    // Remove active class from all items
    const inventoryItems = inventoryItemsContainer.querySelectorAll(".inventory-item");
    inventoryItems.forEach(item => {
        item.style.border = "none";
        item.style.boxShadow = "none";

        // Remove "Aktiv" label if it exists
        const activeLabel = item.querySelector("span");
        if (activeLabel && activeLabel.textContent === "Aktiv") {
            item.removeChild(activeLabel);

            // Add "Auswaehlen" button back
            const useButton = document.createElement("button");
            useButton.className = "button";
            useButton.textContent = "Auswaehlen";
            useButton.style.marginLeft = "10px";

            const itemId = item.dataset.itemId;
            useButton.addEventListener("click", () => {
                selectCharacter(itemId);
            });

            item.appendChild(useButton);
        }
    });

    // Add active class to selected item
    const selectedItem = Array.from(inventoryItems).find(item => item.dataset.itemId === characterId);
    if (selectedItem) {
        selectedItem.style.border = "2px solid #ffd700";
        selectedItem.style.boxShadow = "0 0 10px #ffd700";

        // Replace "Auswaehlen" button with "Aktiv" label
        const useButton = selectedItem.querySelector("button");
        if (useButton) {
            selectedItem.removeChild(useButton);

            const activeLabel = document.createElement("span");
            activeLabel.textContent = "Aktiv";
            activeLabel.style.marginLeft = "10px";
            activeLabel.style.color = "#ffd700";
            activeLabel.style.fontWeight = "bold";
            selectedItem.appendChild(activeLabel);
        }
    }

    // Add notification about character changing on room change
    const notification = document.createElement("div");
    notification.className = "character-change-notification";
    notification.style.position = "absolute";
    notification.style.bottom = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    notification.style.color = "#ffd700";
    notification.style.padding = "10px 15px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.fontSize = "1.2rem";
    notification.textContent = "Charakter geaendert!";

    // Remove existing notifications
    const existingNotification = inventoryShopContainer.querySelector(".character-change-notification");
    if (existingNotification) {
        inventoryShopContainer.removeChild(existingNotification);
    }

    // Add the notification
    inventoryShopContainer.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        if (inventoryShopContainer.contains(notification)) {
            inventoryShopContainer.removeChild(notification);
        }
    }, 3000);

    // We won't attempt to update the character immediately
    // Character will update when player moves to a new room
    // This approach is safer and prevents crashes
}

// Initialize when the module is imported
export function attachInventoryShopListeners() {
    const inventory_shop = document.getElementById("inventory-shop");

    // Initialize the shop when it's displayed
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const displayStyle = inventory_shop.style.display;
                if (displayStyle === 'flex') {
                    initInventoryShop();
                }
            }
        });
    });

    observer.observe(inventory_shop, { attributes: true });
}
import { k } from "./kaboomCtx.js";
import { sessionState, saveGame } from "./sessionstate.js";
import { refreshScoreUI } from "./utils.js";

// Shop items configuration
const SHOP_ITEMS = [
    {
        id: "character-male-paid",
        name: "Premium Male Character",
        description: "Unlock an exclusive male character skin",
        price: 1,
        type: "character",
        image: "./sprites/character-male-paid.png"
    }
];

// Initialize the inventory in sessionState if it doesn't exist yet
if (!sessionState.inventory) {
    sessionState.inventory = {
        purchasedItems: [],
        activeCharacter: sessionState.settings.character
    };
    saveGame();
}

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
    inventoryShopContainer.appendChild(contentContainer);

    // Create the shop section
    const shopSection = document.createElement("div");
    shopSection.className = "shop-section";
    shopSection.style.width = "45%";
    shopSection.style.border = "3px solid #ffd700";
    shopSection.style.padding = "15px";
    shopSection.style.borderRadius = "10px";
    shopSection.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
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
    inventorySection.appendChild(inventoryItemsContainer);

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
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "20px";
    scoreDisplay.style.right = "20px";
    scoreDisplay.style.backgroundColor = "#2d2929";
    scoreDisplay.style.color = "#ffd700";
    scoreDisplay.style.padding = "10px 15px";
    scoreDisplay.style.borderRadius = "5px";
    scoreDisplay.style.border = "2px solid #ffd700";
    scoreDisplay.style.fontSize = "1.5rem";
    scoreDisplay.textContent = `Score: ${sessionState.progress.score}`;
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

    // Item image
    const itemImage = document.createElement("img");
    itemImage.src = item.image;
    itemImage.alt = item.name;
    itemImage.style.width = "60px";
    itemImage.style.height = "60px";
    itemImage.style.marginRight = "15px";
    itemImage.style.border = "1px solid #ffd700";
    itemImage.style.borderRadius = "3px";
    itemImage.style.imageRendering = "pixelated";
    itemElement.appendChild(itemImage);

    // Item details
    const itemDetails = document.createElement("div");
    itemDetails.style.flex = "1";
    
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
    const itemPrice = document.createElement("span");
    itemPrice.textContent = `${item.price} Score`;
    itemPrice.style.display = "block";
    itemPrice.style.marginTop = "5px";
    itemPrice.style.fontSize = "1rem";
    itemPrice.style.color = "#ffd700";
    itemDetails.appendChild(itemPrice);
    
    itemElement.appendChild(itemDetails);

    // Buy button
    const buyButton = document.createElement("button");
    buyButton.className = "button";
    buyButton.textContent = "Kaufen";
    buyButton.style.marginLeft = "10px";
    
    // Disable button if not enough score
    if (sessionState.progress.score < item.price) {
        buyButton.disabled = true;
        buyButton.style.opacity = "0.5";
        buyButton.style.cursor = "not-allowed";
    }
    
    buyButton.addEventListener("click", () => {
        purchaseItem(item);
    });
    
    itemElement.appendChild(buyButton);
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
        itemElement.style.border = "2px solid #ffd700";
        itemElement.style.boxShadow = "0 0 10px #ffd700";
    }

    // Item image
    const itemImage = document.createElement("img");
    itemImage.src = item.image;
    itemImage.alt = item.name;
    itemImage.style.width = "60px";
    itemImage.style.height = "60px";
    itemImage.style.marginRight = "15px";
    itemImage.style.border = "1px solid #ffd700";
    itemImage.style.borderRadius = "3px";
    itemImage.style.imageRendering = "pixelated";
    itemElement.appendChild(itemImage);

    // Item details
    const itemDetails = document.createElement("div");
    itemDetails.style.flex = "1";
    
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

    // Use button (only for characters)
    if (item.type === "character" && sessionState.inventory.activeCharacter !== item.id) {
        const useButton = document.createElement("button");
        useButton.className = "button";
        useButton.textContent = "Auswaehlen";
        useButton.style.marginLeft = "10px";
        
        useButton.addEventListener("click", () => {
            selectCharacter(item.id);
        });
        
        itemElement.appendChild(useButton);
    } else if (sessionState.inventory.activeCharacter === item.id) {
        const activeLabel = document.createElement("span");
        activeLabel.textContent = "Aktiv";
        activeLabel.style.marginLeft = "10px";
        activeLabel.style.color = "#ffd700";
        activeLabel.style.fontWeight = "bold";
        itemElement.appendChild(activeLabel);
    }
    
    container.appendChild(itemElement);
}

// Function to purchase an item
function purchaseItem(item) {
    // Check if player has enough score
    if (sessionState.progress.score < item.price) {
        // Skip alert and just return
        return;
    }

    // Deduct price from score
    sessionState.progress.score -= item.price;
    
    // Add item to inventory
    if (!sessionState.inventory.purchasedItems.includes(item.id)) {
        sessionState.inventory.purchasedItems.push(item.id);
    }
    
    // Save changes
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

// Function to select a character
function selectCharacter(characterId) {
    // Change active character
    sessionState.inventory.activeCharacter = characterId;
    sessionState.settings.character = characterId;
    
    // Save changes
    saveGame();
    
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
    notification.textContent = "Charakter geaendert! Wechsle den Raum um die Aenderungen zu sehen.";
    
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
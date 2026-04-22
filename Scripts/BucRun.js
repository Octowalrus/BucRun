// Global Variables
//=======================================================================

const GRID = {
  cols: 4,
  itemWidth: 150,
  itemHeight: 150,
  padding: 20,
  startingX: 70,
  startingY: 100
};

const PAUSE_BUTTON = {
  x: 20,
  y: 20,
  size: 30,
};

const CHARACTER_SPRITES = {
  Bucky: {
    size: 60,
    previewSrc: "Assets/Bucky/standA.png",
    frames: {
      standA: "Assets/Bucky/standA.png",
      standB: "Assets/Bucky/standB.png",
      prejump: "Assets/Bucky/run1.png",
      jump: "Assets/Bucky/jump.png",
      land: "Assets/Bucky/run2.png",
    },
  },
  Ninja: {
    size: 60,
    previewSrc: "Assets/Ninja/standA.png",
    frames: {
      standA: "Assets/Ninja/standA.png",
      standB: "Assets/Ninja/standB.png",
      prejump: "Assets/Ninja/run1.png",
      jump: "Assets/Ninja/jump.png",
      land: "Assets/Ninja/run2.png",
    },
  },
  Hobo: {
    size: 60,
    previewSrc: "Assets/Hobo/standA.png",
    frames: {
      standA: "Assets/Hobo/standA.png",
      standB: "Assets/Hobo/standB.png",
      prejump: "Assets/Hobo/run1.png",
      jump: "Assets/Hobo/jump.png",
      land: "Assets/Hobo/run2.png",
    },
  },
  Template: {
    size: 80,
    previewSrc: "Assets/Template/standA.png",
    frames: {
      standA: "Assets/Template/standA.png",
      standB: "Assets/Template/standB.png",
      prejump: "Assets/Template/run1.png",
      jump: "Assets/Template/run2.png",
      land: "Assets/Template/run3.png",
    },
  },
};

// Images for sprite upgrades in shop
const UPGRADE_SPRITES = {
  doubleJump: {
    previewSrc: "Assets/DoubleJump/doublejump.png",
  },
  magnet: {
    previewSrc: "Assets/Magnet/magnet.png",
  },
  slow_Down: {
    previewSrc: "Assets/SlowDown/slowdown.png",
  },
};

// This changes the selected sprite's animations to make active character.
const SELECTED_CHARACTER = "Bucky";
const ACTIVE_CHARACTER =
  CHARACTER_SPRITES[SELECTED_CHARACTER] ?? CHARACTER_SPRITES.Bucky;

// List of items in the shop
let shopItems = [];

// main variable to track the current screen
let currentScreen = "menu";
const CANVAS = document.getElementById("gameCanvas");
const CTX = CANVAS.getContext("2d");

// load SPRITES assets of each state
const SPRITES = {
  standA: new Image(),
  standB: new Image(),
  prejump: new Image(),
  jump: new Image(),
  land: new Image(),
  coin: new Image(), //coin image
  background0: new Image(),
  background1: new Image(),
  background2: new Image(),
  background3: new Image(),
  background4: new Image(),
  firehydrant: new Image(),
};
// sets the source for each sprite to the corresponding image file
SPRITES.jump.src = ACTIVE_CHARACTER.frames.jump;
SPRITES.land.src = ACTIVE_CHARACTER.frames.land;
SPRITES.prejump.src = ACTIVE_CHARACTER.frames.prejump;
SPRITES.standA.src = ACTIVE_CHARACTER.frames.standA;
SPRITES.standB.src = ACTIVE_CHARACTER.frames.standB;
SPRITES.background0.src = "Assets/Background/roadsidewalktrees.png";
SPRITES.background1.src = "Assets/Background/clouds1.png";
SPRITES.background2.src = "Assets/Background/clouds2.png";
SPRITES.background3.src = "Assets/Background/clouds3.png";
SPRITES.background4.src = "Assets/Background/sunsky.png";
SPRITES.coin.src = "Assets/Coin/coin.png";
SPRITES.firehydrant.src = "Assets/firehydrant.png";

//Array that contains coin's x,y and boolean value that determines if it's been picked up
let coins = [{ x: 500, y: 300, width: 40, height: 45, collected: false }]; // initial coin for testing, will be removed later and coins will be spawned based on distance or time
let currentCoins = 0; //global storing how many coins the player has currently
let score = 0; // player's score, which can be based on distance or coins collected, will be implemented later
const GROUND_Y = 330; // KEEP GROUND_Y same as player.y
const MAX_JUMP_HEIGHT = 125; // maximum height the player can reach when jumping;
// player object with properties for position, size, speed, velocity, gravity, and jump state
let player = {
  x: 20,
  y: 330,
  size: CHARACTER_SPRITES[SELECTED_CHARACTER].size,
  speed: 10,
  velocityY: 0,
  gravity: 0.3,
  onGround: true,

  state: "stand",
  jumpStartY: GROUND_Y,
  jumpsUsed: 0,
  prejumpTimer: 0,
  landingTimer: 0,
};
//background object with properties for position, speed, and parallax
let background = {
  x0: 0, //road and trees
  x1: 0, //clouds
  x2: 0, //clouds
  x3: 0, //clouds
  x4: 0, //sun and sky
  speed: 6,
  parallax: 0.8,
};

let jumpQueued = false;
let jumpKeyHeld = false;
let standingFrame = 0;
let standingFrameCounter = 0;
let lastTime = 0;

// Object to store the game state, including stats, shop items, and settings. This will be used to store save data and load in save data
let gameState = {
  stats: {
    coins: 0,
    highscore: 0,
  },
  shop: {
    items: [
      {
        name: "Ninja",
        cost: 10,
        owned: false,
        src: CHARACTER_SPRITES.Ninja.previewSrc,
      },
      {
        name: "Hobo",
        cost: 20,
        owned: false,
        src: CHARACTER_SPRITES.Hobo.previewSrc,
      },
      {
        name: "Blank",
        cost: 30,
        owned: false,
        src: CHARACTER_SPRITES.Template.previewSrc,
      },
      {
        name: "Double Jump",
        cost: 50,
        owned: false,
        equipped: false,
        type: "upgrade",
        upgradeId: "doubleJump",
        src: UPGRADE_SPRITES.doubleJump.previewSrc,
      },
    ],
  },
  settings: {},
};

shopItems = gameState.shop.items; // localize shop items from game state to global variable for easier access

//======================================================================================
//END OF GLOBAL VARIABLES

// On window load, attempt to load game state and apply it
window.onload = () => {
  if (loadGame()) {
    applyGameState();
  } else {
    console.log("No save found, starting new game");
  }
};
currentCoins = gameState.stats.coins; //global storing how many coins the player has currently

// Keys that trigger jump
function isJumpKey(key) {
  return key === "w" || key === " " || key === "arrowup";
}

// Keys that toggle the pause screen while the game is running.
function isPauseKey(key) {
  return key === "p" || key === "escape";
}

function isPauseButtonClicked(mouseX, mouseY) {
  return (
    mouseX >= PAUSE_BUTTON.x &&
    mouseX <= PAUSE_BUTTON.x + PAUSE_BUTTON.size &&
    mouseY >= PAUSE_BUTTON.y &&
    mouseY <= PAUSE_BUTTON.y + PAUSE_BUTTON.size
  );
}

function pauseGame() {
  currentScreen = "paused";
}

function resumeGame() {
  currentScreen = "playing";
}

function togglePause() {
  if (currentScreen === "playing") {
    pauseGame();
    return;
  }

  if (currentScreen === "paused") {
    resumeGame();
  }
}

// If an upgrade is equipped, return true.
function isUpgradeEquipped(upgradeId) {
  return shopItems.some((item) => {
    return (
      item.type === "upgrade" && item.upgradeId === upgradeId && item.equipped
    );
  });
}

// If upgrade is equipped set max jump count to 2, else 1.
function getMaxJumpCount() {
  return isUpgradeEquipped("doubleJump") ? 2 : 1;
}

// function to start a jump, setting the initial jump velocity and changing the player state and incrementing jumps used
function startJump() {
  player.jumpStartY = player.y;
  player.velocityY = -player.speed;
  player.state = "jump";
  player.onGround = false;
  player.jumpsUsed++;
}

// wait until all images are loaded
let loadedCount = 0;
const totalImages = Object.keys(SPRITES).length;

for (let key in SPRITES) {
  SPRITES[key].onload = () => {
    loadedCount++;
    if (loadedCount === totalImages) {
      mainLoop();
    }
  };
}

// key press event listener for jump input
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const KEY = e.key.toLowerCase();

  if (isPauseKey(KEY)) {
    togglePause();
    return;
  }

  if (currentScreen !== "playing") return;

  if (!isJumpKey(KEY)) return;

  if (player.onGround && player.state !== "prejump") {
    player.state = "prejump";
    player.prejumpTimer = 0.1; // how many frames to show prejump
    jumpQueued = true; // flag to indicate a jump is queued
    jumpKeyHeld = true; // track if the jump key is being held for jump height control
    return;
  }

  if (
    !player.onGround &&
    player.state !== "prejump" &&
    player.jumpsUsed < getMaxJumpCount()
  ) {
    startJump();
    jumpQueued = false;
    jumpKeyHeld = true;
  }
});

// key release event listener to handle jump key release for variable jump height
document.addEventListener("keyup", (e) => {
  const KEY = e.key.toLowerCase();

  if (isJumpKey(KEY)) {
    jumpKeyHeld = false; // stop tracking the jump key being held
  }
});

// listens for clicks on the CANVAS for navigating the menu
CANVAS.addEventListener("click", (e) => {
  // get mouse position relative to the canvas
  const rect = CANVAS.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // if the screen is the menu, do outcome of click event
  if (currentScreen === "menu") {
    // check if click is on start or shop button
    // menu button
    if (
      mouseX >= CANVAS.width / 2 - 100 &&
      mouseX <= CANVAS.width / 2 + 100 &&
      mouseY >= 200 &&
      mouseY <= 260
    ) {
      currentScreen = "playing";
    }

    // shop button
    if (
      mouseX >= CANVAS.width / 2 - 100 &&
      mouseX <= CANVAS.width / 2 + 100 &&
      mouseY >= 300 &&
      mouseY <= 360
    ) {
      currentScreen = "shop";
    }
  } else if (currentScreen === "shop") {
    // back button in shop
    if (mouseX >= 20 && mouseX <= 120 && mouseY >= 20 && mouseY <= 60) {
      currentScreen = "menu";
      return;
    }

    // Create click area for each item in shop
    shopItems.forEach((item, index) => {
      const col = index % GRID.cols;
      const row = Math.floor(index / GRID.cols);

      const x = GRID.startingX + col * (GRID.itemWidth + GRID.padding);
      const y = GRID.startingY + row * (GRID.itemHeight + GRID.padding);

      if (
        mouseX >= x &&
        mouseX <= x + GRID.itemWidth &&
        mouseY >= y &&
        mouseY <= y + GRID.itemHeight
      ) {
        // If item is not owned, make it owned
        // TO DO: Add connection to a coin count
        if (!item.owned) {
          item.owned = true;
          if (item.type === "upgrade") {
            item.equipped = true;
          }
        } else if (item.type === "upgrade") {
          item.equipped = !item.equipped;
        }
      }
    });
  } else if (currentScreen === "playing" || currentScreen === "paused") {
    if (isPauseButtonClicked(mouseX, mouseY)) {
      togglePause();
      return;
    }
  }
});
// function to handle background moving and rendering
function backgroundF(dt) {
  background.x0 -= background.speed * dt * 60;
  background.x1 -= background.speed * background.parallax * dt * 60;
  background.x2 -=
    background.speed * Math.pow(background.parallax, 2) * dt * 60;
  background.x3 -=
    background.speed * Math.pow(background.parallax, 3) * dt * 60;
  if (background.x0 <= -1600) {
    background.x0 = 0;
  }
  if (background.x1 <= -1600) {
    background.x1 = 0;
  }
  if (background.x2 <= -1600) {
    background.x2 = 0;
  }
  if (background.x3 <= -1600) {
    background.x3 = 0;
  }
  CTX.drawImage(SPRITES.background4, background.x4, 0);
  CTX.drawImage(SPRITES.background3, background.x3, 0);
  CTX.drawImage(SPRITES.background3, background.x3 + 1600, 0);
  CTX.drawImage(SPRITES.background2, background.x2, 0);
  CTX.drawImage(SPRITES.background2, background.x2 + 1600, 0);
  CTX.drawImage(SPRITES.background1, background.x1, 0);
  CTX.drawImage(SPRITES.background1, background.x1 + 1600, 0);
  CTX.drawImage(SPRITES.background0, background.x0, 0);
  CTX.drawImage(SPRITES.background0, background.x0 + 1600, 0);
}

// main loop to handle screen rendering and game updates
function mainLoop(timestamp) {
  // calculate delta time in seconds
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // clamp dt (prevents huge jumps if tab was inactive)
  if (dt > 0.1) dt = 0.1;

  // clear CANVAS
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // switch statement to change between the screens
  switch (currentScreen) {
    case "menu":
      drawMainMenu();
      break;
    case "playing":
      updateGame(dt);
      drawGameFrame(dt);
      drawPauseButton();
      coinMove(dt);
      drawCoin();
      coinPickup();

      break;
    case "paused":
      drawGameFrame(0);
      drawPauseOverlay();
      drawPauseButton(true);
      break;
    case "shop":
      drawShop();
      break;
  }

  // call the function again
  requestAnimationFrame(mainLoop);
}

// main update function to handle player movement, jumping, and landing logic
function update(dt) {
  // alternate standing frame every 20 frames
  if (player.state === "stand") {
    standingFrameCounter += dt;

    if (standingFrameCounter >= 0.3) {
      standingFrame = standingFrame === 0 ? 1 : 0;
      standingFrameCounter = 0;
    }
  } else {
    standingFrame = 0;
    standingFrameCounter = 0;
  }

  // handles the prejump state and lowers the timer until it reaches 0, then initiates the jump
  if (player.state === "prejump") {
    player.prejumpTimer -= dt;
    // when prejump timer reaches 0 and jump is queued, initiates the jump based off jump velocity and changes the state to jump
    if (player.prejumpTimer <= 0 && jumpQueued) {
      startJump();
      jumpQueued = false;
    }
  }
  // if the player is in the air, apply gravity to the velocity and update the y position
  if (!player.onGround) {
    // variable jump: reduce gravity if jump key is still held
    if (player.velocityY < 0 && jumpKeyHeld) {
      // while moving up and holding key, gravity is weaker
      player.velocityY += player.gravity * dt * 60; // slow down gravity while holding
    } else {
      player.velocityY += player.gravity * 3 * dt * 60; // normal gravity
    }
    // update y position based on velocity
    player.y += player.velocityY * dt * 60;
  }
  // Limit each jump based on where that jump started, so a double jump adds height.
  if (player.velocityY < 0 && player.y <= player.jumpStartY - MAX_JUMP_HEIGHT) {
    player.y = player.jumpStartY - MAX_JUMP_HEIGHT;
    player.velocityY += player.gravity * 6 * dt * 60; // slowly start falling down if above max jump height
    jumpKeyHeld = false; // treat as if jump key was released
  }

  // if the player has reached the ground, reset the y position and velocity, and handle landing state
  if (player.y >= GROUND_Y) {
    const wasInAir = !player.onGround || player.state === "jump";

    player.y = GROUND_Y;
    player.velocityY = 0;

    if (wasInAir && player.state !== "land" && player.state !== "prejump") {
      player.state = "land";
      player.landingTimer = 0.1;
    }

    player.onGround = true;
    player.jumpStartY = GROUND_Y;
    player.jumpsUsed = 0;
  }
  // if the player is in the landing state, lower the timer until it reaches 0, then change the state back to stand
  if (player.state === "land") {
    player.landingTimer -= dt;

    if (player.landingTimer <= 0) {
      player.state = "stand";
    }
  }
}

function updateGame(dt) {
  update(dt);
  coinMove(dt);
  coinPickup();
}

function drawGameFrame(dt) {
  drawSprite(dt);
  drawCoin();
}

// function to draw the main menu screen
function drawMainMenu() {
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // make the title text
  CTX.fillStyle = "white";
  CTX.font = "50px Arial";
  CTX.textAlign = "center";
  CTX.fillText("BUC RUN", CANVAS.width / 2, 100);

  // draw the start button
  CTX.fillStyle = "#eeaa00";
  CTX.fillRect(CANVAS.width / 2 - 100, 200, 200, 60);

  // text in button
  CTX.fillStyle = "black";
  CTX.font = "30px Arial";
  CTX.fillText("START", CANVAS.width / 2, 240);

  // draw shop button
  CTX.fillStyle = "#eeaa00";
  CTX.fillRect(CANVAS.width / 2 - 100, 300, 200, 60);

  // text in shop button
  CTX.fillStyle = "black";
  CTX.font = "30px Arial";
  CTX.fillText("SHOP", CANVAS.width / 2, 340);
}

// draws the player's current sprite based on the state
function drawSprite(dt) {
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
  backgroundF(dt);
  let currentSprite = standingFrame === 0 ? SPRITES.standA : SPRITES.standB;

  if (player.state === "prejump") currentSprite = SPRITES.prejump;
  else if (player.state === "jump") currentSprite = SPRITES.jump;
  else if (player.state === "land") currentSprite = SPRITES.land;

  CTX.drawImage(currentSprite, player.x, player.y, player.size, player.size);
}

// function to draw shop GUI
// shop currently only contains cosmetic changes but upgrades can be added later
function drawShop() {
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  CTX.fillStyle = "white";
  CTX.font = "40px Arial";
  CTX.textAlign = "center";
  CTX.fillText("SHOP", CANVAS.width / 2, 50);

  // Make a shop item for every item in the shopItems list
  shopItems.forEach((item, index) => {
    const col = index % GRID.cols;
    const row = Math.floor(index / GRID.cols);

    const x = GRID.startingX + col * (GRID.itemWidth + GRID.padding);
    const y = GRID.startingY + row * (GRID.itemHeight + GRID.padding);

    CTX.fillStyle = "#222";
    CTX.fillRect(x, y, GRID.itemWidth, GRID.itemHeight);

    // Center the preview horizontally within the shop card.
    const img = new Image();
    const previewSize = player.size;
    const previewX = x + (GRID.itemWidth - previewSize) / 2;
    img.src = item.src;
    CTX.drawImage(img, previewX, y + 20, previewSize, previewSize);

    CTX.fillStyle = "white";
    CTX.font = "16px Arial";
    CTX.fillText(item.name, x + GRID.itemWidth / 2, y + 100);

    // If item is owned, make text green. Else, make it yellow.
    if (item.equipped) {
      CTX.fillStyle = "#66ddff";
      CTX.fillText("EQUIPPED", x + GRID.itemWidth / 2, y + 130);
    } else if (item.owned) {
      CTX.fillStyle = "green";
      CTX.fillText("OWNED", x + GRID.itemWidth / 2, y + 130);
    } else {
      CTX.fillStyle = "yellow";
      CTX.fillText(item.cost + " coins", x + GRID.itemWidth / 2, y + 130);
    }
  });

  // back button
  CTX.fillStyle = "#eeaa00";
  CTX.fillRect(20, 20, 100, 40);

  CTX.fillStyle = "black";
  CTX.font = "20px Arial";
  CTX.fillText("BACK", 70, 48);
}

//Function that will create a coin at x,y locations with a default value of not collected
function spawnCoin(x, y) {
  coins.push({
    x: x,
    y: y,
    width: 40,
    height: 45,
    collected: false,
  });
}
//function to update coins to move with the speed of the side scrolling
function coinMove(dt) {
  coins.forEach((coin) => {
    coin.x -= background.speed * dt * 60; // move coin to the left based on the background speed and delta time
  });

  // remove off-screen coins
  coins = coins.filter((coin) => coin.x + coin.width > 0);
}
//function to draw the all coins in the array coins
function drawCoin() {
  coins.forEach((coin) => {
    if (!coin.collected) {
      CTX.drawImage(SPRITES.coin, coin.x, coin.y, coin.width, coin.height);
    }
  });
}

// function to add pause button in top of the game
function drawPauseButton(isPaused = false) {
  CTX.save();
  CTX.fillStyle = "#eeaa00";
  CTX.fillRect(
    PAUSE_BUTTON.x,
    PAUSE_BUTTON.y,
    PAUSE_BUTTON.size,
    PAUSE_BUTTON.size
  );

  CTX.fillStyle = "black";
  if (isPaused) {
    CTX.beginPath();
    CTX.moveTo(PAUSE_BUTTON.x + 11, PAUSE_BUTTON.y + 8);
    CTX.lineTo(PAUSE_BUTTON.x + 11, PAUSE_BUTTON.y + 22);
    CTX.lineTo(PAUSE_BUTTON.x + 22, PAUSE_BUTTON.y + 15);
    CTX.closePath();
    CTX.fill();
  } else {
    CTX.fillRect(PAUSE_BUTTON.x + 9, PAUSE_BUTTON.y + 8, 4, 14);
    CTX.fillRect(PAUSE_BUTTON.x + 17, PAUSE_BUTTON.y + 8, 4, 14);
  }
  CTX.restore();
}

function drawPauseOverlay() {
  CTX.save();
  CTX.fillStyle = "rgba(0, 0, 0, 0.45)";
  CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

  CTX.fillStyle = "white";
  CTX.font = "bold 48px Arial";
  CTX.textAlign = "center";
  CTX.textBaseline = "middle";
  CTX.fillText("PAUSED", CANVAS.width / 2, CANVAS.height / 4);
  // button for exiting to main menu and resuming game
  CTX.fillStyle = "#eeaa00";
  CTX.fillRect(CANVAS.width / 2 - 100, CANVAS.height / 2 - 30, 200, 60);
  CTX.fillStyle = "white";
  CTX.font = "bold 48px Arial";
  CTX.textAlign = "center";
  CTX.textBaseline = "middle";
  CTX.fillText("Exit", CANVAS.width / 2, CANVAS.height / 2);
  CTX.restore();
}

//function for coin pickup detection
function coinPickup() {
  coins.forEach((coin) => {
    if (
      !coin.collected &&
      player.x < coin.x + coin.width &&
      player.x + player.size > coin.x &&
      player.y < coin.y + coin.height &&
      player.y + player.size > coin.y
    ) {
      coin.collected = true;
      currentCoins++;
    }
  });
}

//===============================Save Progress Functions============================================

//Saves on unload of the window
window.addEventListener("beforeunload", saveGame);

// function to save the game data (currently only coins) to localStorage as a JSON string
function saveGame() {
  try {
    updateGameState(); // make sure gameState is updated with current values before saving
    const data = JSON.stringify(gameState);
    localStorage.setItem("myGameSave", data);
    console.log("Game saved!");
  } catch (e) {
    console.error("Save failed:", e);
  }
}
// function to load the game data from localStorage and parse it back into an object, or return null if no data is found
function loadGame() {
  try {
    const data = localStorage.getItem("myGameSave");
    if (!data) return false;

    gameState = JSON.parse(data);
    console.log("Game loaded!");
    return true;
  } catch (e) {
    console.error("Load failed:", e);
    return false;
  }
}
// Will apply the loaded game state to the current game, setting coins and shop items to the loaded values
function applyGameState() {
  score = gameState.stats.highscore;

  currentCoins = gameState.stats.coins;
  shopItems = gameState.shop.items;
}

// function to update the gameState object with the current values of coins and shop items, which will be called before saving the game
function updateGameState() {
  gameState.stats.highscore = score;
  gameState.stats.coins = currentCoins;

  gameState.shop.items = shopItems;
}

//reset save data for testing purposes
function resetGameState() {
  localStorage.removeItem("myGameSave");
  console.log("Game state reset!");
}
;


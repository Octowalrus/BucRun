
// Global Variables
//=======================================================================


// main variable to track the current screen (menu or playing)
let currentScreen = "menu";
const CANVAS = document.getElementById("gameCanvas");
const CTX = CANVAS.getContext("2d");
let currentCoins = 0; //global storing how many coins the player has currently

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
};
// sets the source for each sprite to the corresponding image file
SPRITES.jump.src = "Assets/Bucky/jump.png";
SPRITES.land.src = "Assets/Bucky/run2.png";
SPRITES.prejump.src = "Assets/Bucky/run1.png";
SPRITES.standA.src = "Assets/Bucky/standA.png";
SPRITES.standB.src = "Assets/Bucky/standB.png";
SPRITES.background0.src = "Assets/Background/roadsidewalktrees.png";
SPRITES.background1.src = "Assets/Background/clouds1.png";
SPRITES.background2.src = "Assets/Background/clouds2.png";
SPRITES.background3.src = "Assets/Background/clouds3.png";
SPRITES.background4.src = "Assets/Background/sunsky.png";
SPRITES.coin.src = "Assets/coin.png";

//Array that contains coin's x,y and boolean value that determines if it's been picked up
let coins = [
  {x: 40, y:20, width:40, height:45, collected:false}

];



const GROUND_Y = 320;   // KEEP GROUND_Y same as player.y
const MAX_JUMP_HEIGHT = 125; // maximum height the player can reach when jumping;
// player object with properties for position, size, speed, velocity, gravity, and jump state
let player = {
  x: 20,
  y: 320,
  size: 80,
  speed: 10,
  velocityY: 0,
  gravity: 0.3,
  onGround: true,

  state: "stand",
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
  speed: 4,
  parallax: 0.8,
};

let jumpQueued = false;
let jumpKeyHeld = false;
let standingFrame = 0;
let standingFrameCounter = 0;





//======================================================================================
//END OF GLOBAL VARIABLES

spawnCoin(player.x+800,player.y);

// key press event listener for jump input
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const KEY = e.key.toLowerCase();

  if ((KEY === "w" || KEY === " " || KEY === "arrowup") && player.onGround) {
    player.state = "prejump";
    player.prejumpTimer = 6; // how many frames to show prejump
    jumpQueued = true; // flag to indicate a jump is queued
    jumpKeyHeld = true; // track if the jump key is being held for jump height control
  }
});

// key release event listener to handle jump key release for variable jump height
document.addEventListener("keyup", (e) => {
  const KEY = e.key.toLowerCase();

  if (KEY === "w" || KEY === " " || KEY === "arrowup") {
    jumpKeyHeld = false; // stop tracking the jump key being held
  }
});

// listens for clicks on the CANVAS for navigating the menu
CANVAS.addEventListener("click", () => {
  if (currentScreen === "menu") {
    currentScreen = "playing"; // Transition from menu to game
  }
});
// function to handle background moving and rendering
function backgroundF() {
  background.x0 -= background.speed;
  background.x1 -= background.speed * background.parallax;
  background.x2 -= background.speed * Math.pow(background.parallax, 2);
  background.x3 -= background.speed * Math.pow(background.parallax, 3);
  if(background.x0 <= -1600) {
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

// main update function to handle player movement, jumping, and landing logic
function update() {
  // alternate standing frame every 20 frames
  if (player.state === "stand") {
    standingFrameCounter++;

    if (standingFrameCounter >= 20) {
      standingFrame = standingFrame === 0 ? 1 : 0;
      standingFrameCounter = 0;
    }
  } else {
    standingFrame = 0;
    standingFrameCounter = 0;
  }

  // handles the prejump state and lowers the timer until it reaches 0, then initiates the jump
  if (player.state === "prejump") {
    player.prejumpTimer--;
    // when prejump timer reaches 0 and jump is queued, initiates the jump based off jump velocity and changes the state to jump
    if (player.prejumpTimer <= 0 && jumpQueued) {
      player.velocityY = -player.speed;
      player.state = "jump";
      player.onGround = false;
      jumpQueued = false;
    }
  }
  // if the player is in the air, apply gravity to the velocity and update the y position
  if (!player.onGround) {
    // variable jump: reduce gravity if jump key is still held
    if (player.velocityY < 0 && jumpKeyHeld) {
      // while moving up and holding key, gravity is weaker
      player.velocityY += player.gravity; // slow down gravity while holding
    } else {
      player.velocityY += player.gravity * 3; // normal gravity
    }
    // update y position based on velocity
    player.y += player.velocityY;
  }
  // if the player is above the maximum jump height, start applying stronger gravity and treat as if jump key was released to prevent further rising
  if (player.y <= GROUND_Y - MAX_JUMP_HEIGHT) {
    player.velocityY += player.gravity * 6; // slowly start falling down if above max jump height
    jumpKeyHeld = false; // treat as if jump key was released
  }

  // if the player has reached the ground, reset the y position and velocity, and handle landing state
  if (player.y >= GROUND_Y) {
    const wasInAir = !player.onGround || player.state === "jump";

    player.y = GROUND_Y;
    player.velocityY = 0;

    if (wasInAir && player.state !== "land" && player.state !== "prejump") {
      player.state = "land";
      player.landingTimer = 6;
    }

    player.onGround = true;
  }
  // if the player is in the landing state, lower the timer until it reaches 0, then change the state back to stand
  if (player.state === "land") {
    player.landingTimer--;

    if (player.landingTimer <= 0) {
      player.state = "stand";
    }
  }
  coinMove();
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
}

// draws the player's current sprite based on the state
function drawSprite() {
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
  backgroundF();
  let currentSprite = standingFrame === 0 ? SPRITES.standA : SPRITES.standB;

  if (player.state === "prejump") currentSprite = SPRITES.prejump;
  else if (player.state === "jump") currentSprite = SPRITES.jump;
  else if (player.state === "land") currentSprite = SPRITES.land;

  CTX.drawImage(currentSprite, player.x, player.y, player.size, player.size);
}
// main loop to handle screen rendering and game updates
function mainLoop() {
  // clear CANVAS
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // switch statement to change between the screens
  switch (currentScreen) {
    case "menu":
      drawMainMenu();
      break;
    case "playing":
      update();
      drawSprite();
      coinMove();
      drawCoin();
      coinPickup();
      break;
  }

  // call the function again
  requestAnimationFrame(mainLoop);
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

//Function that will create a coin at x,y locations with a default value of not collected
function spawnCoin(x,y){
  coins.push({
    x: x,
    y: y,
    width: 40,
    height: 45,
    collected: false
  });
}
//function to update coins to move with the speed of the side scrolling
function coinMove() {
  coins.forEach((coin) => {
    coin.x -= 4;
  });

  // remove off-screen coins
  coins = coins.filter(coin => coin.x + coin.width > 0);
}
//function to draw the all coins in the array coins
function drawCoin() {
  coins.forEach((coin) => {
    if (!coin.collected) {
      CTX.drawImage(SPRITES.coin, coin.x, coin.y, coin.width, coin.height);
    }
  });
}
//function for coin pickup detection
function coinPickup(){
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

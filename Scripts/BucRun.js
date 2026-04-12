// main variable to track the current screen (menu or playing)
let currentScreen = "menu";
const CANVAS = document.getElementById("gameCanvas");
const CTX = CANVAS.getContext("2d");

// load SPRITES assets of each state
const SPRITES = {
  stand: new Image(),
  prejump: new Image(),
  jump: new Image(),
  land: new Image(),
  background0: new Image(),
  background1: new Image(),
  background2: new Image(),
  background3: new Image(),
  background4: new Image()
};
// sets the source for each sprite to the corresponding image file
SPRITES.jump.src = "Assets/BuckyJumping.png";
SPRITES.land.src = "Assets/BuckyLanding.png";
SPRITES.prejump.src = "Assets/BuckyPreJump.png";
SPRITES.stand.src = "Assets/BuckyRunning.png";
SPRITES.background0.src = "Assets/roadsidewalktrees.png";
SPRITES.background1.src = "Assets/clouds1.png";
SPRITES.background2.src = "Assets/clouds2.png";
SPRITES.background3.src = "Assets/clouds3.png";
SPRITES.background4.src = "Assets/sunsky.png";


const GROUND_Y = 350;
const MAX_JUMP_HEIGHT = 125; // maximum height the player can reach when jumping;
// player object with properties for position, size, speed, velocity, gravity, and jump state
let player = {
  x: 20,
  y: 350,
  size: 50,
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
  parallax: 0.8
}

let jumpQueued = false;
let jumpKeyHeld = false;

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
  background.x4 -= background.speed * Math.pow(background.parallax, 4);

  if (background.x0 <= -1600) {
    background.x0 = 0;
  }
  if(background.x1 <= -1600) {
    background.x1 = 0;
  }
  if(background.x2 <= -1600) {
    background.x2 = 0;
  }
  if(background.x3 <= -1600) {
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
  let currentSprite = SPRITES.stand;

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
    case "playing":

      update();
      drawSprite();
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

// main variable to track the current screen (menu or playing)
let currentScreen = "menu";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// load sprites assets of each state
const sprites = {
  stand: new Image(),
  prejump: new Image(),
  jump: new Image(),
  land: new Image(),
};
// sets the source for each sprite to the corresponding image file
sprites.jump.src = "Assets/BuckyJumping.png";
sprites.land.src = "Assets/BuckyLanding.png";
sprites.prejump.src = "Assets/BuckyPreJump.png";
sprites.stand.src = "Assets/BuckyRunning.png";

const groundY = 350;

// player object with properties for position, size, speed, velocity, gravity, and jump state
let player = {
  x: 20,
  y: 350,
  size: 50,
  speed: 3,
  velocityY: 0,
  gravity: 0.35,
  onGround: true,

  state: "stand",
  prejumpTimer: 0,
  landingTimer: 0,
};

let jumpQueued = false;

// key press event listener for jump input
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const key = e.key.toLowerCase();

  if ((key === "w" || key === " " || key === "arrowup") && player.onGround) {
    player.state = "prejump";
    player.prejumpTimer = 6; // how many frames to show prejump
    jumpQueued = true;
  }
});

// listens for clicks on the canvas for navigating the menu
canvas.addEventListener("click", () => {
  if (currentScreen === "menu") {
    currentScreen = "playing"; // Transition from menu to game
  }
});
// main update function to handle player movement, jumping, and landing logic
function update() {
  // handles the prejump state and lowers the timer until it reaches 0, then initiates the jump
  if (player.state === "prejump") {
    player.prejumpTimer--;
    // when prejump timer reaches 0 and jump is queued, initiates the jump based off jump velocity and changes the state to jump
    if (player.prejumpTimer <= 0 && jumpQueued) {
      player.velocityY = -player.speed * 3;
      player.state = "jump";
      player.onGround = false;
      jumpQueued = false;
    }
  }
  // if the player is in the air, apply gravity to the velocity and update the y position
  if (!player.onGround) {
    player.velocityY += player.gravity;
    player.y += player.velocityY;
  }
  // if the player has reached the ground, reset the y position and velocity, and handle landing state
  if (player.y >= groundY) {
    const wasInAir = !player.onGround || player.state === "jump";

    player.y = groundY;
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // make the title text
  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BUC RUN", canvas.width / 2, 100);

  // draw the start button
  ctx.fillStyle = "#eeaa00";
  ctx.fillRect(canvas.width / 2 - 100, 200, 200, 60);

  // text in button
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("START", canvas.width / 2, 240);
}

// draws the player's current sprite based on the state
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentSprite = sprites.stand;

  if (player.state === "prejump") currentSprite = sprites.prejump;
  else if (player.state === "jump") currentSprite = sprites.jump;
  else if (player.state === "land") currentSprite = sprites.land;

  ctx.drawImage(currentSprite, player.x, player.y, player.size, player.size);
}
// main game loop to update and draw the game state
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
// main loop to handle screen rendering and game updates
function mainLoop() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // switch statement to change between the screens
  switch (currentScreen) {
    case "menu":
      drawMainMenu();
      break;
    case "playing":
    case "playing":
      update();
      draw();
      break;
  }

  // call the function again
  requestAnimationFrame(mainLoop);
}

// wait until all images are loaded
let loadedCount = 0;
const totalImages = Object.keys(sprites).length;

for (let key in sprites) {
  sprites[key].onload = () => {
    loadedCount++;
    if (loadedCount === totalImages) {
      mainLoop();
    }
  };
}

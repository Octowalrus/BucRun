const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const sprites = {
  stand: new Image(),
  prejump: new Image(),
  jump: new Image(),
  land: new Image()
};

sprites.jump.src = "Assets/BuckyJumping.png";
sprites.land.src = "Assets/BuckyLanding.png";
sprites.prejump.src = "Assets/BuckyPreJump.png";
sprites.stand.src = "Assets/BuckyRunning.png";

const groundY = 350;

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
  landingTimer: 0
};

let jumpQueued = false;

// key press
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const key = e.key.toLowerCase();

  if ((key === "w" || key === " " || key === "arrowup") && player.onGround) {
    player.state = "prejump";
    player.prejumpTimer = 6; // how many frames to show prejump
    jumpQueued = true;
    player.onGround = false;
  }
});

function update() {
  // handle prejump delay
  if (player.state === "prejump") {
    player.prejumpTimer--;

    if (player.prejumpTimer <= 0 && jumpQueued) {
      player.velocityY = -player.speed * 3;
      player.state = "jump";
      jumpQueued = false;
    }
  }

  // apply gravity only after actual jump starts
  if (player.state === "jump" || !player.onGround) {
    player.velocityY += player.gravity;
    player.y += player.velocityY;
  }

  // landing check
  if (player.y >= groundY) {
    const wasInAir = !player.onGround || player.state === "jump";

    player.y = groundY;
    player.velocityY = 0;

    if (wasInAir && player.state !== "land" && player.state !== "prejump") {
      player.state = "land";
      player.landingTimer = 6; // how many frames to show landing
    }

    player.onGround = true;
  }

  // landing animation timer
  if (player.state === "land") {
    player.landingTimer--;

    if (player.landingTimer <= 0) {
      player.state = "stand";
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentSprite = sprites.stand;

  if (player.state === "prejump") currentSprite = sprites.prejump;
  else if (player.state === "jump") currentSprite = sprites.jump;
  else if (player.state === "land") currentSprite = sprites.land;

  ctx.drawImage(currentSprite, player.x, player.y, player.size, player.size);
}

function mainLoop() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // switch statement to change between the screens
  switch (currentScreen) {
    case 'menu':
      drawMainMenu();
      break;
    case 'playing':
      update();
      drawGame();
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
      gameLoop();
    }
  };
}
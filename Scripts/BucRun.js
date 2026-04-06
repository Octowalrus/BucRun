const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const groundY = 350;

let player = {
  x: 20,
  y: 350,
  size: 30,
  speed: 3,
  velocityY: 0,
  gravity: 0.35,
  onGround: true,
};

let background = {
  x: 0,
  y: 0,
  speed: 0.5,
};

let keys = {};

// Listen for key presses
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const key = e.key.toLowerCase();

  if ((key === "w" || key === " " || key === "arrowup") && player.onGround) {
    player.velocityY = -player.speed * 3;
    player.onGround = false;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function update() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y >= groundY) {
    player.y = groundY;
    player.velocityY = 0;
    player.onGround = true;
  }
}

function draw() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

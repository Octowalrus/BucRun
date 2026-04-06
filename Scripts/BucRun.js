let currentScreen = 'menu';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundY = 350;

let player = {
  x: 20,
  y: 350,
  x: 20,
  y: 350,
  size: 30,
  speed: 3,
  velocityY: 0,
  gravity: 0.35,
  onGround: true,
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
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  const key = e.key.toLowerCase();

  if (key === 'w' || key === ' ' || (key === 'arrowup' && player.onGround)) {
    player.velocityY = -player.speed * 3;
    player.onGround = false;
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('click', () => {
  if (currentScreen === 'menu') {
    currentScreen = 'playing'; // Transition from menu to game
  }
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

function drawMainMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // make the title text
  ctx.fillStyle = 'white';
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BUC RUN', canvas.width / 2, 100);

  // draw the start button
  ctx.fillStyle = '#eeaa00';
  ctx.fillRect(canvas.width / 2 - 100, 200, 200, 60);

  // text in button
  ctx.fillStyle = 'black';
  ctx.font = '30px Arial';
  ctx.fillText('START', canvas.width / 2, 240);
}

function drawGame() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.size, player.size);
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

mainLoop();

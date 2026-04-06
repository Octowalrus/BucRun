const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let player = {
        x: 50,
        y: 50,
        size: 30,
        speed: 3
    };

    let background = {
        x: 0,
        y: 0,
        speed: 0.5
    }

    let keys = {};

    // Listen for key presses
    document.addEventListener("keydown", (e) => {
        keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
        keys[e.key] = false;
    });

    function update() {
        
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

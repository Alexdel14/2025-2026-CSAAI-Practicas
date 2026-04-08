const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

canvas.width = 800;
canvas.height = 500;

document.addEventListener("keydown", e => {

    
    if (e.key === " ") {
        e.preventDefault();
    }

    keys[e.key] = true;
});


const shootSound = new Audio();
shootSound.src = "disparo_nave.mp3"; // tu sonido láser

const explosionSound = new Audio();
explosionSound.src = "explosion"; // tu sonido explosión


const playerImg = new Image();
playerImg.src = "nave.png"; // tu nave

const alienImg = new Image();
alienImg.src = "alien.webp"; // alien


let gameState = "menu";

startBtn.onclick = startGame;


const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 40,
    speed: 6,
    lives: 3,
    energy: 6,
    maxEnergy: 6
};


let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2
    });
}


let aliens = [];

function createAliens() {
    aliens = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            aliens.push({
                x: 100 + c * 70,
                y: 60 + r * 60,
                width: 40,
                height: 40
            });
        }
    }
}


function startGame() {
    startBtn.blur(); 

    gameState = "playing";

    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 70;
    player.lives = 3;
    player.energy = player.maxEnergy;

    bullets = [];
    enemyBullets = [];
    explosions = [];
    score = 0;

    direction = 1;
    speed = 1;

    createAliens();
}


let bullets = [];
let enemyBullets = [];


let explosions = [];

function createExplosion(x, y) {
    explosions.push({
        x,
        y,
        frame: 0
    });

    if (explosionSound.src) {
        explosionSound.currentTime = 0;
        explosionSound.play().catch(() => {});
    }
}


let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);


function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width)
        player.x += player.speed;
}

function shoot() {
    if (keys[" "] && player.energy > 0) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y
        });

        if (shootSound.src) {
            shootSound.currentTime = 0;
            shootSound.play().catch(() => {});
        }

        player.energy--;
        keys[" "] = false;
    }
}


setInterval(() => {
    if (gameState === "playing" && player.energy < player.maxEnergy)
        player.energy++;
}, 400);


let direction = 1;
let speed = 1;

function moveAliens() {
    let edge = false;

    aliens.forEach(a => {
        a.x += speed * direction;
        if (a.x <= 0 || a.x >= canvas.width - a.width) edge = true;
    });

    if (edge) {
        direction *= -1;
        aliens.forEach(a => a.y += 15);
    }

    speed = 1 + (24 - aliens.length) * 0.2;
}


setInterval(() => {
    if (gameState === "playing" && aliens.length > 0) {
        let shooter = aliens[Math.floor(Math.random() * aliens.length)];
        enemyBullets.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height
        });
    }
}, 800);


let score = 0;

function checkCollisions() {

    bullets.forEach((b, bi) => {
        aliens.forEach((a, ai) => {
            if (
                b.x < a.x + a.width &&
                b.x > a.x &&
                b.y < a.y + a.height &&
                b.y > a.y
            ) {
                createExplosion(a.x, a.y);
                aliens.splice(ai, 1);
                bullets.splice(bi, 1);
                score += 10;
            }
        });
    });

    enemyBullets.forEach((b, i) => {
        if (
            b.x > player.x &&
            b.x < player.x + player.width &&
            b.y > player.y &&
            b.y < player.y + player.height
        ) {
            createExplosion(player.x, player.y);
            enemyBullets.splice(i, 1);
            player.lives--;
        }
    });
}


function update() {
    if (gameState !== "playing") return;

    movePlayer();
    shoot();
    moveAliens();
    checkCollisions();

    bullets.forEach((b, i) => {
        b.y -= 7;
        if (b.y < 0) bullets.splice(i, 1);
    });

    enemyBullets.forEach((b, i) => {
        b.y += 4;
        if (b.y > canvas.height) enemyBullets.splice(i, 1);
    });

    explosions.forEach((e, i) => {
        e.frame++;
        if (e.frame > 20) explosions.splice(i, 1);
    });

    
    aliens.forEach(a => {
        if (a.y + a.height >= player.y) {
            gameState = "gameover";
        }
    });

        if (player.lives <= 0) gameState = "gameover";
        if (aliens.length === 0) gameState = "win";
    }




function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // estrellas
    ctx.fillStyle = "white";
    stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
        ctx.fillRect(s.x, s.y, 2, 2);
    });

    if (gameState === "playing") {

        // PLAYER
        if (playerImg.complete && playerImg.src) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = "cyan";
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // ALIENS
        aliens.forEach(a => {
            if (alienImg.complete && alienImg.src) {
                ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
            } else {
                ctx.fillStyle = "lime";
                ctx.fillRect(a.x, a.y, a.width, a.height);
            }
        });

        // DISPAROS
        ctx.fillStyle = "#00eaff";
        bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

        ctx.fillStyle = "red";
        enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

        // EXPLOSIONES
        ctx.fillStyle = "orange";
        explosions.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.frame, 0, Math.PI * 2);
            ctx.fill();
        });

        // HUD
        ctx.fillStyle = "#00eaff";
        ctx.font = "18px Courier New";
        ctx.shadowColor = "#00eaff";
        ctx.shadowBlur = 10;

        ctx.fillText("Puntos: " + score, 10, 20);
        ctx.fillText("Vidas: " + player.lives, 10, 40);

        ctx.shadowBlur = 0;
    }

    
    if (gameState === "gameover" || gameState === "win") {
        ctx.fillStyle = gameState === "gameover" ? "red" : "#00eaff";
        ctx.font = "40px Courier New";
        ctx.textAlign = "center";

        if (gameState === "gameover") {
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
            ctx.fillText("Puntos: " + score, canvas.width / 2, canvas.height / 2 + 50);
        }

        if (gameState === "win") {
            ctx.fillText("ENHORABUENA", canvas.width / 2, canvas.height / 2);
            ctx.fillText("HAS GANADO", canvas.width / 2, canvas.height / 2 + 50);
        }

        ctx.textAlign = "left";
    }
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
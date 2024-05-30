const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1800;
canvas.height = 900;

//Update Score

let score = 0;

// Hàm để cập nhật điểm số
function updateScore() {
    // Tính điểm số dựa trên số người chơi còn sống
    if (isPlayerAlive(player) && isPlayerAlive(player2)) {
        score++; // Nếu cả hai người chơi còn sống, tăng điểm bình thường
    } else {
        score += 0.5; // Nếu chỉ còn một người chơi sống, tăng điểm 1/2 so với bình thường
    }
}

// Hàm để vẽ điểm số lên canvas
function drawScore() {
    c.fillStyle = 'black';
    c.font = '30px Arial';
    c.textAlign = 'center';
    c.fillText('Score: ' + Math.floor(score), canvas.width / 2, 30); // Vẽ điểm số ở giữa màn hình
}


//Hàm chạy lúc end game
function endGame() {
    gamePaused = true;
    const endGameContainer = document.createElement('div');
    endGameContainer.classList.add('end-game-container');

    // Tạo thông báo kết thúc trò chơi
    const endGameMessage = document.createElement('div');
    endGameMessage.classList.add('end-game-message');
    endGameMessage.innerHTML = `<p>Game Over!</p><p>Your Score: ${Math.floor(score)}</p>`;

    // Tạo nút replay
    const replayButton = document.createElement('button');
    replayButton.textContent = 'Replay';
    replayButton.addEventListener('click', () => {
        location.reload(); // Tải lại trang web
    });

    // Thêm thông báo và nút replay vào container
    endGameContainer.appendChild(endGameMessage);
    endGameContainer.appendChild(replayButton);

    // Thêm container vào body của trang web
    document.body.appendChild(endGameContainer);
}

// Sound Effect
const jumpSound = new Audio('SoundEffect/jump.flac');
const landSound = new Audio('SoundEffect/jumpland.wav');
const deathSound = new Audio('SoundEffect/mutantdie.wav');
const laserShoot = new Audio('SoundEffect/LaserShoot.wav');
laserShoot.volume = 0.4;
const spaceShipSound = new Audio('SoundEffect/engine1.wav');
spaceShipSound.volume = 0.5;
const flyingLaserSound = new Audio('SoundEffect/laser-charge-175727.mp3');
flyingLaserSound.volume = 0.2;
const meteorHitSound = new Audio('SoundEffect/meteorHit.flac');

function playMeteorSound(duration) {
    meteorHitSound.currentTime = 0;
    meteorHitSound.play();

    setTimeout(() => {
        meteorHitSound.pause();
        meteorHitSound.currentTime = 0;
    }, duration);
}
// Background Music
const backgroundMusic = new Audio('SoundEffect/music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;


c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 1;
const meteorGravity = 0.03; 

class Sprite {
    constructor({ position, imageSrc }) {
        this.position = position;
        this.width = canvas.width;
        this.height = canvas.height; 
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

const background5 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './GameAssets/5.png' 
});
const background4 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './GameAssets/4.png' 
});
const background3 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './GameAssets/3.png' 
});
const background2 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './GameAssets/2.png' 
});
const background1 = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './GameAssets/1.png' 
});


class Player {
    constructor({ position, velocity, color, imageSrc }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 25;
        this.color = color;
        this.alive = true;
        this.isOnGround = false;
        this.immobile = false;
        this.canBeStunned = true;
        this.image = new Image();
        this.image.src = imageSrc;
        this.facingRight = true; 
    }

    draw() {
        if (this.alive) {
            c.save();
            c.translate(this.position.x, this.position.y);

            if (!this.facingRight) {
                c.scale(-1, 1); 
            }

            c.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

            c.restore();
        } else {
            c.fillStyle = 'gray';
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            c.fill();
            c.closePath();
        }
    }

    update() {
        this.draw();
        if (this.alive && !this.immobile) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            if (this.position.y + this.radius + this.velocity.y >= canvas.height) {
                this.velocity.y = 0;
                this.position.y = canvas.height - this.radius;
                this.isOnGround = true;
            } else {
                this.velocity.y += gravity;
                this.isOnGround = false;
            }

            if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= canvas.width) {
                this.alive = false;
                deathSound.play();
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
    }
}

// Player 1
const player = new Player({
    position: {
        x: 200,
        y: canvas.height - 50
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'red',
    imageSrc: './GameAssets/player.png' 
});

// Player 2
const player2 = new Player({
    position: {
        x: 400,
        y: canvas.height - 50
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    imageSrc: './GameAssets/player.png' 
});

class Meteor {
    constructor({ position, velocity, imageSrc }) {
        this.position = position;
        this.velocity = velocity;
        this.size = 100;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }

    update() {
        this.draw();
        this.position.y += this.velocity.y;

        if (this.position.y > canvas.height) {
            playMeteorSound(200);
            this.velocity.y = 0;
            this.position.y = -this.size;
            this.position.x = Math.random() * canvas.width;
        } else {
            this.velocity.y += meteorGravity;
        }
    }
}



// tạo Meteors
const meteors = [];
for (let i = 0; i < 3; i++) {
    meteors.push(new Meteor({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height
        },
        velocity: {
            x: 0,
            y: 1
        },
        imageSrc: './GameAssets/meteor.png' 
    }));
}

//Tạo keys nhận input
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
};

// Check va chạm giữa 2 player
function detectCollision(player1, player2) {
    const dx = player1.position.x - player2.position.x;
    const dy = player1.position.y - player2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < player1.radius + player2.radius;
}

// Check va chạm với thiên thạch
function detectMeteorCollision(player, meteor) {
    const dx = Math.abs(player.position.x - meteor.position.x - meteor.size / 2);
    const dy = Math.abs(player.position.y - meteor.position.y - meteor.size / 2);

    if (dx < player.radius + meteor.size / 2 && dy < player.radius + meteor.size / 2) {
        return true;
    }
    return false;
}

// 2 player chạm vào nhau sẽ bị choáng
function handleCollision(player1, player2) {
    if (detectCollision(player1, player2) && player1.canBeStunned && player2.canBeStunned) {
        // Make players immobile for 0.5 seconds
        landSound.play();
        player1.immobile = true;
        player2.immobile = true;
        setTimeout(() => {
            player1.immobile = false;
            player2.immobile = false;
        }, 500);

        // Set stun cooldown for 2 seconds
        player1.canBeStunned = false;
        player2.canBeStunned = false;
        setTimeout(() => {
            player1.canBeStunned = true;
            player2.canBeStunned = true;
        }, 2000);
    }
}
class Laser {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = canvas.width / 6;
        this.height = 20; 
        this.color = 'red';
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.y += this.velocity.y;

        if (this.position.y > canvas.height) {
            this.velocity.y = 0;
            this.position.y = -this.size;
            this.position.x = Math.random() * canvas.width;
        } else {
            this.velocity.y += 0.02;
        }
    }
}


const lasers = [];

function createLaser() {
    const newLaser = new Laser({
        position: {
            x: Math.random() * canvas.width,
            y: -10 
        },
        velocity: {
            x: 0,
            y: 4 
        }
    });
    lasers.push(newLaser);
}

setInterval(createLaser, 2000); 

function handleLaserCollision(player) {
    lasers.forEach(laser => {
        if (player.position.x < laser.position.x + laser.width &&
            player.position.x + player.radius > laser.position.x &&
            player.position.y < laser.position.y + laser.height &&
            player.position.y + player.radius > laser.position.y) {
            player.alive = false;
            deathSound.play();
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });
}

class Rocket {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.size = 50;
        this.angle = 0;
    }

    draw() {
        c.fillStyle = 'yellow'; 
        c.save(); 
        c.translate(this.position.x, this.position.y);
        c.rotate(this.angle); 

        c.beginPath();
        c.moveTo(0, -this.size / 2);
        c.lineTo(this.size / 2, this.size / 2); 
        c.lineTo(-this.size / 2, this.size / 2);
        c.closePath();
        c.fill();

        c.restore(); 
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;

        // Reset vị trí rocket nếu nó đi ra khỏi màn hình
        if (this.position.x > canvas.width || this.position.x + this.size < 0) {
            this.velocity.x = -this.velocity.x; 
            this.position.y = Math.random() * canvas.height;
            spaceShipSound.play();
        }
    }
}

const rocketSpeed = 6;

// Rockets
const rockets = [];
const numRockets = 5; 
for (let i = 0; i < numRockets; i++) {
    const startX = Math.random() < 0.5 ? -30 : canvas.width + 30; 
    const startY = Math.random() * canvas.height;
    const velocityX = rocketSpeed; 
    spaceShipSound.play();
    rockets.push(new Rocket({
        position: { x: startX, y: startY },
        velocity: { x: velocityX, y: 0 }
    }));
}


function handleRocketCollision(player) {
    rockets.forEach(rocket => {
        if (player.position.x < rocket.position.x + rocket.size &&
            player.position.x + player.radius > rocket.position.x &&
            player.position.y < rocket.position.y + rocket.size &&
            player.position.y + player.radius > rocket.position.y) {
            player.alive = false;
            deathSound.play();
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });
}

class ColumnLaser {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 60; 
        this.height = canvas.height; 
        this.startTime = Date.now();
        this.blueDuration = 800;
        this.redDuration = 1300; 
    }

    draw() {
        let color;
        const currentTime = Date.now() - this.startTime;
        if (currentTime < this.blueDuration) {
            color = 'green';
        } else if (currentTime < this.redDuration) {
            color = 'red'; 
            laserShoot.play();
        } else {
            return; 
        }
        c.fillStyle = color;
        c.fillRect(this.position.x, 0, this.width, this.height);
    }

    update() {
        this.draw();
    }

    isAlive() {
        return Date.now() - this.startTime < this.redDuration;
    }
}
const columnLasers = [];

function createColumnLaser() {
    const x = Math.random() * (canvas.width - 20); 
    const newColumnLaser = new ColumnLaser({ position: { x: x }, velocity: { x: 0, y: 0 } });
    columnLasers.push(newColumnLaser);
}

setInterval(createColumnLaser, 2500); 

function handleColumnLaserCollision(player) {
    columnLasers.forEach((columnLaser, index) => {
        const currentTime = Date.now() - columnLaser.startTime;
        if (currentTime < columnLaser.blueDuration) {
            return; 
        }
        if (player.position.x < columnLaser.position.x + columnLaser.width &&
            player.position.x + player.radius > columnLaser.position.x &&
            player.position.y < columnLaser.height &&
            player.position.y + player.radius > 0) {
            if (currentTime < columnLaser.redDuration) {
                player.alive = false; 
                deathSound.play();
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
        }
    });
}
function isPlayerAlive(player) {
    return player.alive;
}

let gamePaused = true; 

function animate() {
    if (gamePaused) return; 
    if (!isPlayerAlive(player) && !isPlayerAlive(player2)) {
        setTimeout(endGame, 200); 
        return;
    }
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    background5.update();
    background4.update();
    background3.update();
    background2.update();
    background1.update();
    player.update();
    player2.update();
    handleLaserCollision(player);
    handleLaserCollision(player2);
    handleCollision(player, player2);
    handleColumnLaserCollision(player);
    handleColumnLaserCollision(player2);
    handleRocketCollision(player);
    handleRocketCollision(player2);
    lasers.forEach(laser => laser.update());
    meteors.forEach(meteor => {
        meteor.update();
        if (detectMeteorCollision(player, meteor) || detectMeteorCollision(player2, meteor)) {
            if (detectMeteorCollision(player, meteor)) {
                player.alive = false;
                deathSound.play();
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
            if (detectMeteorCollision(player2, meteor)) {
                player2.alive = false;
                deathSound.play();
                player2.velocity.x = 0;
                player2.velocity.y = 0;
            }
        }
    });
    rockets.forEach(rocket => rocket.update());
    columnLasers.forEach((columnLaser, index) => {
        columnLaser.update();
        if (!columnLaser.isAlive()) {
            columnLasers.splice(index, 1);
        }
    });
    if (!player.immobile && player.alive) {
        if (keys.a.pressed) {
            player.velocity.x = -10;
        } else if (keys.d.pressed) {
            player.velocity.x = 10;
        } else {
            player.velocity.x = 0;
        }
    }
    if (!player2.immobile && player2.alive) {
        if (keys.ArrowRight.pressed) {
            player2.velocity.x = 10;
        } else if (keys.ArrowLeft.pressed) {
            player2.velocity.x = -10;
        } else {
            player2.velocity.x = 0;
        }
    }
    updateScore();
    drawScore();
}

// Nhận input
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = true;
            player.facingRight = true;
            break;
        case 'd':
            keys.d.pressed = true;
            player.facingRight = false;
            break;
        case ' ':
            if (player.isOnGround) {
                jumpSound.play();
                player.velocity.y = -20;
            }
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            player2.facingRight = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            player2.facingRight = false;
            break;
        case 'ArrowUp':
            if (player2.isOnGround) {
                jumpSound.play();
                player2.velocity.y = -20;
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }
});


function startGame() {
    gamePaused = false;
    document.getElementById('menu').style.display = 'none'; 
    canvas.style.display = 'block'; 
    backgroundMusic.play();
    animate(); 
}
document.getElementById('playButton').addEventListener('click', startGame);
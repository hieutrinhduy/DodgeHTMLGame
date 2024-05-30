const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1800;
canvas.height = 900;


// Sound Effect

var sfx = {
    push: new Howl({
       src: [
          'https://assets.codepen.io/21542/howler-push.mp3',
       ]
    }),
    boost: new Howl({
       src: [
          'https://assets.codepen.io/21542/howler-sfx-levelup.mp3'
       ],
       loop: false,
       onend: function() {
          console.log("Done playing sfx!")
       }
    })
 }

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 2;
const meteorGravity = 0.01; // Slower gravity for meteors

class Sprite {
    constructor({ position, velocity, color }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 25; // Radius of the circle
        this.color = color;
        this.alive = true;
        this.isOnGround = false;
        this.immobile = false; // Property to handle immobility
        this.canBeStunned = true; // Property to handle stun cooldown
    }

    draw() {
        c.beginPath();
        if (this.alive) {
            c.fillStyle = this.color;
        } else {
            c.fillStyle = 'gray'; // Color to indicate "dead" state
        }
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        if (this.alive && !this.immobile) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            // Bottom collision detection
            if (this.position.y + this.radius + this.velocity.y >= canvas.height) {
                this.velocity.y = 0;
                this.position.y = canvas.height - this.radius; // Ensure the player stays on the ground
                this.isOnGround = true; // Player is on the ground
            } else {
                this.velocity.y += gravity; // Apply gravity
                this.isOnGround = false; // Player is in the air
            }

            // Left and right collision detection
            if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= canvas.width) {
                this.alive = false;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
    }
}

class Meteor {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.size = 30; // Size of the meteor
    }

    draw() {
        c.fillStyle = 'gray';
        c.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    update() {
        this.draw();
        this.position.y += this.velocity.y;

        // Reset meteor position if it goes off the screen
        if (this.position.y > canvas.height) {
            this.velocity.y = 0;
            this.position.y = -this.size;
            this.position.x = Math.random() * canvas.width;
        } else {
            this.velocity.y += meteorGravity;
        }
    }
}

// Player 1
const player = new Sprite({
    position: {
        x: 200, // Start position so that the circle is fully visible
        y: canvas.height - 50
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'red'
});

// Player 2
const player2 = new Sprite({
    position: {
        x: 400,
        y: canvas.height - 50
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue'
});

// Meteors
const meteors = [];
for (let i = 0; i < 3; i++) { // Reduced number of meteors
    meteors.push(new Meteor({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height
        },
        velocity: {
            x: 0,
            y: 1 // Slower initial falling speed
        }
    }));
}

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

// Function to check collision between two circles
function detectCollision(player1, player2) {
    const dx = player1.position.x - player2.position.x;
    const dy = player1.position.y - player2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < player1.radius + player2.radius;
}

// Function to check collision between player and meteor
function detectMeteorCollision(player, meteor) {
    const dx = Math.abs(player.position.x - meteor.position.x - meteor.size / 2);
    const dy = Math.abs(player.position.y - meteor.position.y - meteor.size / 2);

    if (dx < player.radius + meteor.size / 2 && dy < player.radius + meteor.size / 2) {
        return true;
    }
    return false;
}

// Function to handle collision response
function handleCollision(player1, player2) {
    if (detectCollision(player1, player2) && player1.canBeStunned && player2.canBeStunned) {
        // Make players immobile for 0.5 seconds
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
        this.width = canvas.width / 6; // Chiều rộng của laser là 1/4 của màn hình
        this.height = 10; // Chiều cao của laser
        this.color = 'red'; // Màu sắc của laser
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
            this.velocity.y += 0.05;
        }
    }
}


const lasers = [];

function createLaser() {
    const newLaser = new Laser({
        position: {
            x: Math.random() * canvas.width, // Tọa độ x ngẫu nhiên
            y: -10 // Bắt đầu từ trên cùng của màn hình
        },
        velocity: {
            x: 0,
            y: 2 // Tốc độ di chuyển của laser
        }
    });
    lasers.push(newLaser);
}

setInterval(createLaser, 2000); // Tạo laser mới cứ mỗi 2 giây

function handleLaserCollision(player) {
    lasers.forEach(laser => {
        if (player.position.x < laser.position.x + laser.width &&
            player.position.x + player.radius > laser.position.x &&
            player.position.y < laser.position.y + laser.height &&
            player.position.y + player.radius > laser.position.y) {
            player.alive = false;
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });
}

class Rocket {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.size = 30; // Kích thước của rocket
        this.angle = 0; // Góc quay của rocket
    }

    draw() {
        c.fillStyle = 'yellow'; // Màu vàng
        c.save(); // Lưu trạng thái hiện tại của ngữ cảnh vẽ
        c.translate(this.position.x, this.position.y); // Di chuyển ngữ cảnh vẽ đến vị trí của rocket
        c.rotate(this.angle); // Quay ngữ cảnh vẽ theo góc quay của rocket

        // Vẽ rocket dưới dạng hình tam giác
        c.beginPath();
        c.moveTo(0, -this.size / 2); // Đỉnh của tam giác
        c.lineTo(this.size / 2, this.size / 2); // Đỉnh dưới bên phải
        c.lineTo(-this.size / 2, this.size / 2); // Đỉnh dưới bên trái
        c.closePath();
        c.fill();

        c.restore(); // Khôi phục trạng thái của ngữ cảnh vẽ
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;

        // Tính góc quay dựa trên hướng di chuyển của rocket
        this.angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;

        // Reset vị trí rocket nếu nó đi ra khỏi màn hình
        if (this.position.x > canvas.width || this.position.x + this.size < 0) {
            this.velocity.x = -this.velocity.x; // Đảo chiều vận tốc để rocket di chuyển về phía ngược lại
            this.position.y = Math.random() * canvas.height; // Đặt lại vị trí ngẫu nhiên trên trục y
        }
    }
}



// Rockets
// Rockets
const rocketSpeed = 5; // Giá trị cố định cho tốc độ bay của rocket

// Rockets
const rockets = [];
const numRockets = 5; // Số lượng rocket được tạo
for (let i = 0; i < numRockets; i++) {
    const startX = Math.random() < 0.5 ? -30 : canvas.width + 30; // Chọn một trong hai cạnh để bắt đầu
    const startY = Math.random() * canvas.height; // Vị trí ngẫu nhiên trên trục y
    const velocityX = rocketSpeed; // Sử dụng giá trị cố định cho tốc độ bay
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
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });
}

class ColumnLaser {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 20; // Chiều rộng của cột laser
        this.height = canvas.height; // Chiều cao của cột laser
        this.startTime = Date.now(); // Thời gian bắt đầu
        this.blueDuration = 800; // Thời gian hiển thị màu xanh lá cây (miligiây)
        this.redDuration = 1300; // Thời gian hiển thị màu đỏ (miligiây)
    }

    draw() {
        let color;
        const currentTime = Date.now() - this.startTime;
        if (currentTime < this.blueDuration) {
            color = 'green'; // Màu xanh lá cây
        } else if (currentTime < this.redDuration) {
            color = 'red'; // Màu đỏ
        } else {
            return; // Không vẽ cột laser nếu đã hết thời gian
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
    const x = Math.random() * (canvas.width - 20); // Vị trí ngẫu nhiên trên trục x
    const newColumnLaser = new ColumnLaser({ position: { x: x }, velocity: { x: 0, y: 0 } });
    columnLasers.push(newColumnLaser);
}

setInterval(createColumnLaser, 800); // Tạo cột laser mới cứ mỗi 0.8 giây

function handleColumnLaserCollision(player) {
    columnLasers.forEach((columnLaser, index) => {
        const currentTime = Date.now() - columnLaser.startTime;
        if (currentTime < columnLaser.blueDuration) {
            return; // Không xử lý va chạm với cột laser màu xanh lá cây
        }
        if (player.position.x < columnLaser.position.x + columnLaser.width &&
            player.position.x + player.radius > columnLaser.position.x &&
            player.position.y < columnLaser.height &&
            player.position.y + player.radius > 0) {
            if (currentTime < columnLaser.redDuration) {
                player.alive = false; // Chết nếu va chạm với cột laser màu đỏ
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
        }
    });
}
function isPlayerAlive(player) {
    return player.alive;
}

let gamePaused = false; // Variable to track if the game is paused

function animate() {
    if (gamePaused) return; // If the game is paused, stop the animation loop
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
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
                player.velocity.x = 0;
                player.velocity.y = 0;
            }
            if (detectMeteorCollision(player2, meteor)) {
                player2.alive = false;
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
    displayWinner(); // Call the function to display winner
}

function displayWinner() {
    if (!isPlayerAlive(player) || !isPlayerAlive(player2)) {
        const winnerContainer = document.getElementById('winnerContainer');
        const winnerText = document.createElement('p');
        winnerText.textContent = !isPlayerAlive(player) ? 'Player 2 is the winner!' : 'Player 1 is the winner!';
        const replayButton = document.createElement('button');
        replayButton.textContent = 'Replay';
        replayButton.addEventListener('click', () => {
            location.reload();
        });
        winnerContainer.appendChild(winnerText);
        winnerContainer.appendChild(replayButton);
        gamePaused = true; // Pause the game
        sfx.push.play();
    }
}
animate();



window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Player 1 controls
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case ' ':
            if (player.isOnGround) {
                player.velocity.y = -20; // Set a negative velocity to make the player jump
            }
            break;
        // Player 2 controls
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowUp':
            if (player2.isOnGround) {
                player2.velocity.y = -20; // Set a negative velocity to make the player jump
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // Player 1 controls
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        // Player 2 controls
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});

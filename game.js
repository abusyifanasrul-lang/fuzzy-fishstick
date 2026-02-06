const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");

const keys = {
  left: false,
  right: false,
  jump: false,
};

const player = {
  x: 40,
  y: 520,
  width: 26,
  height: 32,
  velocityX: 0,
  velocityY: 0,
  speed: 2.4,
  jumpStrength: 9.5,
  grounded: false,
};

const gravity = 0.35;
let jumpBoost = 0;

const platforms = [
  { x: 0, y: 590, width: 360, height: 50 },
  { x: 40, y: 500, width: 90, height: 12 },
  { x: 170, y: 450, width: 90, height: 12 },
  { x: 260, y: 390, width: 70, height: 12 },
  { x: 140, y: 330, width: 80, height: 12 },
  { x: 20, y: 280, width: 90, height: 12 },
  { x: 220, y: 240, width: 90, height: 12 },
  { x: 120, y: 190, width: 80, height: 12 },
];

const stars = [
  { x: 70, y: 470, collected: false },
  { x: 190, y: 420, collected: false },
  { x: 250, y: 210, collected: false },
];

const flag = { x: 300, y: 150, reached: false };

function updateStatus() {
  const collected = stars.filter((star) => star.collected).length;
  if (flag.reached) {
    statusEl.textContent = "You made it! Tap refresh to play again.";
    return;
  }
  if (collected === stars.length) {
    statusEl.textContent = "Jump boost active! Reach the flag.";
    return;
  }
  statusEl.textContent = `Stars collected: ${collected}/3`;
}

function setKey(name, pressed) {
  keys[name] = pressed;
}

function handleJump() {
  if (!player.grounded) return;
  const boost = jumpBoost > 0 ? 2 : 0;
  player.velocityY = -(player.jumpStrength + boost);
  player.grounded = false;
}

function update() {
  player.velocityX = 0;
  if (keys.left) player.velocityX = -player.speed;
  if (keys.right) player.velocityX = player.speed;

  player.x += player.velocityX;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  player.velocityY += gravity;
  player.y += player.velocityY;

  player.grounded = false;

  platforms.forEach((platform) => {
    const isAbove =
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + platform.height + 6;
    const withinX =
      player.x + player.width > platform.x && player.x < platform.x + platform.width;

    if (isAbove && withinX && player.velocityY >= 0) {
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.grounded = true;
    }
  });

  if (player.y > canvas.height) {
    player.x = 40;
    player.y = 520;
    player.velocityY = 0;
  }

  stars.forEach((star) => {
    if (star.collected) return;
    const hit =
      player.x < star.x + 12 &&
      player.x + player.width > star.x &&
      player.y < star.y + 12 &&
      player.y + player.height > star.y;
    if (hit) {
      star.collected = true;
      jumpBoost += 1;
    }
  });

  if (!flag.reached) {
    const reached =
      player.x + player.width > flag.x &&
      player.x < flag.x + 18 &&
      player.y + player.height > flag.y &&
      player.y < flag.y + 40;
    if (reached) {
      flag.reached = true;
    }
  }

  updateStatus();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1c2654");
  gradient.addColorStop(1, "#0c1128");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#202e5c";
  ctx.fillRect(0, 0, canvas.width, 80);
}

function drawPlatforms() {
  ctx.fillStyle = "#3a4c98";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawPlayer() {
  ctx.fillStyle = "#ff9f3e";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#fff3e0";
  ctx.fillRect(player.x + 6, player.y + 8, 6, 6);
}

function drawStars() {
  stars.forEach((star) => {
    if (star.collected) return;
    ctx.fillStyle = "#ffd54a";
    ctx.beginPath();
    ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFlag() {
  ctx.fillStyle = "#88f2ff";
  ctx.fillRect(flag.x, flag.y, 4, 40);
  ctx.fillStyle = flag.reached ? "#44ff9c" : "#ff4d7a";
  ctx.fillRect(flag.x + 4, flag.y + 4, 20, 12);
}

function loop() {
  update();
  drawBackground();
  drawPlatforms();
  drawStars();
  drawFlag();
  drawPlayer();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") setKey("left", true);
  if (event.key === "ArrowRight") setKey("right", true);
  if (event.key === "ArrowUp") handleJump();
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") setKey("left", false);
  if (event.key === "ArrowRight") setKey("right", false);
});

function bindTouch(id, onStart, onEnd) {
  const button = document.getElementById(id);
  button.addEventListener("touchstart", (event) => {
    event.preventDefault();
    onStart();
  });
  button.addEventListener("touchend", (event) => {
    event.preventDefault();
    onEnd();
  });
  button.addEventListener("mousedown", (event) => {
    event.preventDefault();
    onStart();
  });
  button.addEventListener("mouseup", (event) => {
    event.preventDefault();
    onEnd();
  });
  button.addEventListener("mouseleave", onEnd);
}

bindTouch("left", () => setKey("left", true), () => setKey("left", false));
bindTouch("right", () => setKey("right", true), () => setKey("right", false));
bindTouch("jump", handleJump, () => {});

updateStatus();
loop();

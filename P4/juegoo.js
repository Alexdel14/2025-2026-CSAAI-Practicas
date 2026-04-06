const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const levelSpan = document.getElementById("level");
const timeSpan = document.getElementById("time");
const statusSpan = document.getElementById("status");
const message = document.getElementById("message");
const levelSelect = document.getElementById("levelSelect");
const pairSelect = document.getElementById("pairSelect");

const music = document.getElementById("music");
const tick = document.getElementById("tick");
const musicBtn = document.getElementById("musicToggleBtn");

let cells = [];
let gameRunning = false;
let timer = 0;
let interval;
let speed = 600;
let musicOn = true;

/* PAREJAS */
const pairs = {
  casa: [
    { emoji: "🏠", text: "casa" },
    { emoji: "🛏️", text: "cama" }
  ],
  pato: [
    { emoji: "🦆", text: "pato" },
    { emoji: "🐱", text: "gato" }
  ],
  queso: [
    { emoji: "🧀", text: "queso" },
    { emoji: "💋", text: "beso" }
  ],
  luna: [
    { emoji: "🌙", text: "luna" },
    { emoji: "🛏️", text: "cuna" }
  ]
};

/* GRID */
function createGrid() {
  grid.innerHTML = "";
  cells = [];

  for (let i = 0; i < 8; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    grid.appendChild(div);
    cells.push(div);
  }
}

/* NIVEL */
function getLevelData(level) {
  const pair = pairs[pairSelect.value];

  let arr = [...Array(4).fill(pair[0]), ...Array(4).fill(pair[1])];

  if (level === 1) return arr;
  if (level === 2) return [pair[0], pair[1], pair[0], pair[1], pair[0], pair[1], pair[0], pair[1]];
  return shuffle(arr);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* PINTAR */
function renderCells(data) {
  cells.forEach((cell, i) => {
    cell.innerHTML = `
      <div>${data[i].emoji}</div>
      <span>${data[i].text}</span>
    `;
  });
}

/* SECUENCIA */
async function runSequence(level) {
  const data = getLevelData(level);
  renderCells(data);

  for (let i = 0; i < 8; i++) {
    if (!gameRunning) return;

    cells[i].classList.add("active");
    message.textContent = data[i].text;

    tick.currentTime = 0;
    tick.play();

    await sleep(speed);

    cells[i].classList.remove("active");
  }
}

/* START */
async function startGame() {
  gameRunning = true;
  timer = 0;

  startBtn.disabled = true;
  levelSelect.disabled = true;
  pairSelect.disabled = true;

  statusSpan.textContent = "Jugando";

  if (musicOn) music.play();

  interval = setInterval(() => {
    timer += 0.1;
    timeSpan.textContent = timer.toFixed(1) + "s";
  }, 100);

  for (let lvl = parseInt(levelSelect.value); lvl <= 5; lvl++) {
    if (!gameRunning) return;

    levelSpan.textContent = `${lvl}/5`;
    message.textContent = "Prepárate...";
    await sleep(1000);

    speed = 700 - (lvl * 100);

    await runSequence(lvl);
  }

  endGame();
}

/* STOP */
function stopGame() {
  gameRunning = false;
  clearInterval(interval);
  music.pause();

  statusSpan.textContent = "Detenido";
  startBtn.disabled = false;
  levelSelect.disabled = false;
  pairSelect.disabled = false;
}

/* END */
function endGame() {
  gameRunning = false;
  clearInterval(interval);
  music.pause();

  statusSpan.textContent = "Finalizado";
  message.textContent = "🎉 ¡Juego terminado!";
  startBtn.disabled = false;
  levelSelect.disabled = false;
  pairSelect.disabled = false;
}

/* MÚSICA */
musicBtn.onclick = () => {
  musicOn = !musicOn;

  if (musicOn) {
    musicBtn.textContent = "🎵 Música ON";
    if (gameRunning) music.play();
  } else {
    musicBtn.textContent = "🔇 Música OFF";
    music.pause();
  }
};

/* UTIL */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

startBtn.onclick = startGame;
stopBtn.onclick = stopGame;

createGrid();
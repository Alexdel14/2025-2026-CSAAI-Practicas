const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const levelSpan = document.getElementById("level");
const timeSpan = document.getElementById("time");
const statusSpan = document.getElementById("status");
const message = document.getElementById("message");

const levelSelect = document.getElementById("levelSelect");
const pairSelect = document.getElementById("pairSelect");
const varMode = document.getElementById("varMode");

const tick = document.getElementById("tick");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

let cells = [];
let gameRunning = false;
let timer = 0;
let interval;
let speed = 500;
let musicOn = true;
let isPlayingRecording = false;

/* 🎤 GRABACIÓN */
let mediaRecorder;
let audioChunks = [];

const pairs = {
  casa: [{emoji:"🏠",text:"casa"},{emoji:"🛏️",text:"cama"}],
  pato: [{emoji:"🦆",text:"pato"},{emoji:"🐱",text:"gato"}],
  queso: [{emoji:"🧀",text:"queso"},{emoji:"💋",text:"beso"}],
  luna: [{emoji:"🌙",text:"luna"},{emoji:"🛏️",text:"cuna"}]
};

function createGrid(){
  grid.innerHTML="";
  cells=[];
  for(let i=0;i<8;i++){
    let div=document.createElement("div");
    div.className="cell";
    grid.appendChild(div);
    cells.push(div);
  }
}

function getData(level){
  let pair=pairs[pairSelect.value];
  let arr=[...Array(4).fill(pair[0]),...Array(4).fill(pair[1])];
  if(level===2) return [pair[0],pair[1],pair[0],pair[1],pair[0],pair[1],pair[0],pair[1]];
  if(level>2) return arr.sort(()=>Math.random()-0.5);
  return arr;
}

function render(data){
  cells.forEach((c,i)=>{
    c.innerHTML=`<div>${data[i].emoji}</div><span>${data[i].text}</span>`;
  });
}

/* 🎤 GRABAR */
async function startRecording(){
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();
}

function stopRecording(){
  mediaRecorder.stop();

  mediaRecorder.onstop = () => {
    const audio = new Audio(URL.createObjectURL(new Blob(audioChunks)));
    isPlayingRecording = true;

    audio.play();

    audio.onended = () => {
      isPlayingRecording = false;
    };
  };
}

/* SECUENCIA */
async function runLevel(level){
  let data=getData(level);
  render(data);

  for(let i=0;i<8;i++){
    if(!gameRunning) return;

    cells[i].classList.add("active");
    message.textContent=data[i].text;

    tick.currentTime=0;
    tick.play();

    await sleep(speed);

    cells[i].classList.remove("active");
  }
}

/* START */
async function startGame(){
  if(isPlayingRecording) return; // 🔒 bloqueo

  gameRunning=true;
  timer=0;

  if(varMode.checked) await startRecording();
  if(musicOn) music.play();

  interval=setInterval(()=>{
    timer+=0.1;
    timeSpan.textContent=timer.toFixed(1)+"s";
  },100);

  for(let lvl=parseInt(levelSelect.value);lvl<=5;lvl++){
    if(!gameRunning) return;

    levelSpan.textContent=`${lvl}/5`;
    message.textContent="Prepárate...";
    await sleep(800);

    speed=500-(lvl*60);
    await runLevel(lvl);
  }

  endGame();
}

/* STOP */
function stopGame(){
  gameRunning=false;
  clearInterval(interval);
  timer=0;
  timeSpan.textContent="0.0s";
  music.pause();
}

/* END */
function endGame(){
  gameRunning=false;
  clearInterval(interval);
  music.pause();

  message.textContent="🎤 Reproduciendo...";

  if(varMode.checked) stopRecording();
}

/* MÚSICA */
musicBtn.onclick = () => {
  musicOn=!musicOn;
  musicBtn.textContent = musicOn ? "🎵 Música ON" : "🔇 Música OFF";
  if(!musicOn) music.pause();
};

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

startBtn.onclick=startGame;
stopBtn.onclick=stopGame;

createGrid();
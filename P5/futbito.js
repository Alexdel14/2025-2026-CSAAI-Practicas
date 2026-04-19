const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let playing = false;
let paused = false;
let countdownActive = true;

let mode = "";
let scoreA = 0;
let scoreB = 0;

// sonidos
const goalSound = new Audio("https://actions.google.com/sounds/v1/sports/goal_scored.ogg");
const endSound = new Audio("https://actions.google.com/sounds/v1/alarms/air_horn.ogg");

// equipos
const player = { x:150,y:250,r:15,speed:3,team:"A" };
const mate   = { x:250,y:250,r:15,speed:2,team:"A" };

const enemy1 = { x:750,y:200,r:15,speed:2,team:"B" };
const enemy2 = { x:700,y:300,r:15,speed:2,team:"B" };

const players = [player,mate,enemy1,enemy2];

const ball = { x:450,y:250,r:10,vx:0,vy:0,friction:0.98 };

const keys = {};

document.addEventListener("keydown", e=>keys[e.key]=true);
document.addEventListener("keyup", e=>keys[e.key]=false);

// móvil
if ('ontouchstart' in window) {
  document.getElementById("mobileControls").style.display="flex";
}

document.querySelectorAll("[data-key]").forEach(btn=>{
  btn.ontouchstart=()=>keys[btn.dataset.key]=true;
  btn.ontouchend=()=>keys[btn.dataset.key]=false;
});

shootBtn.ontouchstart=()=>keys[" "]=true;
shootBtn.ontouchend=()=>keys[" "]=false;

// iniciar
function startGame(m){
  mode=m;
  document.getElementById("menu").style.display="none";
  canvas.style.display="block";
  playing=true;
  resetPositions();
  startCountdown();
  gameLoop();
}

function startCountdown(){
  countdownActive=true;
  let c=3;
  let msg=document.getElementById("message");

  let i=setInterval(()=>{
    msg.textContent=c;
    c--;
    if(c<0){
      msg.textContent="";
      countdownActive=false;
      clearInterval(i);
    }
  },1000);
}

function gameLoop(){
  if(!playing) return;
  if(!paused && !countdownActive) update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update(){
  movePlayer();
  ai(mate,true);
  ai(enemy1,false);
  ai(enemy2,false);
  moveBall();
  collisions();
  checkGoal();
}

function movePlayer(){
  if(keys["ArrowUp"]) player.y-=player.speed;
  if(keys["ArrowDown"]) player.y+=player.speed;
  if(keys["ArrowLeft"]) player.x-=player.speed;
  if(keys["ArrowRight"]) player.x+=player.speed;

  clamp(player);

  if(keys[" "]) shoot(player);
}

function ai(p,ally){
  let dx=ball.x-p.x;
  let dy=ball.y-p.y;
  let dist=Math.hypot(dx,dy);

  if(!ally && p===enemy2){
    moveTo(p,750,250);
    return;
  }

  if(dist<200){
    p.x+=dx*0.02;
    p.y+=dy*0.02;
  }else{
    moveTo(p, ally?300:600,250);
  }

  if(dist<30) shoot(p);
  clamp(p);
}

function moveTo(p,x,y){
  p.x+=(x-p.x)*0.02;
  p.y+=(y-p.y)*0.02;
}

function shoot(p){
  let dx=ball.x-p.x;
  let dy=ball.y-p.y;
  if(Math.hypot(dx,dy)<30){
    ball.vx=dx*0.6;
    ball.vy=dy*0.6;
  }
}

// ⚽ rebotes bien hechos
function moveBall(){
  ball.x+=ball.vx;
  ball.y+=ball.vy;

  ball.vx*=ball.friction;
  ball.vy*=ball.friction;

  let goalTop=canvas.height/2-60;
  let goalBottom=canvas.height/2+60;

  // paredes laterales (excepto portería)
  if(ball.x<ball.r){
    if(ball.y<goalTop || ball.y>goalBottom){
      ball.vx*=-1;
      ball.x=ball.r;
    }
  }

  if(ball.x>canvas.width-ball.r){
    if(ball.y<goalTop || ball.y>goalBottom){
      ball.vx*=-1;
      ball.x=canvas.width-ball.r;
    }
  }

  // arriba/abajo
  if(ball.y<ball.r || ball.y>canvas.height-ball.r){
    ball.vy*=-1;
  }
}

function collisions(){
  players.forEach(p=>{
    let dx=ball.x-p.x;
    let dy=ball.y-p.y;
    let dist=Math.hypot(dx,dy);
    if(dist<p.r+ball.r){
      ball.vx=dx*0.4;
      ball.vy=dy*0.4;
    }
  });
}

function checkGoal(){
  let top=canvas.height/2-60;
  let bottom=canvas.height/2+60;

  if(ball.x<0 && ball.y>top && ball.y<bottom){
    scoreB++; goal("Gol rival");
  }

  if(ball.x>canvas.width && ball.y>top && ball.y<bottom){
    scoreA++; goal("¡GOOOL!");
  }
}

function goal(text){
  goalSound.play();
  document.getElementById("message").textContent=text;
  updateScore();
  checkWin();

  setTimeout(()=>{
    resetPositions();
    startCountdown();
  },1500);
}

function updateScore(){
  document.getElementById("score").textContent=scoreA+" - "+scoreB;
}

function checkWin(){
  if((mode==="3"&&(scoreA===3||scoreB===3))||
     (mode==="golden"&&(scoreA===1||scoreB===1))){
    endSound.play();
    endGame(scoreA>scoreB?"🏆 GANASTE":"💀 PERDISTE");
  }
}

function endGame(text){
  playing=false;
  document.getElementById("endText").textContent=text;
  document.getElementById("endScreen").classList.remove("hidden");
}

function restart(){
  scoreA=scoreB=0;
  updateScore();
  document.getElementById("endScreen").classList.add("hidden");
  playing=true;
  resetPositions();
  startCountdown();
}

function togglePause(){
  paused=!paused;
}

function clamp(p){
  p.x=Math.max(p.r,Math.min(canvas.width-p.r,p.x));
  p.y=Math.max(p.r,Math.min(canvas.height-p.r,p.y));
}

function resetPositions(){
  player.x=150;player.y=250;
  mate.x=250;mate.y=250;
  enemy1.x=750;enemy1.y=200;
  enemy2.x=700;enemy2.y=300;
  ball.x=450;ball.y=250;
  ball.vx=ball.vy=0;
}

// 🎨 dibujo
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="white";
  ctx.strokeRect(0,0,canvas.width,canvas.height);

  // medio
  ctx.beginPath();
  ctx.moveTo(canvas.width/2,0);
  ctx.lineTo(canvas.width/2,canvas.height);
  ctx.stroke();

  // círculo
  ctx.beginPath();
  ctx.arc(canvas.width/2,canvas.height/2,50,0,Math.PI*2);
  ctx.stroke();

  // porterías
  drawGoal(0);
  drawGoal(canvas.width-20);

  // equipos
  drawPlayer(player,"white");
  drawPlayer(mate,"white");

  drawPlayer(enemy1,"#8B0000"); // azulgrana aproximado
  drawPlayer(enemy2,"#00008B");

  // balón
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
  ctx.fill();
}

function drawGoal(x){
  let y=canvas.height/2-60;
  ctx.fillStyle="#ccc";
  ctx.fillRect(x,y,20,120);

  ctx.strokeStyle="#888";
  for(let i=0;i<6;i++){
    ctx.beginPath();
    ctx.moveTo(x,y+i*20);
    ctx.lineTo(x+20,y+i*20);
    ctx.stroke();
  }
}

function drawPlayer(p,color){
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
  ctx.fill();
}
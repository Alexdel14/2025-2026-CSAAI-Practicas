const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let playing = false;
let paused = false;
let countdownActive = false;
let gameEnded = false;

let mode = "";
let scoreA = 0;
let scoreB = 0;

const overlay = document.getElementById("overlayText");

// 🔊 sonidos
const goalSound = new Audio("https://actions.google.com/sounds/v1/sports/goal_scored.ogg");
const whistleSound = new Audio("https://actions.google.com/sounds/v1/sports/referee_whistle.ogg");

// evitar scroll con espacio
document.addEventListener("keydown", e => {
  if (e.code === "Space") e.preventDefault();
});


const player = { x:120,y:250,r:15,speed:3 };
const mate   = { x:200,y:350,r:15,speed:2 };

const enemy1 = { x:780,y:200,r:15,speed:2 };
const enemy2 = { x:700,y:350,r:15,speed:2 };

const players = [player,mate,enemy1,enemy2];

const ball = { x:450,y:250,r:10,vx:0,vy:0 };

const keys = {};
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);

function startGame(m){
  mode=m;
  document.getElementById("menu").style.display="none";
  canvas.style.display="block";
  playing=true;
  gameEnded=false;
  scoreA=0; scoreB=0;
  resetPositions();
  startCountdown();
  gameLoop();
}

function startCountdown(){
  countdownActive=true;
  let c=3;
  overlay.textContent=c;

  let i=setInterval(()=>{
    c--;
    if(c>0) overlay.textContent=c;
    else if(c===0){
      overlay.textContent="GO!";
      whistleSound.play();
    }
    else{
      overlay.textContent="";
      countdownActive=false;
      clearInterval(i);
    }
  },1000);
}

function gameLoop(){
  if(!playing) return;

  if(!paused && !countdownActive && !gameEnded){
    update();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

function update(){
  movePlayer();
  ai(mate,true);
  ai(enemy1,false);
  ai(enemy2,false);
  moveBall();
  playerCollisions(); 
  checkGoal();
}

function movePlayer(){
  if(keys["ArrowUp"]) player.y-=player.speed;
  if(keys["ArrowDown"]) player.y+=player.speed;
  if(keys["ArrowLeft"]) player.x-=player.speed;
  if(keys["ArrowRight"]) player.x+=player.speed;

  clamp(player);

  let dx=ball.x-player.x;
  let dy=ball.y-player.y;
  let dist=Math.hypot(dx,dy);

  if(dist < 25){
    ball.vx = dx * 0.15;
    ball.vy = dy * 0.15;
  }

  if(keys[" "] && dist<30){
    ball.vx = dx * 0.8;
    ball.vy = dy * 0.8;
  }
}

function ai(p,ally){
  let dx=ball.x-p.x;
  let dy=ball.y-p.y;
  let dist=Math.hypot(dx,dy);

  let targetX = ally ? 300 : 600;

  if(dist < 180){
    p.x += dx * 0.02;
    p.y += dy * 0.02;
  } else {
    p.x += (targetX - p.x)*0.02;
    p.y += (250 - p.y)*0.02;
  }

  clamp(p);

  if(dist < 25){
    ball.vx = dx * 0.2;
    ball.vy = dy * 0.2;
  }
}


function playerCollisions(){
  for(let i=0;i<players.length;i++){
    for(let j=i+1;j<players.length;j++){
      let p1=players[i];
      let p2=players[j];

      let dx=p2.x-p1.x;
      let dy=p2.y-p1.y;
      let dist=Math.hypot(dx,dy);
      let minDist=p1.r+p2.r;

      if(dist < minDist){
        let angle=Math.atan2(dy,dx);
        let overlap=minDist-dist;

        p1.x -= Math.cos(angle)*overlap/2;
        p1.y -= Math.sin(angle)*overlap/2;
        p2.x += Math.cos(angle)*overlap/2;
        p2.y += Math.sin(angle)*overlap/2;
      }
    }
  }
}

function moveBall(){
  ball.x+=ball.vx;
  ball.y+=ball.vy;

  ball.vx*=0.99;
  ball.vy*=0.99;

  let goalTop=canvas.height/2-60;
  let goalBottom=canvas.height/2+60;

  if(ball.x<=ball.r){
    if(ball.y<goalTop||ball.y>goalBottom){
      ball.x=ball.r;
      ball.vx*=-1;
    }
  }

  if(ball.x>=canvas.width-ball.r){
    if(ball.y<goalTop||ball.y>goalBottom){
      ball.x=canvas.width-ball.r;
      ball.vx*=-1;
    }
  }

  if(ball.y<=ball.r || ball.y>=canvas.height-ball.r){
    ball.vy*=-1;
  }
}

function checkGoal(){
  let top=canvas.height/2-60;
  let bottom=canvas.height/2+60;

  if(ball.x<0 && ball.y>top && ball.y<bottom){
    scoreB++; goal();
  }

  if(ball.x>canvas.width && ball.y>top && ball.y<bottom){
    scoreA++; goal();
  }
}

function goal(){
  goalSound.play();
  updateScore();

  // 🏁 FIN DE PARTIDA
  if(mode==="3" && (scoreA===3 || scoreB===3)){
    endGame();
    return;
  }

  if(mode==="golden"){
    endGame();
    return;
  }

  resetPositions();
  startCountdown();
}

function endGame(){
  gameEnded=true;
  whistleSound.play();
  overlay.textContent = scoreA > scoreB ? "🏆 GANASTE" : "💀 PERDISTE";
}

function updateScore(){
  document.getElementById("score").textContent=scoreA+" - "+scoreB;
}

function resetPositions(){
  player.x=120; player.y=250;
  mate.x=200; mate.y=350;
  enemy1.x=780; enemy1.y=200;
  enemy2.x=700; enemy2.y=350;
  ball.x=450; ball.y=250;
  ball.vx=0; ball.vy=0;
}

function togglePause(){
  paused=!paused;
  overlay.textContent = paused ? "PAUSA" : "";
}

function restart(){
  scoreA=0; scoreB=0;
  gameEnded=false;
  updateScore();
  resetPositions();
  startCountdown();
}

function goMenu(){
  location.reload();
}

function clamp(p){
  p.x=Math.max(p.r,Math.min(canvas.width-p.r,p.x));
  p.y=Math.max(p.r,Math.min(canvas.height-p.r,p.y));
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="#00eaff";
  ctx.strokeRect(0,0,canvas.width,canvas.height);

  ctx.beginPath();
  ctx.moveTo(canvas.width/2,0);
  ctx.lineTo(canvas.width/2,canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width/2,canvas.height/2,50,0,Math.PI*2);
  ctx.stroke();

  ctx.fillStyle="#00eaff";
  ctx.fillRect(0,canvas.height/2-60,20,120);
  ctx.fillRect(canvas.width-20,canvas.height/2-60,20,120);

  drawPlayer(player,"#ff00ff");
  drawPlayer(mate,"#ff00ff");

  drawPlayer(enemy1,"#ffff00");
  drawPlayer(enemy2,"#ffff00");

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
  ctx.fill();
}

function drawPlayer(p,color){
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
  ctx.fill();
}
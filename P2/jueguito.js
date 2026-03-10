let secret=[]
let maxAttempts=7
let used=0

let gamesPlayed=0   // partidas jugadas

let crono

window.onload = function(){

let display = document.getElementById("time")
crono = new Crono(display)

generateSecret()

}

function generateSecret(){

secret=[]

while(secret.length<4){

let n=Math.floor(Math.random()*10)

if(!secret.includes(n)){
secret.push(n)
}

}

console.log("Clave:",secret)

}

function startGame(){

crono.start()

}

function stopGame(){

crono.stop()

document.getElementById("message").textContent =
"⏸ Tiempo detenido. Pulsa Start para continuar o Reset."

}

function play(num){

crono.start()

let button=document.getElementById("b"+num)
button.disabled=true

used++

let left=maxAttempts-used

document.getElementById("used").textContent=used
document.getElementById("left").textContent=left

let hit=false

for(let i=0;i<4;i++){

if(secret[i]==num){

let box=document.getElementById("d"+i)

box.textContent=num
box.classList.add("correct")

hit=true

}

}

if(hit){

document.getElementById("message").textContent =
`✔ Correcto! El número ${num} está en la clave. Intentos restantes: ${left}`

}else{

document.getElementById("message").textContent =
`✖ Fallaste. El número ${num} no está en la clave. Intentos restantes: ${left}`

}

checkGame()

}

function checkGame(){

let discovered=0

for(let i=0;i<4;i++){

if(document.getElementById("d"+i).textContent!="*"){
discovered++
}

}

if(discovered==4){

crono.stop()

document.getElementById("message").textContent =
`🎉 ENHORABUENA! Descubriste la clave. 
Tiempo usado: ${document.getElementById("time").innerText} 
Intentos gastados: ${used} 
Partidas necesarias para ganar: ${gamesPlayed}`

disableButtons()

}

if(used>=maxAttempts && discovered<4){

crono.stop()

for(let i=0;i<4;i++){

let box=document.getElementById("d"+i)

box.textContent=secret[i]

box.classList.remove("correct")
box.classList.add("lose")

}

document.getElementById("message").textContent =
`💥 PERDISTE. Tiempo utilizado: ${document.getElementById("time").innerText}. Inténtalo en la próxima.`

disableButtons()

}

}

function disableButtons(){

for(let i=0;i<=9;i++){
document.getElementById("b"+i).disabled=true
}

}

function resetGame(){

crono.stop()
crono.reset()

used=0
gamesPlayed++   // aumenta el número de partidas

document.getElementById("used").textContent=0
document.getElementById("left").textContent=7

document.getElementById("message").textContent =
"Nueva partida preparada. Pulsa Start o un número para comenzar."

for(let i=0;i<4;i++){

let box=document.getElementById("d"+i)

box.textContent="*"
box.classList.remove("correct")
box.classList.remove("lose")

}

for(let i=0;i<=9;i++){
document.getElementById("b"+i).disabled=false
}

generateSecret()

}
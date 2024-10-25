const socket = io("http://localhost:5050", { path: "/real-time" });

let userName = "";
let myRole = "";

// ------------- SCREENS ----------------
const homeScreen = document.getElementById("home-welcome-screen");
const lobbyScreen = document.getElementById("lobby-screen");
const gameGround = document.getElementById("game-ground");
const gameOverScreen = document.getElementById("game-over");
const scoreList = document.getElementById("score-list"); // Para mostrar los puntajes

homeScreen.style.display = "flex";
lobbyScreen.style.display = "none";
gameGround.style.display = "none";
gameOverScreen.style.display = "none";

// ------------- GENERAL ELEMENTS --------------------
const userNameDisplay = document.getElementById("nickname-display");
const gameUserNameDisplay = document.getElementById("game-nickname-display");

// ------------- WELCOME -SCREEN -------------
const nicknameInput = document.getElementById("nickname");
const joinButton = document.getElementById("join-button");

joinButton.addEventListener("click", joinGame);

async function joinGame() {
  userName = nicknameInput.value;
  socket.emit("joinGame", { nickname: userName, score: 0 }); // Enviar evento de unirse al juego

  homeScreen.style.display = "none";
  userNameDisplay.innerHTML = userName;
  lobbyScreen.style.display = "flex";
}

// ------------- LOBBY -SCREEN ---------------
const startButton = document.getElementById("start-button");
const usersCount = document.getElementById("users-count");

startButton.addEventListener("click", startGame);

async function startGame() {
  socket.emit("startGame"); // Iniciar el juego
}

// ------------- GAMESCREEN ----------------
let polos = [];

const roleDisplay = document.getElementById("role-display");
const shoutbtn = document.getElementById("shout-button");
const shoutDisplay = document.getElementById("shout-display");
const container = document.getElementById("pool-players");

shoutbtn.style.display = "none";

shoutbtn.addEventListener("click", shoutBtn);

roleDisplay.style.display = "none";
shoutDisplay.style.display = "none";

async function shoutBtn() {
  if (myRole === "marco") {
    socket.emit("notifyMarco"); // Notificar como "Marco"
  }
  if (myRole === "polo" || myRole === "polo-especial") {
    socket.emit("notifyPolo"); // Notificar como "Polo"
  }
  shoutbtn.style.display = "none";
}

container.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    const key = event.target.dataset.key;
    socket.emit("onSelectPolo", key); // Emitir selección de Polo
  }
});

// ------------- GAME OVER ------------------
const gameOverText = document.getElementById("game-result");
const restartButton = document.getElementById("restart-button");

restartButton.addEventListener("click", restartGame);

async function restartGame() {
  socket.emit("startGame");
}

// ------------- SOCKET LISTENERS ----------------
socket.on("userJoined", (data) => {
  usersCount.innerHTML = data?.players.length || 0;
  console.log("Jugadores:", data);
});

socket.on("startGame", (data) => {
  polos = [];
  container.innerHTML = ""; // Limpiar datos previos
  gameOverScreen.style.display = "none";
  shoutDisplay.style.display = "none";
  lobbyScreen.style.display = "none";
  gameGround.style.display = "flex";
  myRole = data;

  roleDisplay.innerHTML = `Rol: ${data}`;
  roleDisplay.style.display = "block";
  gameUserNameDisplay.innerHTML = userName;

  shoutbtn.innerHTML = `Gritar ${myRole}`;

  if (myRole === "marco") {
    shoutbtn.style.display = "block";
  }
});

socket.on("notification", (data) => {
  console.log("Notification", data);
  if (myRole === "marco") {
    container.innerHTML = "<p>Haz click sobre el polo que quieres escoger:</p>";
    polos.push(data);
    polos.forEach((elemt) => {
      const button = document.createElement("button");
      button.innerHTML = `Un jugador gritó: ${elemt.message}`;
      button.setAttribute("data-key", elemt.userId);
      container.appendChild(button);
    });
  } else {
    shoutbtn.style.display = "block";
    shoutDisplay.innerHTML = `Marco ha gritado: ${data.message}`;
    shoutDisplay.style.display = "block";
  }
});

socket.on("notifyGameOver", (data) => {
  gameGround.style.display = "none";
  gameOverText.innerHTML = data.message;
  gameOverScreen.style.display = "flex";
});

// Mostrar los puntajes actualizados
socket.on("updateScore", (data) => {
  scoreList.innerHTML = ""; // Limpiar lista previa

  data.players.forEach((player, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${player.name} (${
      player.score || 0
    } pts)`;
    scoreList.appendChild(listItem);
  });
  console.log("Puntajes actualizados:", data.players);
});

socket.on("advertisementWinner", (data) => {
  alert(`¡El ganador es ${data.winner}!`);
  data.players.forEach((player) => {
    console.log(`${player.name}: ${player.score} pts`);
  });
});

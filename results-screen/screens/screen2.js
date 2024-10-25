import { router, socket } from "../routes.js";

export default function renderScreen2() {
  const app = document.getElementById("app");
  app.innerHTML = `
	  <section class="winner-section">
		<h1>🎉 Congratulations! We Have a Winner! 🎉</h1>
		<p id="winnerMessage" class="winner-message">Awaiting announcement...</p>
	  </section>
	
	  <section id="container" class="ranking-section">
		<h2>🏆 Final Ranking</h2>
		<ul id="finalPlayers" class="player-list"></ul>
	
		<div class="actions">
		  <button id="sortAlphabeticallyBtn" class="sort-btn">Sort Alphabetically 🔤</button>
		</div>
	  </section>
	`;

  // Solicita al servidor la información del ganador y los jugadores actuales.
  socket.emit("requestWinnerData");

  // Escucha el evento 'winnerAnnouncement' para recibir los datos del ganador y el listado de jugadores.
  socket.on("winnerAnnouncement", (data) => {
    const { winner, players } = data;

    // Muestra el nombre del ganador en la interfaz.
    document.getElementById(
      "winnerAnnouncementMessage"
    ).textContent = `The winner is ${winner}!`;

    // Ordena los jugadores por puntaje y los renderiza en pantalla.
    renderPlayerRankings(players);
  });

  // Función que genera la lista de jugadores con sus posiciones.
  function renderPlayerRankings(players) {
    // Ordena los jugadores en función de su puntaje, de mayor a menor.
    players.sort((a, b) => b.score - a.score);

    // Construye el HTML con los jugadores y sus puntajes.
    let rankingsHTML = "";
    players.forEach((player, index) => {
      rankingsHTML += `<li>${index + 1}. ${player.name} (${
        player.score
      } pts)</li>`;
    });

    // Muestra la lista de jugadores en el elemento correspondiente del HTML.
    document.getElementById("playerRankingsList").innerHTML = rankingsHTML;
  }

  // Asigna un evento al botón para ordenar la lista de jugadores alfabéticamente.
  document
    .getElementById("alphabeticalSortButton")
    .addEventListener("click", () => {
      // Obtiene la lista actual de jugadores de la interfaz.
      const playerRankingsElement =
        document.getElementById("playerRankingsList");
      const playerItems = Array.from(
        playerRankingsElement.getElementsByTagName("li")
      );

      // Ordena los jugadores alfabéticamente por nombre.
      playerItems.sort((a, b) => {
        const nameA = a.textContent.split(".")[1].trim(); // Extrae el nombre del primer jugador.
        const nameB = b.textContent.split(".")[1].trim(); // Extrae el nombre del segundo jugador.
        return nameA.localeCompare(nameB); // Compara los nombres alfabéticamente.
      });

      // Vacía la lista anterior y agrega los jugadores en el nuevo orden.
      playerRankingsElement.innerHTML = "";
      playerItems.forEach((item) => playerRankingsElement.appendChild(item));
    });
}

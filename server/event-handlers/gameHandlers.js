// gameHandlers.js

const { assignRoles } = require("../utils/helpers");

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
  return (user) => {
    
    db.players.push({ id: socket.id, ...user });
    console.log(db.players);
    io.emit("userJoined", db); // Broadcasts the message to all connected clients including the sender
  };
};

const startGameHandler = (socket, db, io) => {
  return () => {
    db.players = assignRoles(db.players);

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role);
    });
  };
};

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    );

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      });
    });
  };
};

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco");

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      });
    });
  };
};

//Cambios de código por puntaje.
// Definimos una función 'onSelectPoloHandler' que toma los parámetros 'socket', 'db' y 'io'.
// Esta función devuelve otra función que maneja la lógica de seleccionar un polo (jugador).
const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    // Busca al jugador que tiene el mismo ID que el socket actual (Marco).
    const marcoPlayer = db.players.find((user) => user.id === socket.id);

    // Busca al jugador seleccionado usando el 'userID' recibido (polo seleccionado).
    const poloSelected = db.players.find((user) => user.id === userID);

    // Busca al jugador que tiene el rol 'polo-especial', si existe.
    const poloEspecial = db.players.find(
      (user) => user.role === "polo-especial"
    );

    // Verificamos si el polo seleccionado tiene el rol de 'polo-especial'.
    if (poloSelected.role === "polo-especial") {
      // Si Marco atrapa al polo especial, suma 50 puntos.
      marcoPlayer.score += 50;
      // El polo especial pierde 10 puntos.
      poloSelected.score -= 10;

      // Notificamos a todos los jugadores que el juego ha terminado, usando 'io' para emitir el evento.
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${marcoPlayer.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      // Si Marco no atrapa al polo especial, pierde 10 puntos.
      marcoPlayer.score -= 10;

      // Si existe un polo especial, gana 10 puntos por no haber sido atrapado.
      if (poloEspecial) {
        poloEspecial.score += 10;
      }

      // Notificamos a todos los jugadores que el juego ha terminado y que Marco ha perdido.
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${marcoPlayer.nickname} ha perdido`,
        });
      });
    }

    // Verificamos si algún jugador ha alcanzado 100 puntos o más.
    const winner = db.players.find((player) => player.score >= 100);

    // Si hay un ganador, lo anunciamos a todos los jugadores.
    if (winner) {
      lastWinner = winner; // Guardamos al ganador como el último ganador.
      console.log("Winner:", winner); // Imprimimos al ganador en la consola del servidor.

      // Emitimos un evento para anunciar al ganador y actualizar los puntajes.
      io.emit("emitWinner", {
        winner: winner.nickname,
        players: db.players.map((player) => ({
          name: player.nickname,
          score: player.score,
        })),
      });
    }
  };
};

//Nuevo código
// Declaramos una variable 'winner' que inicialmente no tiene valor (null).
let winner = null;

// Definimos una función 'getWinnerHandler' que toma como parámetros un socket y una base de datos (db).
// Esta función devuelve otra función (closure) que se encargará de anunciar al ganador.
const getWinnerHandler = (socket, db) => {
  return () => {
    // Verificamos si ya existe un ganador (es decir, si 'winner' no es null).
    if (winner) {
      // Si hay un ganador, emitimos un evento llamado 'announceWinner' a través del socket.
      socket.emit("emitWinner", {
        // Enviamos el nickname del ganador en el objeto emitido.
        winner: winner.nickname,

        // También enviamos una lista de jugadores con sus nombres y puntajes.
        players: db.players.map((player) => ({
          // Obtenemos el nombre del jugador.
          name: player.nickname,
          // Obtenemos el puntaje del jugador.
          score: player.score,
        })),
      });
    }
  };
};

module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
  getWinnerHandler,
};

const WebSocket = require("ws");

const socket = new WebSocket("ws://localhost:3000");

const notas = [
  "Do4",
  "Re4",
  "Mi4",
  "Fa4",
  "Sol4",
  "La4",
  "Si4",
  "Do5"
];

let i = 0;

socket.on("open", () => {

  console.log("Simulador conectado al servidor");

  socket.send(JSON.stringify({
    type: "register",
    role: "simulator"
  }));

  // enviar notas cada 2 segundos
  setInterval(() => {

    const nota = notas[i];

    console.log("Enviando nota:", nota);

    socket.send(JSON.stringify({
      type: "note",
      value: nota
    }));

    i = (i + 1) % notas.length;

  }, 2000);

});

socket.on("message", (data) => {

  const msg = JSON.parse(data.toString());

  console.log("Mensaje recibido:", msg);

});
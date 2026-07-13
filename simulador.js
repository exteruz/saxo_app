const WebSocket = require("ws");
const socket = new WebSocket("ws://localhost:3000");

// Mapeo: Teclas de la PC -> Notas musicales que bajan por la pista
const mapeoTeclado = {
  'a': 'Do4',
  's': 'Re4',
  'd': 'Mi4',
  'f': 'Fa4',
  'g': 'Sol4',
  'h': 'La4',
  'j': 'Si4',
  'k': 'Do5'
};

socket.on("open", () => {
  console.log("🎮 ¡Simulador por Teclado Conectado de forma Autónoma!");

  socket.send(JSON.stringify({
    type: "register",
    role: "simulator"
  }));

  console.log("\n=======================================================");
  console.log("⌨️  MAPA DE CONTROLES (Terminal enfocada):");
  console.log("   [ A ] -> Do4   |   [ S ] -> Re4   |   [ D ] -> Mi4");
  console.log("   [ F ] -> Fa4   |   [ G ] -> Sol4  |   [ H ] -> La4");
  console.log("   [ J ] -> Si4   |   [ K ] -> Do5");
  console.log("=======================================================");
  console.log("👉 Deja esta ventana activa y presiona al ritmo visual.\n");
});

// Capturar los inputs del teclado nativo en consola de Node
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (key) => {
  if (key === "\u0003") { // Salir con Ctrl + C
    process.exit();
  }

  const notaAsociada = mapeoTeclado[key.toLowerCase()];
  if (notaAsociada) {
    console.log(`📡 Tecla presionada: [${key.toUpperCase()}] -> Enviando nota: ${notaAsociada}`);
    socket.send(JSON.stringify({
      type: "note",
      value: notaAsociada
    }));
  }
});
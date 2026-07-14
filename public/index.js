export const socket = new WebSocket("ws://localhost:3000");
socket.onopen = () => {
  console.log("WS abierto");

  socket.send(JSON.stringify({
    type: "register",
    role: "web"
  }));
};

socket.onerror = (e) => {
  console.log(" WS error:", e);
};

socket.onclose = () => {
  console.log("WS cerrado");
};

socket.addEventListener("message", (event) => {

    const msg = JSON.parse(event.data);

    // Cuando llega una nota desde el simulador o servidor externo
    if (msg.type === "note") {
        // 1. Mostrar textualmente la nota enviada en el recuadro de la pantalla
        const contenedorNota = document.getElementById("nota-usuario-actual");
        if (contenedorNota) {
            contenedorNota.innerText = msg.value; 
        }

        // 2. Iluminar visualmente el saxofón estático
        seleccionarNota(msg.value);
        const pressure = document.getElementById("pressure-value");

        if (pressure && msg.pressure !== undefined) {
    pressure.textContent = Number(msg.pressure).toFixed(3);
}

        // ============================================================
        // COLOCA ESTO AQUÍ: Envía la nota al motor para sumar puntos
        // ============================================================
        if (typeof window.validarNotaUsuario === 'function') {
            window.validarNotaUsuario(msg.value);
        }
    }

    if (msg.type === "result") {
        console.log("Resultado recibido:", msg.value);
    }

});


window.enviarResultado = function(valor) {
  socket.send(JSON.stringify({
    type: "result",
    value: valor
  }));
};


const digitaciones = {
  "Do4":  ["W", "R", "T", "U", "I", "O", "M"],
  "Re4":  ["W", "R", "T", "U", "I", "O"],
  "Mib4":  ["W", "R", "T", "U", "I", "O", "N"],
  "Mi4":  ["W", "R", "T", "U", "I"],
  "Fa4": ["W", "R", "T", "U"],
  "Fa#4":  ["W", "R", "T", "I"],
  "Sol4":  ["W", "R", "T"],
  "Sol#4": ["W", "R", "T","G"],
  "La4": ["W", "R"],
  "Sib4": ["W","R","V"],
  "Si4":["W"],
  "Do5": ["R"],  
  "Re5":  ["Z","W", "R", "T", "U", "I", "O"],
  "Mib5":  ["Z","W", "R", "T", "U", "I", "O", "N"],
  "Mi5":  ["Z","W", "R", "T", "U", "I"],
  "Fa5": ["Z","W", "R", "T", "U"],
  "Fa#5":  ["Z","W", "R", "T", "I"],
  "Sol5":  ["Z","W", "R", "T"],
  "Sol#5": ["Z","W", "R", "T","G"],
  "La5": ["Z","W", "R"],
  "Sib5": ["Z","W","R","V"],
  "Si5":["Z","W"],
  "Do6": ["Z","R"]
};

function mostrarDigitacion(nota) {
  document.querySelectorAll(".key, .keyLateral").forEach(k => {
    k.classList.remove("activa");
  });

  const teclas = digitaciones[nota];
  teclas.forEach(id => {
    document.getElementById(id).classList.add("activa");
  });
}

document.querySelectorAll(".btn-nota").forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarDigitacion(btn.dataset.nota);
  });
});

function seleccionarNota(nota) {

    mostrarDigitacion(nota);

    document.querySelectorAll(".btn-nota").forEach(btn => {
        btn.classList.remove("btn-light");
        btn.classList.add("btn-outline-light");
    });

    const boton = document.querySelector(`.btn-nota[data-nota="${nota}"]`);

    if (boton) {
        boton.classList.remove("btn-outline-light");
        boton.classList.add("btn-light");
    }

}

// Exponer la función globalmente para que player.js pueda usarla
window.mostrarDigitacion = mostrarDigitacion;
// Al final de tu index.js del navegador, agrega esto para que el motor del juego pueda usarla:
window.seleccionarNota = seleccionarNota;
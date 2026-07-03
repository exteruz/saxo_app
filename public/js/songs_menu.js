import { socket } from "../index.js";

let songs = [];
let selectedSong = null;

socket.addEventListener("open", () => {

    console.log("Solicitando canciones...");

    socket.send(JSON.stringify({
        type: "getSongs"
    }));

});

socket.addEventListener("message", (event) => {

    const msg = JSON.parse(event.data);

    if (msg.type !== "songs") return;

    songs = msg.songs;

    mostrarListaCanciones();

});

function mostrarListaCanciones() {

    const panel = document.getElementById("songs-list");

    panel.innerHTML = "";

    songs.forEach(song => {

        const boton = document.createElement("button");

        boton.className =
            "list-group-item list-group-item-action bg-dark text-white border-secondary";

        boton.innerHTML = `
            <div class="fw-bold">${song.name}</div>
            <small>${song.composer}</small>
        `;

        boton.addEventListener("click", () => {

            selectedSong = song;
            mostrarCancion(song);

        });

        panel.appendChild(boton);

    });

}

function mostrarCancion(song) {

    const panel = document.getElementById("songs-list");

    panel.innerHTML = `

        <div class="card bg-dark text-white border-secondary shadow">

            <div class="card-header text-center py-2">
                <strong>${song.name}</strong>
            </div>

            <div class="card-body p-3">

                <p class="mb-2 small">
                    <strong>Compositor</strong><br>
                    ${song.composer}
                </p>

                <p class="mb-2 small">
                    <strong>BPM:</strong> ${song.bpm}
                </p>

                <p class="mb-2 small">
                    <strong>Dificultad:</strong> ${song.difficulty}
                </p>

                <p class="mb-3 small">
                    <strong>Notas:</strong> ${song.notes.length}
                </p>

                <div class="d-flex gap-2">

                    <button
                        id="btn-back"
                        class="btn btn-outline-light btn-sm flex-fill">

                        ← Regresar

                    </button>

                    <button
                        id="btn-play"
                        class="btn btn-success btn-sm flex-fill">

                        ▶ Tocar

                    </button>

                </div>

            </div>

        </div>

    `;

    document.getElementById("btn-back").addEventListener("click", () => {

        mostrarListaCanciones();

    });

    document.getElementById("btn-play").addEventListener("click", () => {

        console.log("Reproducir:", selectedSong);

    });

}
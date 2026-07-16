const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

require("./db/database");
const songs = require("./db/songs");

const app = express();
const PORT = 3000;

const clients = {
    web: null,
    simulator: null
};

app.use(express.static(path.join(__dirname, "..", "public")));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    console.log("Cliente conectado");

    ws.role = null;

    ws.on("message", (message) => {

        let data;

        try {
            data = JSON.parse(message.toString());
        } catch (e) {
            data = message.toString();
        }



        if (data.type === "selectSong") {

    songs.getSongById(data.id, (err, song) => {

        if (err) {
            console.error(err);
            return;
        }

        ws.send(JSON.stringify({

            type: "songData",
            song: song

        }));

    });

    return;
}

        // ==========================
        // Registro de clientes
        // ==========================





        if (typeof data === "object" && data.type === "register") {

            ws.role = data.role;
            clients[data.role] = ws;

            console.log("Registrado:", ws.role);

            return;
        }

        // ==========================
        // Obtener canciones
        // ==========================

        if (typeof data === "object" && data.type === "getSongs") {

            songs.getSongs((err, result) => {

                if (err) {
                    console.error(err);
                    return;
                }

                ws.send(JSON.stringify({
                    type: "songs",
                    songs: result
                }));

            });

            return;
        }



        console.log("Recibido:", data);

        const payload = typeof data === "string"
            ? data
            : JSON.stringify(data);

        if (ws.role === "web") {

            if (clients.simulator &&
                clients.simulator.readyState === WebSocket.OPEN) {

                clients.simulator.send(payload);

            }

        }

        if (ws.role === "simulator") {
            if (typeof data === "object" && data.type === "note") {

            if (data.value === "Do#4") {
            data.digitacion = "NONE";
            }

            if (data.value === "Do#5") {
            data.digitacion = "Z";
            }

        }
        

            if (clients.web &&
                clients.web.readyState === WebSocket.OPEN) {

                clients.web.send(payload);

            }

        }

    });

    ws.on("close", () => {

        console.log("Cliente desconectado");

        if (ws.role) {
            clients[ws.role] = null;
        }

    });

});

server.listen(PORT, () => {

    console.log(`Servidor iniciado en http://localhost:${PORT}`);

});
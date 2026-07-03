const sqlite3 = require("sqlite3").verbose();

// Crea (o abre) la base de datos
const db = new sqlite3.Database("./game.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada.");
    }
});

// Crear tabla songs
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            composer TEXT,
            bpm INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            notes TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

});

module.exports = db;

db.run(
    `
    INSERT INTO songs(name, composer, bpm, difficulty, notes)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
        "Escala Do Mayor",
        "Daniel",
        120,
        "Easy",
        JSON.stringify([
            {
                note: "Do4",
                start: 0,
                duration: 500,
                expectedIntensity: "medium"
            },
            {
                note: "Re4",
                start: 500,
                duration: 500,
                expectedIntensity: "medium"
            },
            {
                note: "Mi4",
                start: 1000,
                duration: 500,
                expectedIntensity: "high"
            }
        ])
    ],
    function(err) {

        if (err) {
            console.error(err.message);
            return;
        }

        console.log("Canción creada con ID:", this.lastID);

    }
);

db.get(
    "SELECT * FROM songs WHERE id = ?",
    [1],
    (err, row) => {

        if (err) {
            console.error(err.message);
            return;
        }

        if (!row) {
            console.log("No se encontró la canción.");
            return;
        }

        row.notes = JSON.parse(row.notes);

        console.log(row);

    }
);
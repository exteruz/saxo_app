const sqlite3 = require("sqlite3").verbose();

// Crea (o abre) la base de datos
const db = new sqlite3.Database("./game.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada.");
    }
});

// Crear tabla songs de forma segura
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE, 
            composer TEXT,
            bpm INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            notes TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ============================================================
    // 1. CANCIÓN SÚPER LENTA (Para practicar sin prisas)
    // ============================================================
    db.get("SELECT id FROM songs WHERE name = 'Práctica Súper Lenta' LIMIT 1", (err, row) => {
        if (err) return console.error(err.message);

        if (!row) {
            const notasSuperLentas = [
                { note: "Do4", start: 4000, duration: 800 },  // Tarda 4 segundos en iniciar
                { note: "Re4", start: 7000, duration: 800 },  // Espera 3 segundos más
                { note: "Mi4", start: 10000, duration: 1200 } // Espera otros 3 segundos y es una nota larga
            ];

            db.run(
                `INSERT INTO songs(name, composer, bpm, difficulty, notes) VALUES (?, ?, ?, ?, ?)`,
                ["Práctica Súper Lenta", "Daniel", 60, "Easy", JSON.stringify(notasSuperLentas)],
                function(err) {
                    if (err) console.error(err.message);
                    else console.log(" ¡Pista de entrenamiento 'Práctica Súper Lenta' añadida con éxito!");
                }
            );
        }
    });

    // ============================================================
    // 2. INSERCIÓN DE LA MELODÍA AVANZADA
    // ============================================================
    db.get("SELECT id FROM songs WHERE name = 'Melodía Avanzada Saxo' LIMIT 1", (err, row) => {
        if (err) return console.error(err.message);

        if (!row) {
            const notasAvanzadas = [
                { note: "Do4",   start: 0,    duration: 500 },
                { note: "Re4",   start: 700,  duration: 500 },
                { note: "Mi4",   start: 1400, duration: 500 },
                { note: "Fa4",   start: 2100, duration: 500 },
                { note: "Sol4",  start: 2800, duration: 500 },
                { note: "La4",   start: 3500, duration: 500 },
                { note: "Si4",   start: 4200, duration: 500 },
                { note: "Do5",   start: 4900, duration: 1000 },
                { note: "Si4",   start: 6400, duration: 300 },
                { note: "La4",   start: 6800, duration: 300 },
                { note: "Sol4",  start: 7200, duration: 300 },
                { note: "Fa4",   start: 7600, duration: 300 },
                { note: "Mi4",   start: 8000, duration: 300 },
                { note: "Re4",   start: 8400, duration: 300 },
                { note: "Do4",   start: 8800, duration: 1200 }
            ];

            db.run(
                `INSERT INTO songs(name, composer, bpm, difficulty, notes) VALUES (?, ?, ?, ?, ?)`,
                ["Melodía Avanzada Saxo", "Daniel", 120, "Medium", JSON.stringify(notasAvanzadas)],
                function(err) {
                    if (err) console.error(err.message);
                    else console.log("¡Canción 'Melodía Avanzada Saxo' inyectada!");
                }
            );
        } else {
            console.log(" Las canciones ya están configuradas en SQLite. Saltando inserción.");
        }
    });
});

module.exports = db;
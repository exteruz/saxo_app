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
});

module.exports = db;
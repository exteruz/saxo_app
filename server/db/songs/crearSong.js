const path = require("path");
const { getSongs, createSong } = require("../songs");        // db/songs.js
const { extractNotes } = require("./Wavtonotes");            // db/songs/Wavtonotes.js

// ============================================================
// CONFIGURACIÓN: acá listás qué WAV corresponde a qué canción
// Los .wav viven en esta misma carpeta (db/songs/)
// ============================================================
const CANCIONES_A_CARGAR = [
    {
        wavPath: path.join(__dirname, "cancion.wav"),
        name: "Little Star",
        composer: "Mozart",
        bpm: 60,
        difficulty: "Fácil",
    },

    {
        wavPath: path.join(__dirname, "heyJude.wav"),
        name: "Hey Jude",
        composer: "The Beatles",
        bpm: 90,
        difficulty: "Intermedio",
    },

        {
        wavPath: path.join(__dirname, "escala.wav"),
        name: "Escala de Do Mayor",
        composer: "Nosotros",
        bpm: 90,
        difficulty: "Fácil",
    },


];

// ============================================================
// LÓGICA: verifica existencia y siembra solo lo que falta
// ============================================================
function sembrarCanciones() {
    getSongs((err, existentes) => {
        if (err) {
            console.error("Error al leer canciones existentes:", err.message);
            return;
        }

        const nombresExistentes = new Set(existentes.map((s) => s.name));
        const nuevas = CANCIONES_A_CARGAR.filter((c) => !nombresExistentes.has(c.name));

        if (nuevas.length === 0) {
            console.log("Todas las canciones ya están cargadas. No hay nada nuevo que analizar.");
            return;
        }

        nuevas.forEach((cancion) => {
            let notes;
            try {
                notes = extractNotes(cancion.wavPath);
            } catch (e) {
                console.error(`Error analizando "${cancion.wavPath}":`, e.message);
                return;
            }

            if (!notes.length) {
                console.warn(`No se detectaron notas en "${cancion.wavPath}". Saltando "${cancion.name}".`);
                return;
            }

            createSong(
                {
                    name: cancion.name,
                    composer: cancion.composer,
                    bpm: cancion.bpm,
                    difficulty: cancion.difficulty,
                    notes,
                },
                (err, id) => {
                    if (err) {
                        console.error(`Error insertando "${cancion.name}":`, err.message);
                    } else {
                        console.log(
                            `"${cancion.name}" insertada con id ${id} (${notes.length} notas detectadas del WAV)`
                        );
                    }
                }
            );
        });
    });
}

sembrarCanciones();
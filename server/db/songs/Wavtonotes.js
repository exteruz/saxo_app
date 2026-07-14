const fs = require("fs");

// ============================================================
// CONFIGURACIÓN
// ============================================================
const FRAME_SIZE = 2048;        // muestras por ventana de análisis
const HOP_SIZE = 512;           // salto entre ventanas
const MIN_FREQ = 60;            // Hz
const MAX_FREQ = 2000;          // Hz
const RMS_THRESHOLD = 0.01;     // umbral de energía (silencio vs sonido)
const MIN_NOTE_DURATION_MS = 60; // ignora notas más cortas que esto (ruido)

// ============================================================
// 1. LEER Y PARSEAR EL WAV (PCM 16-bit, sin dependencias)
// ============================================================
function readWavFile(filePath) {
    const buffer = fs.readFileSync(filePath);

    if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
        throw new Error("El archivo no es un WAV válido.");
    }

    let offset = 12;
    let sampleRate = null;
    let numChannels = null;
    let bitsPerSample = null;
    let dataOffset = null;
    let dataLength = null;

    // Recorre los chunks del WAV. Muchos archivos (sobre todo exportados/editados
    // por DAWs) traen chunks extra (LIST, bext, JUNK, fact, etc.) antes o después
    // de "data", y a veces el tamaño declarado no coincide exactamente con el
    // archivo real. Por eso frenamos apenas no queden bytes suficientes para
    // seguir leyendo un header de chunk (8 bytes: id + size).
    while (offset + 8 <= buffer.length) {
        const chunkId = buffer.toString("ascii", offset, offset + 4);
        const chunkSize = buffer.readUInt32LE(offset + 4);

        if (chunkId === "fmt ") {
            numChannels = buffer.readUInt16LE(offset + 10);
            sampleRate = buffer.readUInt32LE(offset + 12);
            bitsPerSample = buffer.readUInt16LE(offset + 22);
        } else if (chunkId === "data") {
            dataOffset = offset + 8;
            // Recortamos al tamaño real disponible en el archivo, por si el
            // header declara más bytes de los que realmente hay.
            dataLength = Math.min(chunkSize, buffer.length - dataOffset);
        }

        // Si el chunkSize declarado es absurdo (más grande que lo que queda
        // en el archivo) dejamos de confiar en el header y cortamos acá.
        if (chunkSize < 0 || offset + 8 + chunkSize > buffer.length + 1) {
            break;
        }

        offset += 8 + chunkSize + (chunkSize % 2); // los chunks se alinean a 2 bytes
    }

    if (dataOffset === null) throw new Error("No se encontró el chunk 'data' en el WAV.");
    if (bitsPerSample !== 16) throw new Error("Este script solo soporta WAV PCM de 16 bits.");

    // numSamples también se recorta contra lo que realmente entra en el buffer,
    // para nunca intentar leer más allá del final del archivo.
    const maxSamplesByBuffer = Math.floor((buffer.length - dataOffset) / (2 * numChannels));
    const numSamples = Math.min(Math.floor(dataLength / 2 / numChannels), maxSamplesByBuffer);
    const samples = new Float32Array(numSamples);

    // Mezcla a mono tomando el canal 0 (o promediando si querés estéreo real, ver nota abajo)
    for (let i = 0; i < numSamples; i++) {
        const sampleOffset = dataOffset + i * numChannels * 2;
        if (sampleOffset + 2 > buffer.length) break; // seguridad extra
        const int16 = buffer.readInt16LE(sampleOffset);
        samples[i] = int16 / 32768; // normaliza a rango [-1, 1]
    }

    return { samples, sampleRate };
}

// ============================================================
// 2. DETECCIÓN DE PITCH (algoritmo YIN)
// ============================================================
function detectPitchYIN(frame, sampleRate) {
    const threshold = 0.15;
    const n = frame.length;
    const diff = new Float32Array(n / 2);

    for (let tau = 0; tau < diff.length; tau++) {
        let sum = 0;
        for (let i = 0; i < diff.length; i++) {
            const delta = frame[i] - frame[i + tau];
            sum += delta * delta;
        }
        diff[tau] = sum;
    }

    const cmnd = new Float32Array(diff.length);
    cmnd[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < diff.length; tau++) {
        runningSum += diff[tau];
        cmnd[tau] = diff[tau] / ((runningSum / tau) || 1);
    }

    let tauEstimate = -1;
    for (let tau = 2; tau < cmnd.length; tau++) {
        if (cmnd[tau] < threshold) {
            while (tau + 1 < cmnd.length && cmnd[tau + 1] < cmnd[tau]) tau++;
            tauEstimate = tau;
            break;
        }
    }

    if (tauEstimate === -1) return null;

    const frequency = sampleRate / tauEstimate;
    if (frequency < MIN_FREQ || frequency > MAX_FREQ) return null;

    return frequency;
}

function computeRMS(frame) {
    let sum = 0;
    for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
    return Math.sqrt(sum / frame.length);
}

// ============================================================
// 3. FRECUENCIA (Hz) -> NOTA VÁLIDA MÁS CERCANA DEL JUEGO
// ============================================================
// Acá va la lista EXACTA de notas que tu interfaz soporta (los botones
// que se ven en pantalla). Si agregás/quitás notas en el juego, actualizá
// esta lista para que coincida.
const VALID_NOTES = [
    "Do4", "Re4", "Mib4", "Mi4", "Fa4", "Fa#4", "Sol4", "Sol#4", "La4", "Sib4", "Si4",
    "Do5", "Re5", "Mib5", "Mi5", "Fa5", "Fa#5", "Sol5", "Sol#5", "La5", "Sib5", "Si5",
    "Do6",
];

// Mapa de nombre de nota (dentro de una octava) -> semitono 0-11.
// Esto es lo que resuelve las enarmonías: no importa si algo "matemáticamente"
// sería La# o Sib, Re# o Mib — acá solo importa a qué semitono corresponde.
const NOTE_TO_SEMITONE = {
    Do: 0, "Do#": 1, Reb: 1,
    Re: 2, "Re#": 3, Mib: 3,
    Mi: 4,
    Fa: 5, "Fa#": 6, Solb: 6,
    Sol: 7, "Sol#": 8, Lab: 8,
    La: 9, "La#": 10, Sib: 10,
    Si: 11, Dob: 11,
};

// Convierte "Sib4" -> número MIDI (Do4 = MIDI 60, La4 = 440Hz = MIDI 69)
function noteNameToMidi(noteStr) {
    const match = noteStr.match(/^([A-Za-z#]+)(-?\d+)$/);
    if (!match) return null;
    const [, name, octaveStr] = match;
    const semitone = NOTE_TO_SEMITONE[name];
    if (semitone === undefined) return null;
    const octave = parseInt(octaveStr, 10);
    return (octave + 1) * 12 + semitone;
}

// Precalcula el MIDI de cada nota válida una sola vez
const VALID_NOTES_MIDI = VALID_NOTES.map((name) => ({
    name,
    midi: noteNameToMidi(name),
}));

/**
 * Dada una frecuencia detectada, devuelve la nota MÁS CERCANA dentro de las
 * notas que tu juego realmente soporta (VALID_NOTES). Esto resuelve dos
 * problemas a la vez:
 *   1) Enarmonías: si la frecuencia matemáticamente es "La#4" pero tu juego
 *      solo tiene "Sib4" (que es la misma tecla/nota), como ambos comparten
 *      el mismo valor MIDI, "Sib4" queda como la opción más cercana (distancia 0).
 *   2) Fallback de octava: si la frecuencia es un "Do2" pero tu juego no tiene
 *      notas en la octava 2, la nota válida más cercana en MIDI va a ser
 *      "Do4" (24 semitonos) en vez de, por ejemplo, "Do5" (36 semitonos) o
 *      cualquier otra nota de distinto nombre.
 */
function frequencyToNearestValidNote(frequency) {
    const exactMidi = 69 + 12 * Math.log2(frequency / 440); // A4 = 440Hz = MIDI 69

    let best = null;
    let bestDiff = Infinity;

    for (const candidate of VALID_NOTES_MIDI) {
        const diff = Math.abs(candidate.midi - exactMidi);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = candidate.name;
        }
    }

    return best;
}

// ============================================================
// 4. ANALIZAR EL AUDIO COMPLETO Y ARMAR LA LISTA DE NOTAS
// ============================================================
function extractNotes(filePath) {
    const { samples, sampleRate } = readWavFile(filePath);
    const hopDurationMs = (HOP_SIZE / sampleRate) * 1000;

    const notes = [];
    let current = null;

    for (let start = 0; start + FRAME_SIZE <= samples.length; start += HOP_SIZE) {
        const frame = samples.subarray(start, start + FRAME_SIZE);
        const rms = computeRMS(frame);
        const timeMs = (start / sampleRate) * 1000;

        let noteName = null;
        if (rms > RMS_THRESHOLD) {
            const freq = detectPitchYIN(frame, sampleRate);
            if (freq) noteName = frequencyToNearestValidNote(freq);
        }

        if (noteName) {
            if (current && current.note === noteName) {
                current.end = timeMs + hopDurationMs; // extiende la nota actual
            } else {
                if (current) notes.push(finalizeNote(current));
                current = { note: noteName, start: timeMs, end: timeMs + hopDurationMs };
            }
        } else if (current) {
            notes.push(finalizeNote(current));
            current = null;
        }
    }
    if (current) notes.push(finalizeNote(current));

    return notes.filter((n) => n.duration >= MIN_NOTE_DURATION_MS);
}

function finalizeNote(current) {
    return {
        note: current.note,
        start: Math.round(current.start),
        duration: Math.round(current.end - current.start),
    };
}

// ============================================================
// 5. USO POR LÍNEA DE COMANDOS
//    node wavToNotes.js ./mi_cancion.wav
// ============================================================
if (require.main === module) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Uso: node wavToNotes.js <archivo.wav>");
        process.exit(1);
    }

    const notes = extractNotes(filePath);

    // Imprime en el mismo formato que usás para insertar en la base de datos
    console.log("const notas = " + JSON.stringify(notes, null, 4).replace(/"([a-zA-Z]+)":/g, "$1:") + ";");
}

module.exports = { extractNotes };
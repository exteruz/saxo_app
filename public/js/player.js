// js/player.js - Motor con Sistema de Puntuación

let activeNotes = [];
let gameStarted = false;
let startTime = 0;

// Variables de puntuación
let score = 0;
let streak = 0;
let hits = 0;
let misses = 0;
let multiplier = 1;

const HIT_LINE_Y = 75;        
const PIXELS_PER_SECOND = 150; 
const TOLERANCE_PIXELS = 30; // Margen de error arriba/abajo de la línea para validar el acierto

export function iniciarJuego(song) {
    console.log("Iniciando canción:", song.name);
    
    // Reiniciar marcadores
    score = 0; streak = 0; hits = 0; misses = 0; multiplier = 1;
    actualizarMarcadores();

    const track = document.getElementById("player-track");
    document.querySelectorAll(".nota-bloque").forEach(n => n.remove());

    activeNotes = song.notes.map(notaData => {
        const element = document.createElement("div");
        element.className = "nota-bloque";
        element.innerText = notaData.note; 
        
        const tiempoSegundos = notaData.start / 1000;
        const duracionSegundos = notaData.duration / 1000;
        const height = duracionSegundos * PIXELS_PER_SECOND;
        element.style.height = `${height}px`;
        
        track.appendChild(element);

        return {
            note: notaData.note,
            time: tiempoSegundos,      
            duration: duracionSegundos, 
            element: element,
            height: height,
            passed: false,
            hit: false // Nueva bandera para saber si ya fue respondida
        };
    });

    gameStarted = true;
    startTime = performance.now();
    
    requestAnimationFrame(updateGame);
}



function updateGame(currentTime) {
    if (!gameStarted) return;

    const elapsedTime = (currentTime - startTime) / 1000;
    let notasProcesadas = 0; 

    activeNotes.forEach(note => {
        const targetY = (note.time - elapsedTime) * PIXELS_PER_SECOND + HIT_LINE_Y;
        note.element.style.bottom = `${targetY}px`;

        // ============================================================
        // NUEVO: GUÍA DE DIGITACIÓN AUTOMÁTICA EN EL SAXOFÓN
        // Si la nota está cerca de la línea (ej. a menos de 200px) y no ha pasado,
        // iluminamos el saxofón con la combinación correcta para enseñarle al usuario.
        // ============================================================
        if (targetY > (HIT_LINE_Y - TOLERANCE_PIXELS) && targetY < (HIT_LINE_Y + 200) && !note.hit && !note.passed) {
            // Buscamos la función global del index.js que enciende el saxofón
            if (typeof window.seleccionarNota === 'function') {
                window.seleccionarNota(note.note);
            }
        }

        // Si la nota pasó de largo la zona de tolerancia y el usuario NO la tocó -> MISS
        if (targetY + note.height < (HIT_LINE_Y - TOLERANCE_PIXELS) && !note.passed && !note.hit) {
            note.passed = true;
            note.element.classList.add("pass");
            
            streak = 0;
            multiplier = 1;
            misses++;
            actualizarMarcadores();
        }

        if (note.hit || note.passed) {
            notasProcesadas++;
        }
    });

    // DETECTOR DE FINAL DE CANCIÓN
    if (notasProcesadas === activeNotes.length && activeNotes.length > 0) {
        gameStarted = false; // Detiene el ciclo de animación
        finalizarPartida();
        return; 
    }

    requestAnimationFrame(updateGame);
}


window.validarNotaUsuario = function(notaPresionada) {
    if (!gameStarted) return;

    // Obtener la posición física real de la línea azul en la pantalla
    const hitLineElement = document.getElementById("hit-line");
    if (!hitLineElement) return;
    const rectLinea = hitLineElement.getBoundingClientRect();

    // Buscar si hay alguna nota en la pista intersectando la línea azul
    const notaCercana = activeNotes.find(note => {
        if (note.hit || note.passed) return false;
        
        const rectNota = note.element.getBoundingClientRect();

        // Verificar si los rectángulos se están tocando físicamente en el eje Y
        const seTocan = (rectNota.bottom >= rectLinea.top && rectNota.top <= rectLinea.bottom);
        
        return seTocan && note.note === notaPresionada;
    });

    if (notaCercana) {
        // ¡HIT! Acertó la nota con éxito
        notaCercana.hit = true;
        
        // ============================================================
        // NUEVO: EFECTOS VISUALES DE IMPACTO
        // ============================================================
        
        // 1. Agregar la animación de explosión a la nota
        notaCercana.element.classList.add("hit-explosion");
        
        // Remover el elemento del DOM de forma segura una vez termine la animación (250ms)
        setTimeout(() => {
            notaCercana.element.remove();
        }, 250);

        // 2. Hacer que la línea azul destelle en verde neón
        hitLineElement.classList.remove("hit-line-flash"); // Reiniciar si ya estaba
        void hitLineElement.offsetWidth; // Truco de JS para forzar al navegador a reiniciar la animación CSS
        hitLineElement.classList.add("hit-line-flash");

        // Quitar la clase de destello al terminar para que pueda volver a brillar en la siguiente nota
        setTimeout(() => {
            hitLineElement.classList.remove("hit-line-flash");
        }, 150);

        // ============================================================

        hits++;
        streak++;
        
        if (streak > 0 && streak % 5 === 0 && multiplier < 4) {
            multiplier++;
        }
        
        score += 100 * multiplier;
        console.log(`🎯 ¡HIT exitoso para la nota: ${notaPresionada}!`);
    } else {
        // Nota incorrecta o fuera de tiempo, rompe la racha
        streak = 0;
        multiplier = 1;
    }

    actualizarMarcadores();
};




function actualizarMarcadores() {
    if(document.getElementById("game-score")) {
        document.getElementById("game-score").innerText = score;
        document.getElementById("game-streak").innerText = streak;
        document.getElementById("game-multiplier").innerText = multiplier;
        document.getElementById("game-hits").innerText = hits;
        document.getElementById("game-miss").innerText = misses;
    }
}


function finalizarPartida() {
    console.log("--- CANCIÓN FINALIZADA ---");
    
    // 1. Calcular el porcentaje de precisión real
    const totalNotas = hits + misses;
    const precision = totalNotas > 0 ? ((hits / totalNotas) * 100).toFixed(1) : "0.0";

    // 2. Determinar si aprobó o no (Umbral del 70% de precisión)
    const aprobo = parseFloat(precision) >= 70.0;
    const badgeEstado = document.getElementById("game-status-badge");
    
    if (aprobo) {
        badgeEstado.innerText = "🏆 ¡CANCIÓN APROBADA!";
        badgeEstado.className = "fs-3 fw-bold mb-4 p-2 rounded text-success bg-success bg-opacity-25 border border-success";
    } else {
        badgeEstado.innerText = "❌ CANCIÓN REPROBADA";
        badgeEstado.className = "fs-3 fw-bold mb-4 p-2 rounded text-danger bg-danger bg-opacity-25 border border-danger";
    }

    // 3. Inyectar los números calculados dentro de los contenedores del Modal
    document.getElementById("modal-score").innerText = score;
    document.getElementById("modal-precision").innerText = `${precision}%`;
    document.getElementById("modal-hits").innerText = hits;
    document.getElementById("modal-misses").innerText = misses;

    // 4. Disparar e invocar visualmente el Modal de Bootstrap en la pantalla
    const miModalHTML = document.getElementById('modalResultados');
    if (miModalHTML) {
        const modalBootstrap = new bootstrap.Modal(miModalHTML);
        modalBootstrap.show();
    }

    // 5. Opcional: Reportar datos al servidor
    if (typeof window.enviarResultado === 'function') {
        window.enviarResultado({
            puntos: score,
            precision: precision,
            hits: hits,
            misses: misses,
            aprobado: aprobo
        });
    }
}
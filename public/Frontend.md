## Arquitectura del Frontend

La interfaz de usuario está construida utilizando tecnologías web estándar (**HTML5, CSS3 y JavaScript**), funcionando como una aplicación de cliente ligero que interactúa en tiempo real con el servidor a través de WebSockets.

---

### Componentes Tecnológicos

* **HTML (Estructura):** Define la maquetación de la aplicación, el menú de navegación, las vistas de juego y el contenedor visual para el modelo del instrumento.
* **CSS (Estilo y Presentación):** Gestiona el diseño responsivo, la estética visual de la interfaz y las animaciones de iluminación de las teclas del saxofón.
* **JavaScript (Lógica de Cliente):** Controla la comunicación bidireccional por WebSockets, renderiza dinámicamente las vistas, procesa el flujo de juego y evalúa las entradas del usuario en tiempo real.

---

### Funcionalidades Principales

#### 1. Modelo Visual del Saxofón
La interfaz integra una representación gráfica interactiva de un saxofón. 
* **Interactividad en tiempo real:** Mediante la lógica de JavaScript y eventos de red, el modelo responde dinámicamente iluminando sus respectivas teclas virtuales cada vez que el servidor procesa y transmite una nota musical.

#### 2. Gestión del Menú de Canciones
* **Carga dinámica:** Al inicializarse la aplicación, el frontend realiza una petición para consumir el catálogo de canciones disponible en la base de datos (administrada por el servidor).
* **Despliegue de datos:** Las canciones se listan dinámicamente en un menú interactivo mostrando su información básica (Nombre, Compositor, BPM y Dificultad) para que el usuario pueda seleccionarlas.

#### 3. Motor de Juego y Evaluación de Notas
Al iniciar una canción, el motor en JavaScript ejecuta el siguiente ciclo:
* **Despliegue de secuencia:** Se renderizan y despliegan las notas musicales correspondientes en la pantalla de forma secuencial.
* **Evaluación de entrada:** El sistema monitorea si el usuario presiona la tecla o sensor físico correspondiente en el momento adecuado. El frontend procesa estas entradas para registrar la precisión de la ejecución.

#### 4. Informe de Rendimiento y Calificación
Al finalizar la reproducción de la pista, la interfaz despliega una pantalla de resultados detallada con las siguientes métricas:

* **Aciertos:** Cantidad de notas ejecutadas correctamente y a tiempo.
* **Fallos:** Cantidad de notas erradas o fuera de tiempo.
* **Porcentaje de precisión:** Relación porcentual entre los aciertos y el total de notas de la pista.
* **Estado de aprobación:** El sistema aplica una lógica de evaluación donde la canción se considera **aprobada** únicamente si el porcentaje de acierto es **superior al 75%**; de lo contrario, se registra como reprobada.

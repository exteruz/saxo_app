## Funcionamiento de la Base de Datos

La persistencia de datos de la aplicación se gestiona mediante una base de datos relacional, la cual es inicializada y configurada automáticamente a través de un script en JavaScript. El sistema cuenta con una única tabla encargada de almacenar la información de las canciones.

### Estructura de la Tabla: songs

Los campos (fields) que componen esta tabla están definidos de la siguiente manera:

* **id** (INTEGER)
  * **Restricciones:** PRIMARY KEY AUTOINCREMENT
  * **Descripción:** Identificador único y autogenerado para cada registro de la tabla.

* **name** (TEXT)
  * **Restricciones:** NOT NULL UNIQUE
  * **Descripción:** Nombre de la canción. No se permiten valores nulos ni nombres duplicados en la base de datos.

* **composer** (TEXT)
  * **Restricciones:** Ninguna (campo opcional)
  * **Descripción:** Nombre del compositor, autor o creador de la pista musical.

* **bpm** (INTEGER)
  * **Restricciones:** NOT NULL
  * **Descripción:** Beats Per Minute (pulsaciones por minuto). Define el tempo de velocidad de la canción.

* **difficulty** (TEXT)
  * **Restricciones:** NOT NULL
  * **Descripción:** Nivel de dificultad asignado a la canción (por ejemplo: Fácil, Medio, Difícil).

* **notes** (TEXT - JSON)
  * **Restricciones:** NOT NULL
  * **Descripción:** Cadena de texto estructurada en formato JSON que contiene la partitura de la canción, detallando cada nota y su respectiva duración.

---

### Especificación del Campo notes

El campo notes almacena la secuencia de la canción utilizando un formato estructurado JSON. Cada elemento dentro de este arreglo representa una nota musical y contiene dos propiedades clave:

1. **Nota correspondiente:** Representa el tono, frecuencia o clave de la nota que debe reproducirse.
2. **Duración de tiempo:** Define el valor temporal o duración exacta durante la cual debe sostenerse la nota.

#### Ejemplo de Estructura JSON:

```json
[
  {
    "note": "C4",
    "duration": 0.5
  },
  {
    "note": "E4",
    "duration": 0.5
  },
  {
    "note": "G4",
    "duration": 1.0
  }
]

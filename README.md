# saxp_app

Este repositorio contiene la aplicación web y el sistema de control central del proyecto. La plataforma se conecta directamente con el sistema embebido para habilitar un entorno de juego interactivo enfocado en el aprendizaje y la práctica del saxofón.

---

## Arquitectura del Sistema

El proyecto utiliza una arquitectura de red en estrella con un servidor central que coordina la comunicación en tiempo real a través de **WebSockets**:

* **Servidor Central (Node.js):** Actúa como el puente de datos y el motor de validación.
* **Interfaz de Usuario (Página Web con JS):** Despliega el entorno gráfico, las pistas y procesa la interfaz para el usuario.
* **Sistema Embebido:** Captura las pulsaciones físicas del usuario en el instrumento y las envía inmediatamente al servidor.

A continuación, se presenta el esquema de interacción de la arquitectura:

![Arquitectura del Sistema y Flujo de Datos](./ruta-de-tu-imagen/arquitectura.png)

*(Nota: Asegúrate de guardar tu imagen dentro de una carpeta en tu repositorio, por ejemplo en una carpeta llamada `assets`, y reemplaza `./ruta-de-tu-imagen/arquitectura.png` por la ruta real, como `./assets/arquitectura.png`)*.

---

## Dinámica del Juego y Mecánica de Validación

El núcleo de la aplicación es un juego de **timing (sincronización) y precisión** que sigue la siguiente secuencia lógica:

1. **Lectura y Despliegue:** La página web lee la partitura desde la base de datos a través del servidor y despliega visualmente las notas que el usuario debe tocar en tiempo real.
2. **Ejecución:** El usuario, utilizando el dispositivo embebido físico, digita las posiciones de las notas musicales en el instrumento siguiendo el tempo indicado.
3. **Validación:** Los eventos físicos son transmitidos  mediante WebSockets al servidor central, el cual se encarga de comparar y validar si la nota digitada por el usuario coincide con la nota esperada en la secuencia musical en ese instante exacto de tiempo.

## Guía de Inicio Rápido

Sigue estos comandos en tu terminal para configurar el entorno y poner en marcha el servidor de desarrollo.

### 1. Instalación de Dependencias

Antes de iniciar el servidor por primera vez, debes instalar todas las librerías y módulos de Node.js especificados en el archivo `package.json`. Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install y a continuacion se ejecuta npm run dev
---


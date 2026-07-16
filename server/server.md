## Arquitectura del Servidor

El backend de la aplicación está desarrollado sobre **Node.js** y utiliza el protocolo **WebSockets** para permitir la comunicación bidireccional y en tiempo real entre los diferentes componentes del sistema.

El servidor actúa como un intermediario o puente de datos, facilitando el intercambio de información entre la interfaz web (frontend) y el sistema embebido.

---

### Componentes y Archivos Clave

* **`index.js`**
  * **Propósito:** Es el archivo principal de ejecución del servidor.
  * **Roles en WebSocket:** Identifica y asigna roles específicos a las conexiones entrantes (por ejemplo, `web` para la interfaz de usuario y `simulator` o `embedded` para el hardware) para dirigir los mensajes al destinatario correcto.
  * **Intercambio de Datos:** Gestiona el flujo y enrutamiento de paquetes en tiempo real entre los clientes conectados.
  * **Gestión de Base de Datos:** Centraliza la lógica de acceso a datos, encargándose de la inicialización de la base de datos y la ejecución de las consultas (queries) SQL para almacenar o recuperar las canciones.

* **`package.json`**
  * **Propósito:** Archivo de configuración del proyecto Node.js.
  * **Dependencias:** Contiene el listado y control de versiones de las librerías necesarias para el funcionamiento del servidor.
  * **Scripts de ejecución:** Define los comandos de automatización, incluyendo el script de inicialización para el entorno de desarrollo.

---

### Configuración de Red y Despliegue

Para poner en marcha el servidor en tu entorno de desarrollo local, se deben tener en cuenta los siguientes parámetros de red y ejecución:

* **Puerto local:** El servidor escucha conexiones a través del puerto **`5000`** (por ejemplo, `ws://localhost:5000` o `ws://10.52.223.93:5000` dentro de tu red).
* **Comando de inicio:** Para arrancar el servidor con soporte de recarga automática (usualmente configurado con herramientas como Nodemon), ejecuta el siguiente comando en tu terminal:

```bash
npm run dev

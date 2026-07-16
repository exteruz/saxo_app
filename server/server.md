## Arquitectura del Servidor

El backend de la aplicación está desarrollado sobre **Node.js** y utiliza el protocolo **WebSockets** para permitir la comunicación bidireccional y en tiempo real entre los diferentes componentes del sistema. asi mismo usa peticiones http para el renderizado de la 
aplicacion web.

El servidor actúa como un intermediario o puente de datos, facilitando el intercambio de información entre la interfaz web (frontend) y el sistema embebido.

---

### Componentes y Archivos Clave

* **`index.js`**
  * **Roles en WebSocket:** Identifica y asigna roles específicos a las conexiones entrantes.
  * **Intercambio de Datos:** Gestiona el flujo y enrutamiento de paquetes en tiempo real entre los clientes conectados.
  * **Gestión de Base de Datos:** Centraliza la lógica de acceso a datos, encargándose de la inicialización de la base de datos y la ejecución de las consultas (queries) SQL para almacenar o recuperar las canciones.

* **`package.json`**
  * **Propósito:** Archivo de configuración del proyecto Node.js.
  * **Dependencias:** Contiene el listado y control de versiones de las librerías necesarias para el funcionamiento del servidor.
  * **Scripts de ejecución:** Define los comandos de automatización, incluyendo el script de inicialización para el entorno de desarrollo.

---

### Configuración de Red y Despliegue

Para poner en marcha el servidor en tu entorno de desarrollo local, se deben tener en cuenta los siguientes parámetros de red y ejecución:

* **Puerto local:** El servidor escucha conexiones a través del puerto  //localhost:5000
* **Comando de inicio:** Para arrancar el servidor con soporte de recarga automática a traves de la herramienta nodemon.


npm run dev

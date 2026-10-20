# Trabajo grupal integrador

Aplicación de registro de usuarios con un frontend React, una API REST en Node.js/Express y persistencia en MySQL.

## Tecnologías y dependencias

- **Node.js 20.19 o superior** y **npm**: entorno de ejecución y gestor de paquetes (requerido por Vite 7).
- **Express 5**: servidor HTTP y definición de rutas de la API.
- **mysql2**: cliente de MySQL. Se utiliza la interfaz `mysql2/promise` para trabajar con promesas y consultas asíncronas.
- **dotenv**: carga variables de entorno desde el archivo local `.env`.
- **React 19**: interfaz del formulario y estado controlado con `useState`.
- **Vite 7**: servidor de desarrollo y herramienta de compilación del frontend.

Las dependencias del servidor y de la interfaz se administran de forma independiente en [`backend/package.json`](./backend/package.json) y [`frontend/package.json`](./frontend/package.json). Cada `package-lock.json` fija las versiones resueltas para instalaciones reproducibles.

## Estructura

```text
backend/
├── src/
│   ├── app.js          # Aplicación Express, CORS y montaje de rutas
│   ├── db.js           # Pool y configuración de MySQL
│   ├── routes/
│   │   └── usuarios.js # Operaciones CRUD de usuarios
│   └── server.js       # Carga del entorno e inicio del servidor
├── .env.example     # Plantilla de configuración local
├── database.sql      # Creación de la base y tabla
├── package.json
└── package-lock.json
frontend/
├── src/
│   ├── App.jsx       # Formulario React controlado
│   ├── main.jsx      # Punto de entrada de React
│   └── styles.css    # Estilos de la interfaz
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Requisitos

- Node.js 20.19 o superior y npm.
- Un servidor MySQL en ejecución.
- Una base de datos y credenciales válidas para ese servidor.

## Configuración

### 1. Crear la base y la tabla

En MySQL, ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS senati_integrador;
USE senati_integrador;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL
);
```

El mismo script está disponible en [`backend/database.sql`](./backend/database.sql). No inserta registros de prueba.

### 2. Configurar las variables de entorno

Desde la carpeta `backend/`, crea un archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Edita `.env` para que sus valores coincidan con tu instalación local de MySQL:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_clave
DB_NAME=senati_integrador
```

Si tu usuario MySQL no tiene contraseña, deja `DB_PASSWORD=` vacío. No compartas ni subas `.env`: contiene configuración privada y está excluido del repositorio por `.gitignore`.

Para llamadas desde una aplicación React en desarrollo, el backend permite por defecto los orígenes de Vite `http://localhost:5173` y `http://127.0.0.1:5173`. Si el frontend usa otro origen, agrega `FRONTEND_ORIGIN` a `.env`. Se pueden indicar varios separados por comas:

```dotenv
FRONTEND_ORIGIN=http://localhost:5173,http://localhost:3001
```

### 3. Instalar y ejecutar

Desde `backend/`:

```bash
npm ci
npm start
```

El servidor queda disponible en `http://localhost:3000`. Para desarrollo con reinicio automático al guardar cambios, ejecuta `npm run dev`.

### 4. Instalar y ejecutar el frontend

En otra terminal, desde `frontend/`:

```bash
npm ci
npm run dev
```

Vite muestra la dirección local de la interfaz, normalmente `http://localhost:5173`. El frontend llama al backend en `http://localhost:3000`. Si el backend usa otra dirección, crea `frontend/.env` con `VITE_API_URL=http://localhost:PUERTO` y reinicia Vite después de cambiar esa variable.

## API de usuarios

Todas las rutas usan la base `http://localhost:3000/api/usuarios` y reciben/devuelven JSON. Los errores tienen la forma `{"error":"..."}`. La API responde `400` si el ID o los campos requeridos no son válidos, `404` si el ID no existe y `500` si falla una operación de base de datos.

### Crear un usuario

```http
POST /api/usuarios
Content-Type: application/json
```

Entrada:

```json
{
  "nombre": "Ana Pérez",
  "correo": "ana@example.com"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "nombre": "Ana Pérez",
  "correo": "ana@example.com"
}
```

### Listar usuarios

```http
GET /api/usuarios
```

Respuesta `200 OK`: un arreglo de usuarios; si no hay registros, devuelve `[]`.

```json
[
  {
    "id": 1,
    "nombre": "Ana Pérez",
    "correo": "ana@example.com"
  }
]
```

### Consultar un usuario por ID

```http
GET /api/usuarios/:id
```

Ejemplo: `GET http://localhost:3000/api/usuarios/1`

Respuesta exitosa (`200 OK`):

```json
{
  "id": 1,
  "nombre": "Ana Pérez",
  "correo": "ana@example.com"
}
```

La API valida que `id` sea un entero positivo seguro (`400 Bad Request` si no es válido) y responde `404 Not Found` si no hay un usuario con ese identificador.

### Actualizar un usuario

```http
PUT /api/usuarios/:id
Content-Type: application/json
```

Envía ambos campos:

```json
{
  "nombre": "Ana Pérez actualizada",
  "correo": "ana.actualizada@example.com"
}
```

Respuesta `200 OK`: el usuario actualizado, incluyendo su `id`.

### Eliminar un usuario

```http
DELETE /api/usuarios/:id
```

No requiere body. Respuesta `200 OK`:

```json
{
  "mensaje": "Usuario eliminado."
}
```

### Consumo desde React

Con CORS configurado, el frontend puede llamar al backend directamente. Ejemplo para listar:

```js
const response = await fetch('http://localhost:3000/api/usuarios');
if (!response.ok) throw new Error('No se pudieron cargar los usuarios');
const usuarios = await response.json();
```

Para crear o actualizar, envía `Content-Type: application/json` y `body: JSON.stringify({ nombre, correo })`. Para eliminar, envía `DELETE` a la URL que termina en el ID.

## Consultar, actualizar y eliminar usuarios

La interfaz carga los usuarios desde `GET /api/usuarios` al abrirse y los presenta en la sección **Usuarios registrados**. El botón **Actualizar lista** vuelve a consultar MySQL.

- **Editar:** selecciona **Editar** junto al usuario. Sus datos pasan al formulario; modifica los campos y pulsa **Guardar cambios**. La interfaz envía `PUT /api/usuarios/:id` y actualiza la lista si la API confirma la operación.
- **Eliminar:** selecciona **Eliminar** y confirma con **Sí, eliminar**. La interfaz envía `DELETE /api/usuarios/:id`; la fila desaparece de la lista tras la respuesta exitosa. Se puede cancelar antes de confirmar.

Las operaciones usan las rutas del backend y muestran errores si la solicitud falla.

## Flujo de la consulta

1. Express recibe la petición, aplica CORS y procesa JSON.
2. La ruta valida los campos o el ID según la operación.
3. El pool compartido de `src/db.js` ejecuta SQL parametrizado mediante `pool.execute`.
4. Express devuelve el resultado o un error JSON con el código HTTP correspondiente.

## Actividad 5. Formulario controlado y demostración

El formulario está implementado en [`frontend/src/App.jsx`](./frontend/src/App.jsx). Usa `useState` para conservar el nombre, el correo, el estado de envío y el resultado. Los campos son controlados: `value` muestra el valor actual del estado y `onChange` lo actualiza mientras se escribe.

Al pulsar **Registrar usuario**, `onSubmit` ejecuta `event.preventDefault()` para evitar que el navegador recargue la página. Luego envía una petición `POST` a `/api/usuarios` con los campos en formato JSON. El backend valida los datos y ejecuta un `INSERT` parametrizado en MySQL. Cuando responde `201 Created`, la interfaz muestra el ID, nombre y correo confirmados por el backend. Ante un error, muestra un mensaje en el formulario.

Para demostrarlo:

1. Inicia MySQL y el backend.
2. Inicia el frontend y abre la dirección local de Vite.
3. Escribe un nombre y un correo, y pulsa **Registrar usuario**. La interfaz mostrará los datos y el ID devueltos por el backend.
4. En MySQL, comprueba que la fila persistió:

   ```sql
   USE senati_integrador;
   SELECT id, nombre, correo
   FROM usuarios
   ORDER BY id DESC
   LIMIT 1;
   ```

Al escribir, cada `onChange` actualiza el estado con `setFormulario`, por lo que React refleja el valor actual en los campos. Al enviar, `preventDefault()` mantiene la página sin recarga; `fetch` remite el estado al endpoint, Express lo inserta en MySQL y devuelve el registro para mostrarlo como confirmación.

## Notas de seguridad y operación

- Configura credenciales propias en `.env`; no escribas contraseñas en el código ni las publiques.
- Usa un usuario MySQL con los permisos mínimos necesarios para la aplicación, en vez de `root` en un entorno compartido o de producción.
- El pool admite hasta 10 conexiones simultáneas y se cierra al detener el servidor con `Ctrl+C` o una señal de terminación.
- El recurso de usuarios está bajo `/api/usuarios`.

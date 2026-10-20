# Trabajo grupal integrador

Backend del proyecto integrador desarrollado con Node.js y Express, con conexión a MySQL para consultar usuarios mediante una API REST.

## Tecnologías y dependencias

- **Node.js 18 o superior** y **npm**: entorno de ejecución y gestor de paquetes.
- **Express 5**: servidor HTTP y definición de rutas de la API.
- **mysql2**: cliente de MySQL. Se utiliza la interfaz `mysql2/promise` para trabajar con promesas y consultas asíncronas.
- **dotenv**: carga variables de entorno desde el archivo local `.env`.

Las dependencias directas y los comandos del backend se encuentran en [`backend/package.json`](./backend/package.json). [`backend/package-lock.json`](./backend/package-lock.json) fija las versiones resueltas para instalaciones reproducibles.

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
```

## Requisitos

- Node.js 18 o superior y npm.
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

Para llamadas desde una aplicación React en desarrollo, el backend permite por defecto el origen de Vite `http://localhost:5173`. Si el frontend usa otro origen, agrega `FRONTEND_ORIGIN` a `.env`. Se pueden indicar varios separados por comas:

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

## Flujo de la consulta

1. Express recibe la petición, aplica CORS y procesa JSON.
2. La ruta valida los campos o el ID según la operación.
3. El pool compartido de `src/db.js` ejecuta SQL parametrizado mediante `pool.execute`.
4. Express devuelve el resultado o un error JSON con el código HTTP correspondiente.

## Notas de seguridad y operación

- Configura credenciales propias en `.env`; no escribas contraseñas en el código ni las publiques.
- Usa un usuario MySQL con los permisos mínimos necesarios para la aplicación, en vez de `root` en un entorno compartido o de producción.
- El pool admite hasta 10 conexiones simultáneas y se cierra al detener el servidor con `Ctrl+C` o una señal de terminación.
- La ruta raíz `/` no está definida; el recurso de usuarios está bajo `/api/usuarios`.

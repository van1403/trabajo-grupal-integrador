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
│   ├── app.js       # Aplicación Express y rutas HTTP
│   ├── db.js        # Pool y configuración de MySQL
│   └── server.js    # Carga del entorno e inicio del servidor
├── .env.example     # Plantilla de configuración local
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
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE
);

INSERT IGNORE INTO usuarios (nombre, correo)
VALUES ('Ana Pérez', 'ana@example.com');
```

El último comando crea un registro de ejemplo para probar la API.

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

### 3. Instalar y ejecutar

Desde `backend/`:

```bash
npm ci
npm start
```

El servidor queda disponible en `http://localhost:3000`. Para desarrollo con reinicio automático al guardar cambios, ejecuta `npm run dev`.

## API disponible

### Consultar un usuario

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

## Flujo de la consulta

1. Express recibe la petición y extrae el identificador de la ruta.
2. La aplicación valida el valor antes de consultar.
3. El pool configurado en `src/db.js` reutiliza conexiones al servidor MySQL.
4. La ruta usa `pool.execute('SELECT id, nombre, correo FROM usuarios WHERE id = ?', [id])`. El parámetro se envía separado del SQL y se enlaza al marcador `?`; no se concatena directamente en la consulta.
5. Express devuelve el registro como JSON. Si falla la consulta, el servidor registra el error y responde `500 Internal Server Error`.

## Notas de seguridad y operación

- Configura credenciales propias en `.env`; no escribas contraseñas en el código ni las publiques.
- Usa un usuario MySQL con los permisos mínimos necesarios para la aplicación, en vez de `root` en un entorno compartido o de producción.
- El pool admite hasta 10 conexiones simultáneas y se cierra al detener el servidor con `Ctrl+C` o una señal de terminación.
- La ruta raíz `/` no está definida; la ruta implementada es `/api/usuarios/:id`.

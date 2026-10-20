require('dotenv').config();

const app = require('./app');
const pool = require('./db');

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un puerto válido entre 1 y 65535.');
}

const server = app.listen(port, () => {
  console.log(`Backend disponible en http://localhost:${port}`);
});

function shutdown() {
  server.close((serverError) => {
    if (serverError) {
      console.error('Error al cerrar el servidor:', serverError);
      process.exitCode = 1;
    }

    pool.end().catch((poolError) => {
      console.error('Error al cerrar el pool de MySQL:', poolError);
      process.exitCode = 1;
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.get('/api/usuarios/:id', async (req, res, next) => {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, correo FROM usuarios WHERE id = ?',
      [Number(id)],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró el usuario.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error('Error al procesar la solicitud:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({ error: 'Error interno al consultar la base de datos.' });
});

module.exports = app;

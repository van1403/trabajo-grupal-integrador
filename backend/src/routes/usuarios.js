const express = require('express');
const pool = require('../db');

const router = express.Router();

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    return null;
  }

  return Number(value);
}

function hasUserFields(body) {
  return (
    typeof body?.nombre === 'string' &&
    body.nombre.trim().length > 0 &&
    typeof body?.correo === 'string' &&
    body.correo.trim().length > 0
  );
}

router.post('/', async (req, res) => {
  const { nombre, correo } = req.body ?? {};

  if (!hasUserFields(req.body)) {
    return res.status(400).json({ error: 'nombre y correo son obligatorios.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, correo) VALUES (?, ?)',
      [nombre, correo],
    );

    return res.status(201).json({ id: result.insertId, nombre, correo });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al listar los usuarios:', error);
    return res.status(500).json({ error: 'No se pudieron consultar los usuarios.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const { nombre, correo } = req.body ?? {};

  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  if (!hasUserFields(req.body)) {
    return res.status(400).json({ error: 'nombre y correo son obligatorios.' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
      [nombre, correo, id],
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró el usuario.' });
      }
    }

    return res.status(200).json({ id, nombre, correo });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: 'El id debe ser un entero positivo.' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontró el usuario.' });
    }

    return res.status(200).json({ mensaje: 'Usuario eliminado.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return res.status(500).json({ error: 'No se pudo eliminar el usuario.' });
  }
});

module.exports = router;
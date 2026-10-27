const express = require('express');
const router = express.Router();
const RegistroTurno = require('../models/RegistroTurno');

// POST: Registrar un nuevo turno en MongoDB
router.post('/turnos', async (req, res) => {
  try {
    const nuevoTurno = new RegistroTurno(req.body);
    const turnoGuardado = await nuevoTurno.save();
    
    res.status(201).json({
      mensaje: 'Turno registrado correctamente en MongoDB',
      data: turnoGuardado
    });
  } catch (error) {
    console.error('Error al guardar turno:', error);
    res.status(500).json({
      mensaje: 'Error al registrar turno en base de datos',
      error: error.message
    });
  }
});

module.exports = router;
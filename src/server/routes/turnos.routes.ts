import { Router, Request, Response } from 'express';
import Turno from '../models/turno';

const router = Router();

// 🚀 Obtener todos los turnos
router.get('/', async (req: Request, res: Response) => {
  try {
    const turnos = await Turno.find().sort({ fechaInicio: -1 });
    return res.json(turnos);
  } catch (error) {
    return res.status(500).json({ message: 'Error al consultar los turnos.' });
  }
});

// 🚀 Crear un nuevo turno
router.post('/', async (req: Request, res: Response) => {
  try {
    const nuevoTurno = new Turno(req.body);
    await nuevoTurno.save();
    return res.status(201).json({ message: 'Turno programado con éxito', turno: nuevoTurno });
  } catch (error) {
    return res.status(400).json({ message: 'Error al guardar el turno.', error });
  }
});

// 🚀 Cambiar estado del turno (ej: de Programado a En Ejecución / Completado)
router.patch('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    const id = req.params['id']; // 👈 Corregido para evitar el error TS4111

    const turnoActualizado = await Turno.findByIdAndUpdate(
      id, 
      { estado }, 
      { new: true }
    );
    return res.json(turnoActualizado);
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar estado.' });
  }
});

export default router;
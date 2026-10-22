import { Router, Request, Response } from 'express';
import { Aforo } from '../models/Aforo';

const router = Router();

// POST /api/aforo (y también /api/aforo/calcular) para procesar y guardar en MongoDB
const guardarAforoHandler = async (req: Request, res: Response) => {
  try {
    const { 
      anchoSolera, base, 
      tiranteAgua, tirante, 
      pendiente, pendientePorc, 
      rugosidad, 
      usuarioId, 
      nombreCanal 
    } = req.body;

    // Normalizar nombres de variables provenientes del frontend
    const b = Number(anchoSolera || base);
    const y = Number(tiranteAgua || tirante);
    const S = Number(pendiente || (pendientePorc ? pendientePorc / 100 : 0));
    const n = Number(rugosidad);

    if (!b || !y || !S || !n || b <= 0 || y <= 0 || S <= 0 || n <= 0) {
      console.log('⚠️ [AFORO FAILED] Datos de entrada inválidos');
      return res.status(400).json({ message: 'Todos los datos de entrada deben ser números mayores a cero.' });
    }

    // 1. Área mojada
    const areaMojada = b * y;

    // 2. Perímetro mojado
    const perimetroMojado = b + (2 * y);

    // 3. Radio hidráulico
    const radioHidraulico = areaMojada / perimetroMojado;

    // 4. Velocidad por Manning
    const velocidad = (1 / n) * Math.pow(radioHidraulico, 2 / 3) * Math.sqrt(S);

    // 5. Caudal
    const caudalM3S = areaMojada * velocidad;
    const caudalLS = caudalM3S * 1000;

    // 6. Número de Froude
    const g = 9.81;
    const numeroFroude = velocidad / Math.sqrt(g * y);

    let regimenFlujo = 'Subcrítico';
    if (Math.abs(numeroFroude - 1) < 0.02) {
      regimenFlujo = 'Crítico';
    } else if (numeroFroude > 1) {
      regimenFlujo = 'Supercrítico';
    }

    // Guardar en la base de datos MongoDB
    const nuevoAforo = new Aforo({
      usuarioId: usuarioId || null,
      nombreCanal: nombreCanal || 'Canal Principal',
      anchoSolera: b,
      tiranteAgua: y,
      pendiente: S,
      rugosidad: n,
      areaMojada: Number(areaMojada.toFixed(4)),
      perimetroMojado: Number(perimetroMojado.toFixed(4)),
      radioHidraulico: Number(radioHidraulico.toFixed(4)),
      velocidad: Number(velocidad.toFixed(3)),
      caudalM3S: Number(caudalM3S.toFixed(4)),
      caudalLS: Number(caudalLS.toFixed(2)),
      numeroFroude: Number(numeroFroude.toFixed(3)),
      regimenFlujo
    });

    await nuevoAforo.save();

    // 🚀 LOG EN LA TERMINAL DE VS CODE
    console.log(`🌊 [MONGODB] Aforo guardado con éxito! Caudal: ${nuevoAforo.caudalLS} L/s (${nuevoAforo.regimenFlujo})`);

    return res.status(201).json({
      message: 'Cálculo realizado con éxito',
      resultado: nuevoAforo
    });

  } catch (error) {
    console.error('❌ Error al guardar aforo:', error);
    return res.status(500).json({ message: 'Error interno al procesar los cálculos hidráulicos.' });
  }
};

// Rutas compatibles tanto con POST /api/aforo como POST /api/aforo/calcular
router.post('/', guardarAforoHandler);
router.post('/calcular', guardarAforoHandler);

// GET /api/aforo/historial
router.get('/historial', async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.query;
    const filter = usuarioId ? { usuarioId } : {};
    
    const historial = await Aforo.find(filter).sort({ createdAt: -1 }).limit(20);
    return res.json(historial);
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    return res.status(500).json({ message: 'Error al consultar historial.' });
  }
});

export default router;
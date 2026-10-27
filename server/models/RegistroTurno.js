const mongoose = require('mongoose');

const RegistroTurnoSchema = new mongoose.Schema({
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: false 
  },
  nombrePredio: { 
    type: String, 
    default: 'Predio Agrícola General' 
  },
  cultivoKey: {
    type: String,
    required: false
  },
  cultivo: {
    type: String,
    required: false
  },
  cultivoIcono: {
    type: String,
    required: false
  },
  parametrosCanal: {
    base: { type: Number, required: true },
    tirante: { type: Number, required: true },
    pendientePorc: { type: Number, required: true },
    rugosidad: { type: Number, required: true },
    distanciaMetros: { type: Number, default: 500 }
  },
  calculosHidraulicos: {
    areaM2: { type: Number, required: true },
    perimetroM: { type: Number, required: true },
    radioHidraulicoM: { type: Number, required: true },
    velocidadMs: { type: Number, required: true },
    caudalM3s: { type: Number, required: true },
    caudalLitrosSeg: { type: Number, required: true },
    froude: { type: Number, required: true },
    regimen: { type: String, required: true }
  },
  liquidacionTurno: {
    volumenM3: { type: Number, required: true },
    tiempoTotalHoras: { type: Number, required: true },
    tiempoHoras: { type: Number, required: true },
    tiempoMinutos: { type: Number, required: true },
    tarifaM3: { type: Number, required: true },
    costoTotalCLP: { type: Number, required: true },
    tiempoLlegadaMinutos: { type: Number, default: 0 }
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.models.RegistroTurno || mongoose.model('RegistroTurno', RegistroTurnoSchema);
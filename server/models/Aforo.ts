import { Schema, model, models } from 'mongoose';

const aforoSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  nombreCanal: { type: String, default: 'Canal Principal' },
  anchoSolera: { type: Number, required: true }, // b (metros)
  tiranteAgua: { type: Number, required: true },  // y (metros)
  pendiente: { type: Number, required: true },     // S (m/m o decimal)
  rugosidad: { type: Number, required: true },     // n de Manning
  
  // Resultados calculados
  areaMojada: { type: Number, required: true },     // A (m²)
  perimetroMojado: { type: Number, required: true },// P (m)
  radioHidraulico: { type: Number, required: true },// Rh (m)
  velocidad: { type: Number, required: true },      // V (m/s)
  caudalM3S: { type: Number, required: true },      // Q (m³/s)
  caudalLS: { type: Number, required: true },       // Q (L/s)
  numeroFroude: { type: Number, required: true },   // Fr
  regimenFlujo: { type: String, required: true },   // Subcrítico, Crítico, Supercrítico
  
  createdAt: { type: Date, default: Date.now }
});

export const Aforo = models['Aforo'] || model('Aforo', aforoSchema);
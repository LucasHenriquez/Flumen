import mongoose, { Schema, Document } from 'mongoose';

export interface ITurno extends Document {
  parcela: string;
  volumenRequeridoM3: number;
  caudalLS: number;
  tarifaPorM3: number;
  horasFormato?: string;
  tiempoTotalMinutos?: number;
  montoPagoCLP?: number;
  estado?: string;
  fechaCreacion?: Date;
}

const TurnoSchema: Schema = new Schema({
  parcela: { type: String, required: true },
  volumenRequeridoM3: { type: Number, required: true },
  caudalLS: { type: Number, required: true },
  tarifaPorM3: { type: Number, default: 18 },
  horasFormato: { type: String },
  tiempoTotalMinutos: { type: Number },
  montoPagoCLP: { type: Number },
  estado: { type: String, default: 'Programado' },
  fechaCreacion: { type: Date, default: Date.now }
});

// Evita la sobrescritura del modelo durante las recargas automáticas de SSR / Vite
export default mongoose.models['turno'] || mongoose.model<ITurno>('turno', TurnoSchema);
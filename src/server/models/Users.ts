import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  cargo: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Verificamos si el modelo ya existe en 'models' antes de crearlo
export const User = models['User'] || model('User', userSchema);
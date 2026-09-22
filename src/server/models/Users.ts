import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 👈 Verificamos si el modelo ya existe en 'models' antes de crearlo
export const User = models['User'] || model('User', userSchema);
import mongoose from 'mongoose';

// Pega tu enlace de MongoDB Atlas o usa el local entre comillas:
const MONGODB_URI = 'mongodb+srv://tu_usuario:tu_password@cluster0.xxxxx.mongodb.net/flumen_db?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 ¡Conectado exitosamente a MongoDB!');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}
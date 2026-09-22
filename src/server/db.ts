import mongoose from 'mongoose';

// Pega tu enlace de MongoDB Atlas o usa el local entre comillas:
const MONGODB_URI = 'mongodb+srv://lucas:Lucasllet2@cluster0.k7munpk.mongodb.net/?appName=Cluster0;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 ¡Conectado exitosamente a MongoDB!');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

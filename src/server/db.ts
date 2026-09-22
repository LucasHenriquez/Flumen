import mongoose from 'mongoose';

// Pega tu enlace de MongoDB Atlas o usa el local entre comillas:
const MONGODB_URI = 'mongodb://lucas:Lucasllet2@ac-3ahwp1z-shard-00-00.k7munpk.mongodb.net:27017,ac-3ahwp1z-shard-00-01.k7munpk.mongodb.net:27017,ac-3ahwp1z-shard-00-02.k7munpk.mongodb.net:27017/?ssl=true&replicaSet=atlas-xl7i4b-shard-0&authSource=admin&appName=Cluster0;

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 ¡Conectado exitosamente a MongoDB!');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}

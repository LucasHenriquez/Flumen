const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El formato del correo electrónico no es válido']
  },
  passwordHash: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  // Ocupación en el sector agrícola chileno
  ocupacion: {
    type: String,
    enum: [
      'agricultor_particular',       // Agricultor / Regante
      'celador_compuerta',           // Celador / Juez de río
      'asociacion_canalistas',       // Junta de vigilancia / Asociación
      'profesional_agronomo'         // Agrónomo / Técnico agrícola
    ],
    default: 'agricultor_particular'
  },
  // Rol interno del sistema: Solo se cambia manualmente desde base de datos o consola
  rolSistema: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
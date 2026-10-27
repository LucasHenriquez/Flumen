const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const Usuario = require('./models/Usuario');
const RegistroTurno = require('./models/RegistroTurno');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'flumen_secreto_super_seguro_2026';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://lucas:Lucasllet2@cluster0.k7munpk.mongodb.net/flumen_db?retryWrites=true&w=majority';

console.log('Iniciando conexión a MongoDB Atlas...');

mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ MongoDB Atlas conectado exitosamente'))
  .catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err.message));

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, correo, password, ocupacion } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor, completa todos los campos obligatorios.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres.' 
      });
    }

    const usuarioExiste = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (usuarioExiste) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este correo ya se encuentra registrado.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      passwordHash,
      ocupacion: ocupacion || 'agricultor_particular',
      rolSistema: 'usuario'
    });

    await nuevoUsuario.save();

    const token = jwt.sign(
      { 
        id: nuevoUsuario._id, 
        nombre: nuevoUsuario.nombre, 
        correo: nuevoUsuario.correo, 
        ocupacion: nuevoUsuario.ocupacion,
        rolSistema: nuevoUsuario.rolSistema 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Cuenta creada con éxito.',
      token,
      usuario: { 
        id: nuevoUsuario._id, 
        nombre: nuevoUsuario.nombre, 
        correo: nuevoUsuario.correo, 
        ocupacion: nuevoUsuario.ocupacion 
      }
    });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor al procesar el registro.' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ingresa correo y contraseña.' 
      });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase().trim() });
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas.' 
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValido) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas.' 
      });
    }

    const token = jwt.sign(
      { 
        id: usuario._id, 
        nombre: usuario.nombre, 
        correo: usuario.correo, 
        ocupacion: usuario.ocupacion,
        rolSistema: usuario.rolSistema 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: { 
        id: usuario._id, 
        nombre: usuario.nombre, 
        correo: usuario.correo, 
        ocupacion: usuario.ocupacion 
      }
    });
  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor al intentar iniciar sesión.' 
    });
  }
});

// ==========================================
// RUTAS DE CÁLCULOS Y TURNOS (ANGULAR FLUMEN)
// ==========================================

// 1. Obtener historial
app.get(['/api/calculos', '/api/turnos'], async (req, res) => {
  try {
    const historial = await RegistroTurno.find().sort({ fechaCreacion: -1 }).limit(30);
    return res.status(200).json({ success: true, data: historial });
  } catch (error) {
    console.error('Error al obtener cálculos:', error);
    return res.status(500).json({ success: false, message: 'Error al consultar la base de datos.' });
  }
});

// 2. Guardar turno (Acepta tanto /api/calculos como /api/turnos)
app.post(['/api/calculos', '/api/turnos'], async (req, res) => {
  try {
    // Si usuarioId viene como string vacío "", asignarlo como null para no romper la validación de ObjectId de Mongoose
    if (req.body.usuarioId === '') {
      req.body.usuarioId = null;
    }

    const nuevoCalculo = new RegistroTurno(req.body);
    await nuevoCalculo.save();

    return res.status(201).json({ 
      success: true, 
      message: 'Turno registrado exitosamente en MongoDB.',
      data: nuevoCalculo 
    });
  } catch (error) {
    console.error('Error al guardar turno:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al registrar el turno en MongoDB.',
      error: error.message 
    });
  }
});

// 3. Eliminar turno (Acepta tanto /api/calculos como /api/turnos)
app.delete(['/api/calculos/:id', '/api/turnos/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    await RegistroTurno.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Registro eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar cálculo:', error);
    return res.status(500).json({ success: false, message: 'No se pudo eliminar el registro.' });
  }
});

// Historial respaldado
app.get('/api/turnos/historial', async (req, res) => {
  try {
    const historial = await RegistroTurno.find().sort({ fechaCreacion: -1 }).limit(20);
    res.json({ success: true, data: historial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el historial.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Servidor FLUMEN API escuchando en el puerto ${PORT}`);
});
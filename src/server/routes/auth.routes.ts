import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/Users';

const router = Router();
const JWT_SECRET = process.env['JWT_SECRET'] || 'secreto_flumen_2026';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { nombre, email, cargo, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️ [REGISTER FAILED] Intento de registro con correo ya existente: ${email}`);
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      nombre,
      email,
      cargo,
      password: hashedPassword
    });

    await newUser.save();

    // 🚀 LOG PARA VER EN LA TERMINAL AL REGISTRAR
    console.log(`📦 [MONGODB] Usuario creado con éxito: ${newUser.email} (${newUser.nombre})`);

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(201).json({
      token,
      user: { id: newUser._id, nombre: newUser.nombre, email: newUser.email, cargo: newUser.cargo }
    });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ [LOGIN FAILED] Usuario no encontrado: ${email}`);
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`⚠️ [LOGIN FAILED] Contraseña incorrecta para: ${email}`);
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // 🚀 LOG PARA VER EN LA TERMINAL AL INICIAR SESIÓN
    console.log(`🔑 [LOGIN SUCCESS] Sesión iniciada correctamente: ${user.email}`);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email, cargo: user.cargo }
    });
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

export default router;
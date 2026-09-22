import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';
import { connectDB } from './server/db'; 
import { User } from './server/models/Users'; 

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Middleware para recibir JSON en las peticiones API
  server.use(express.json());

  // ==========================================
  // 🚀 RUTAS DE LA API (Login / Register)
  // ==========================================
  
  // Ruta de registro conectada a MongoDB
  server.post('/api/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const newUser = new User({ email, password });
      await newUser.save();
      return res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Error al registrar usuario' });
    }
  });

  // Ruta de login conectada a MongoDB
  server.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      return res.json({ message: 'Login exitoso', email: user.email });
    } catch (error) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  });

  // ==========================================
  // RUTAS DE ANGULAR SSR
  // ==========================================
  server.get('/*path', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Conectar a MongoDB antes de arrancar el servidor Express
  connectDB().then(() => {
    const server = app();
    server.listen(port, () => {
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  });
}

run();
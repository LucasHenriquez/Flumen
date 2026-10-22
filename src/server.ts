import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import cors from 'cors'; // 👈 Importamos CORS
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';
import { connectDB } from './server/db'; 
import authRoutes from './server/routes/auth.routes';
import aforoRoutes from './server/routes/aforo.routes';
import turnosRoutes from './server/routes/turnos.routes';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // 👈 Permite peticiones HTTP entre el puerto 4200 (Angular) y el puerto 4000 (Express)
  server.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware para recibir JSON en las peticiones API
  server.use(express.json());

  // ==========================================
  // 🚀 RUTAS DE LA API (Auth, Aforo y Turnos)
  // ==========================================
  server.use('/api/auth', authRoutes);
  server.use('/api/aforo', aforoRoutes);
  server.use('/api/turnos', turnosRoutes);

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
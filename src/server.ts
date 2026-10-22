import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './main.server';
import { connectDB } from '../server/db';
import authRoutes from '../server/routes/auth.routes';
import aforoRoutes from '../server/routes/aforo.routes';
import turnosRoutes from '../server/routes/turnos.routes';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  server.use(express.json());

  // Servir archivos estáticos del navegador
  server.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false
    })
  );

  // Rutas de API REST
  server.use('/api/auth', authRoutes);
  server.use('/api/aforo', aforoRoutes);
  server.use('/api/turnos', turnosRoutes);

  // Manejador SSR con comodín nombrado compatible
  server.get('/{*path}', (req, res, next) => {
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

  connectDB()
    .then(() => {
      const server = app();
      server.listen(port, () => {
        console.log(`Node Express server listening on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('❌ Error crítico al iniciar MongoDB antes de Express:', err);
    });
}

run();

export const reqHandler = (req: any, res: any, next: any) => {
  const expressApp = app();
  expressApp(req, res, next);
};
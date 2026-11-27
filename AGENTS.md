# FLUMEN — instrucciones para agentes
Producto de gestión hídrica agrícola para Chile. Mantener Angular 21, Express y MongoDB salvo decisión documentada.
- Leer docs/ARCHITECTURE.md, ROADMAP.md, AUDIT.md y DESIGN_SYSTEM.md antes de modificar.
- Trabajar en ramas temáticas; no publicar ni fusionar main sin revisión.
- Nunca incluir secretos, datos personales, .env ni node_modules. Usar variables de entorno y ejemplos ficticios.
- Priorizar autenticación, autorización por propietario, validación de entradas y cálculos del servidor. No confiar en usuarioId enviado por cliente.
- TypeScript estricto, componentes pequeños, lógica de dominio pura, unidades SI explícitas, compatibilidad SSR.
- Conservar modo campo y técnico; no eliminar funciones sin justificar.
- Ejecutar npm ci, npm run build y las pruebas disponibles en entorno aislado; comprobar API con base de pruebas. Reportar comandos, resultados y bloqueos reales.
- No presentar simulaciones o recomendaciones agronómicas como mediciones verificadas. Documentar hipótesis y fuentes.
- Cada PR debe indicar alcance, criterios de aceptación, riesgos, pruebas y migraciones. Actualizar auditoría y roadmap con evidencia.

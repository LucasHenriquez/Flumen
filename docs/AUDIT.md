# Auditoría técnica inicial — 2026-11-27
Alcance: lectura estática parcial del repositorio; sin ejecución, análisis de dependencias ni acceso a BD. Todos los hallazgos abiertos. No incluir valores de secretos.
| ID | Severidad | Evidencia | Acción |
|---|---|---|---|
| SEC-01 | Crítica | server/server.js: configuración sensible con fallback; archivo server/.env versionado | Rotar credenciales y JWT, eliminar fallback y gestionar historial coordinadamente |
| SEC-02 | Crítica | server/server.js: GET/POST/DELETE de cálculos y turnos sin middleware de autenticación | Verificar JWT, filtrar por propietario, probar acceso cruzado |
| SEC-03 | Alta | POST construye RegistroTurno desde req.body | DTO allowlist, identidad del servidor, recálculo |
| SEC-04 | Alta | cors() abierto, login sin limitación explícita | Orígenes permitidos, rate limiting, validación |
| FE-01 | Alta | auth/calculo/turnos usan puerto 3000; aforo usa 4000 y otra clave de token | Configuración e interceptor centralizados |
| FE-02 | Alta | app.routes.ts: dashboard sin guard; localStorage directo en servicios | Guard y almacenamiento SSR seguro |
| FE-03 | Alta | DashboardComponent concentra múltiples dominios y usa any | Extraer lógica y estado tipado |
| DATA-01 | Alta | Agenda inicial con ejemplos; eficiencias fijas | Persistencia y supuestos configurables |
| CAD-01 | Media | Canvas usa escalas visuales independientes | Validar escala geométrica y unidades |
| REPO-01 | Media | server/node_modules versionado; componentes duplicados | Limpiar índice, revisar referencias antes de eliminar |
## Bloqueos
Rotación requiere acceso autorizado a Atlas y configuración de despliegue. No reescribir historial sin coordinación. Revisar archivos restantes, ejecutar pruebas y auditoría de dependencias antes de declarar cierre.

# Arquitectura FLUMEN 2.0
Estado: propuesta, 2026-11-27.
## Actual
Angular standalone con SSR, dashboard que concentra estado, cálculos, CAD, clima, agenda e historial. API Express en server/server.js y modelos Mongoose Usuario y RegistroTurno. Servicios con URLs locales inconsistentes. 
## Objetivo
Frontend: core (auth, configuración, guards, interceptores), layout (shell, navegación), features (overview, predios, CAD, hidráulica, riego, turnos, clima, reportes), domain (modelos y funciones puras), shared (UI).
Backend: config, routes, controllers, middleware, validators, services, models, tests. Separar creación de app de arranque y conexión a BD.
## Contratos
API versionada gradualmente, configuración centralizada, errores uniformes, DTO tipados, identidad derivada de sesión verificada. Compatibilidad temporal con /api/calculos y /api/turnos. Diseñar migración de registros sin propietario; no asignarlos arbitrariamente.
## Dominio
Manning Q=A R^(2/3) sqrt(S)/n; Froude V/sqrt(g A/T); ETc=Kc ET0. Documentar geometría, unidades y límites; validar con casos independientes. Servidor autoritativo para persistencia.
## Verificación
Pruebas unitarias de dominio, integración API con BD aislada, pruebas de acceso cruzado, compilación SSR y pruebas de interfaz. No desplegar hasta superar controles críticos.

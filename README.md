<div align="center">

  <img src="/media/logo-flumen.png" alt="FLUMEN Logo" width="140" />

  # FLUMEN
  ### Sistema de Aforo Hidráulico y Gestión de Turnos de Riego

  Plataforma integral para la optimización hídrica, cubicación de canales abiertos y referencia transparente de pagos agrícolas.

  [![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)

</div>

---

## 📌 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Puesta en Marcha en Local](#-puesta-en-marcha-en-local)
- [Despliegue y Pruebas](#-despliegue-y-pruebas)
- [Equipo y Proyecto de Título](#-equipo-y-proyecto-de-título)

---

## 📖 Descripción General

**FLUMEN** es una plataforma web desarrollada para modernizar la gestión hídrica en canales de regadío y comunidades agrícolas. Resuelve la imprecisión del aforo manual mediante la aplicación de la **Ecuación de Manning-Strickler** y el **Número de Froude**, transformando mediciones de regla en dos respuestas directas:

1. **Tiempo exacto de compuerta abierta:** Horas y minutos calculados según el volumen contratado ($m^3$).
2. **Referencia de cobro transparente:** Liquidación económica estimada ($ CLP) basada en la tarifa comunitaria o municipal.

---

## ⚡ Funcionalidades Principales

* **Cálculo Hidráulico Instantáneo:** Obtención automática de área mojada ($A$), perímetro ($P$), radio hidráulico ($R_h$), velocidad ($V$) y caudal ($Q$).
* **Diagnóstico de Régimen:** Identificación en tiempo real de flujo **Subcrítico** (apto para riego) o **Supercrítico** (riesgo de erosión).
* **Simulador de Turnos con Presets:** Carga en 1 clic de configuraciones prediales (huerto pequeño, frutales y tranques).
* **Calibración Rápida en Terreno:** Ajuste ergonómico de tirante mediante controles de $\pm 5\text{ cm}$.
* **Visualizaciones Técnicas Dinámicas:** Renderizado a escala de la sección transversal (SVG) y curvas de aforo/energía (Canvas).
* **Ventanilla de Cobro de Referencia:** Emisión de resúmenes de pago claros para el regante antes de acudir a la administración.

---

## 🏗 Arquitectura y Stack Tecnológico

El proyecto está diseñado bajo una arquitectura desacoplada en tres capas (Cliente - Servidor - Base de Datos):

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Web** | **Angular** (TypeScript) | Aplicación SPA modular con componentes standalone y diseño reactivo. |
| **Estilos** | **SCSS** | Identidad visual agrícola, variables personalizadas y animaciones optimizadas. |
| **Backend API** | **Node.js + Express.js** | API REST que centraliza la lógica matemática y la seguridad. |
| **Base de Datos** | **MongoDB / Mongoose** | Almacenamiento no relacional flexible para usuarios, predios y turnos. |
| **Hosting Frontend** | **Hostinger** | Servidor de archivos estáticos con configuración `.htaccess`. |

---

## 📂 Estructura del Repositorio

```text
Flumen/
├── public/                 # Recursos multimedia estáticos
│   └── videos/             # Video corporativo en bucle del Hero
├── src/
│   ├── app/
│   │   ├── components/     # Componentes compartidos (Navbar, Footer)
│   │   ├── pages/          # Vistas principales de la aplicación
│   │   │   ├── landing/    # Landing page con simulación en tiempo real
│   │   │   ├── calculator/ # Ventanilla de aforo y cálculo de turnos
│   │   │   ├── login/      # Acceso de usuarios
│   │   │   └── register/   # Creación de cuentas y registro de regantes
│   │   ├── services/       # Conexión HTTP con el Backend
│   │   ├── app.routes.ts   # Definición de rutas
│   │   └── app.config.ts   # Configuración de proveedores (HttpClient, etc.)
│   ├── media/              # Logotipos e isotipos vectoriales
│   └── styles.scss         # Paleta de colores e interfaces globales
├── server/                 # API REST (Node.js, Express, MongoDB)
├── angular.json            # Configuración de compilación de Angular
└── package.json            # Dependencias del proyecto
# GTMXpert - ESES Agency

GTMXpert es un motor impulsado por IA (Gemini 2.5 Pro) diseñado para generar implementaciones y planes de tracking técnicos de Google Tag Manager (GTM) en base a análisis del código HTML de las páginas web de los clientes.

Diseñado con el **ESES UI Protocol** y el **ECC (Event Conflict Checker)** para prevenir duplicidades de eventos y garantizar que todas las implementaciones sigan el estándar ESES (incluyendo la configuración en el paso 0 de Dimensiones Personalizadas GA4).

## Características

- **Scout Agent:** Analiza el HTML de cualquier página para detectar elementos interactivos y puntos de interés (POIs).
- **Consolidación Inteligente:** Evita sugerir eventos repetidos en base al historial completo del cliente.
- **Rules Engine:** Aplica estrictamente las 23 reglas técnicas del estándar ESES v1.0.
- **Exportación Word/Markdown:** Generación directa de la documentación de implementación técnica lista para ser entregada o ejecutada.
- **Tema ESES (Dark/Light Mode):** Diseño estilizado con Tailwind CSS v4 con capacidades completas para contraste Dark Mode y el modo claro clásico de ESES.

## Requisitos Previos

- Node.js (v18+)
- Claves de API (`.env`):
  - `ANTHROPIC_API_KEY` o `GOOGLE_API_KEY` para Gemini 2.5 Pro.
  - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` para la base de datos de historial y clientes.

## Scripts y Uso Local

Instala las dependencias y arranca los servidores (Vite frontend y Express backend) de forma concurrente:

```bash
npm install
npm run dev
```

El panel de usuario correrá de forma predeterminada en `http://localhost:5173`.
La API del motor LLM de Eses correrá en `http://localhost:3000`.

## Despliegue en Vercel

Este proyecto está configurado para ser desplegado fácilmente en Vercel. 

1. Conecta tu repositorio de GitHub a Vercel.
2. Define el **Framework Preset** como `Vite`.
3. Configura las **Variables de Entorno** (`GOOGLE_API_KEY`, `SUPABASE_URL`, etc.).
4. (Opcional) Si separas el backend del frontend, el `server.js` debe subirse o configurarse en entornos como Render/Railway, ya que Vercel ejecutará preferiblemente rutinas de entorno "Serverless Functions" o requiere que configures `api/` a través del `vercel.json`.

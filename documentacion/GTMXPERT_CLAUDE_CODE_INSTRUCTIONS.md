# CLAUDE CODE — INSTRUCCIONES PARA CONSTRUIR GTMXpert
# ════════════════════════════════════════════════════
# Este documento es el briefing completo para construir el motor de GTMXpert.
# Léelo entero antes de escribir una sola línea de código.
# ════════════════════════════════════════════════════

## QUÉ ESTÁS CONSTRUYENDO

GTMXpert es el motor de generación de implementaciones GTM de ESES Agency.

Recibe una descripción de lo que se quiere trackear (en lenguaje natural) más el 
HTML del elemento capturado, y devuelve una implementación completa: variable(s) GTM, 
trigger, etiqueta(s) GA4 + Facebook Pixel, código JavaScript listo para usar, y el 
bloque de documentación para incluir en la guía del cliente.

Lo que construyes ahora es el núcleo — el motor que procesa y genera. La UI, la 
extensión Chrome (TRACKFLOW) y la base de datos vienen después. Aquí te concentras 
en que el output sea correcto y consistente.

---

## ARQUITECTURA DE LO QUE CONSTRUYES HOY

```
[Input del usuario]
      │
      ▼
┌─────────────────┐
│   gtmxpert.js   │  ← El motor principal. Llama a la API del LLM con el
│   (CLI/Node)    │    system prompt y el payload del usuario.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LLM API       │  ← Agnóstico: Claude, GPT-4, Gemini. Configurable via .env
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  JSON output    │────▶│  Renderer Word  │  ← Genera el .docx con el estilo
│  (structured)   │     │  (docx-js)      │    de ESES Agency
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Renderer JSX   │  ← Genera el componente React de auditoría/revisión
│  (React)        │    (el formato del gtm-auditoria.jsx existente)
└─────────────────┘
```

---

## ARCHIVOS QUE TIENES DISPONIBLES — LÉELOS

Antes de escribir código, lee estos archivos. Contienen el conocimiento que el motor 
debe reproducir:

- `GTMXPERT_SYSTEM_PROMPT.md` — El system prompt completo del agente. Este archivo 
  es el cerebro. El motor lo lee y lo pasa al LLM en cada llamada.

- `Etiquetado_Argenta_Corregido.docx` — La guía de referencia. El Word output de 
  GTMXpert debe tener exactamente esta estructura, este nivel de detalle y este tono.

- `gtm-auditoria.jsx` — El componente React de auditoría existente. El JSX output 
  debe seguir este patrón visual: tabs, desplegables, severity badges, código con 
  syntax highlight.

- `TRACKFLOW_GTMXpert_Roadmap.docx` — El roadmap de arquitectura completo. 
  Contexto del proyecto.

---

## ESTRUCTURA DE ARCHIVOS QUE DEBES CREAR

```
gtmxpert/
├── .env.example              ← Variables de entorno (API keys, modelo a usar)
├── package.json
├── README.md                 ← Instrucciones de uso para el equipo ESES
│
├── core/
│   ├── engine.js             ← Motor principal: recibe payload, llama LLM, valida output
│   ├── prompt-loader.js      ← Carga GTMXPERT_SYSTEM_PROMPT.md y lo prepara
│   ├── validator.js          ← Valida que el JSON output cumple el schema
│   └── llm-adapters/
│       ├── claude.js         ← Adaptador para Anthropic API
│       ├── openai.js         ← Adaptador para OpenAI API  
│       └── gemini.js         ← Adaptador para Google Gemini API
│
├── renderers/
│   ├── word-renderer.js      ← Genera el .docx usando docx-js
│   ├── jsx-renderer.js       ← Genera el componente React
│   └── templates/
│       ├── word-styles.js    ← Los estilos, colores y helpers del Word (extraídos de la guía Argenta)
│       └── jsx-template.js   ← La estructura base del componente React
│
├── prompts/
│   └── GTMXPERT_SYSTEM_PROMPT.md  ← El system prompt (cópialo aquí)
│
├── examples/
│   ├── payload-catalogo.json      ← Ejemplo de input: descarga de catálogo
│   ├── payload-formulario.json    ← Ejemplo de input: formulario contacto
│   └── payload-menu.json          ← Ejemplo de input: navegación menú
│
└── cli.js                    ← Entry point: node cli.js --input payload.json --output ./out
```

---

## EL MOTOR (core/engine.js) — COMPORTAMIENTO EXACTO

```javascript
// Pseudocódigo del comportamiento esperado:

async function generateImplementation(payload) {
  // 1. Cargar el system prompt desde el archivo .md
  const systemPrompt = await loadSystemPrompt();
  
  // 2. Validar que el payload tiene los campos mínimos requeridos
  validatePayload(payload);  // lanza error si falta client.name, intent o captured.click_element_html
  
  // 3. Llamar al LLM configurado en .env (LLM_PROVIDER=claude|openai|gemini)
  const rawOutput = await callLLM(systemPrompt, payload);
  
  // 4. Parsear el JSON del output
  const structured = parseOutput(rawOutput);
  
  // 5. Validar que el output tiene el schema correcto
  validateOutput(structured);  // lanza warning (no error) si falta alguna sección
  
  // 6. Devolver el objeto estructurado
  return structured;
}
```

**Importante sobre el paso 4 (parsing):**
El LLM a veces devuelve el JSON envuelto en ```json ... ```. El parser debe ser 
tolerante: extraer el JSON aunque venga con markdown fences, con texto antes o después, 
o con trailing commas. No fallar ante formatos ligeramente imperfectos.

```javascript
function parseOutput(raw) {
  // Intentar parsear directamente
  try { return JSON.parse(raw); } catch(e) {}
  
  // Extraer JSON de dentro de markdown fences
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1]); } catch(e) {}
  }
  
  // Último recurso: buscar el primer { hasta el último }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(raw.substring(start, end + 1)); } catch(e) {}
  }
  
  throw new Error('No se pudo parsear el output del LLM como JSON válido');
}
```

---

## LOS ADAPTADORES LLM — DISEÑO AGNÓSTICO

El motor no sabe qué LLM usa. Eso lo decide el .env. Cada adaptador expone 
la misma interfaz:

```javascript
// Interfaz que todos los adaptadores deben implementar:
async function callLLM(systemPrompt, userPayload) {
  // Devuelve: string con el output raw del modelo
}

// .env.example:
// LLM_PROVIDER=claude          # claude | openai | gemini
// ANTHROPIC_API_KEY=sk-ant-...
// OPENAI_API_KEY=sk-...
// GOOGLE_API_KEY=...
// LLM_MODEL=claude-sonnet-4-6  # el modelo específico dentro del provider
// LLM_MAX_TOKENS=4000
```

**Adaptador Claude (llm-adapters/claude.js):**
```javascript
const Anthropic = require('@anthropic-ai/sdk');

async function callLLM(systemPrompt, userPayload) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const response = await client.messages.create({
    model: process.env.LLM_MODEL || 'claude-sonnet-4-6',
    max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 4000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: JSON.stringify(userPayload, null, 2)
    }]
  });
  
  return response.content[0].text;
}
```

**Adaptador OpenAI (llm-adapters/openai.js):**
```javascript
const OpenAI = require('openai');

async function callLLM(systemPrompt, userPayload) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL || 'gpt-4o',
    max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 4000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPayload, null, 2) }
    ]
  });
  
  return response.choices[0].message.content;
}
```

**Adaptador Gemini (llm-adapters/gemini.js):**
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function callLLM(systemPrompt, userPayload) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.LLM_MODEL || 'gemini-1.5-pro',
    systemInstruction: systemPrompt
  });
  
  const result = await model.generateContent(JSON.stringify(userPayload, null, 2));
  return result.response.text();
}
```

---

## EL RENDERER WORD — ESTILO OBLIGATORIO

El Word output debe seguir exactamente el estilo de la guía Argenta corregida.
Lee `Etiquetado_Argenta_Corregido.docx` antes de implementar este renderer.

**Reglas de estilo que NO son negociables:**

```javascript
// Paleta de colores (extraída de la guía Argenta):
const COLORS = {
  AZUL:        "1F4E79",  // Cabeceras H1 (fondo)
  AZUL_CLARO:  "2E75B6",  // Cabeceras H2, bordes
  AZUL_BG:     "DEEAF1",  // Cajas de nota
  VERDE:       "375623",  // Checklists
  VERDE_BG:    "E2EFDA",
  NARANJA:     "C55A11",  // Warnings
  NARANJA_BG:  "FCE4D6",
  GRIS_BG:     "F2F2F2",  // Filas alternas de tablas
  GRIS_BDR:    "BFBFBF",  // Bordes de tablas
  CODIGO_BG:   "1E1E2E",  // Fondo de bloques de código
  CODIGO_FG:   "A8FF78",  // Texto de código (verde claro)
};

// Estructura de cada sección de evento (en este orden, siempre):
// 1. H1 con fondo AZUL: "PASO N — Nombre de la página · nombre_evento"
// 2. Párrafo de contexto: qué se trackea, tiempo estimado
// 3. H2: "1. Variables" → tabla + código de cada variable
// 4. H2: "2. Trigger" → tabla con configuración
// 5. H2: "3. Etiquetas" → tablas GA4 + Facebook
// 6. H2: "4. Checklist de validación" → tabla con checkboxes
```

**Estructura del Word por sección del JSON output:**

```javascript
// El renderer convierte cada sección del JSON en bloques Word:

// analysis → caja de nota azul al inicio
// variables[] → cada variable: H3 + tabla de configuración + bloque de código oscuro
// trigger → H3 + tabla de condiciones + nota si hay algo especial
// tags[] → cada tag: H3 + tabla de configuración + tabla de parámetros
// custom_html → si required=true: H3 + bloque de código oscuro + nota naranja
// documentation.rationale → párrafo normal de cierre
// documentation.checklist → tabla de checklist con checkboxes (☐)
```

**El código JavaScript SIEMPRE se renderiza en bloque oscuro:**
```javascript
// Cada línea del código es un Paragraph con:
// - fondo: "1E1E2E" (casi negro)
// - fuente: "Courier New"
// - color texto: "A8FF78" (verde claro)
// - sin espaciado entre líneas del bloque
```

---

## EL RENDERER JSX — ESTILO OBLIGATORIO

El JSX output debe seguir el patrón del archivo `gtm-auditoria.jsx` existente.
Lee ese archivo antes de implementar este renderer.

**Lo que el JSX debe reproducir:**

```jsx
// Estructura del componente generado para cada implementación:

function GTMImplementation({ data }) {
  return (
    <div className="...">
      {/* Tab principal con 3 tabs */}
      <Tabs>
        <Tab label="Implementación">
          {/* Para cada elemento del output (variable, trigger, tag): */}
          <ExpandableCard
            title="JS - Catalog Name"
            badge="Variable"
            severity="info"  // info | warning | success
          >
            <ConfigTable rows={[["Tipo", "JavaScript personalizado"], ...]} />
            <CodeBlock language="javascript" code={variable.code} />
          </ExpandableCard>
        </Tab>
        
        <Tab label="Documentación">
          {/* El rationale + checklist */}
          <RationaleBox text={data.documentation.rationale} />
          <ChecklistBox items={data.documentation.checklist} />
        </Tab>
        
        <Tab label="Validación">
          {/* Los warnings del análisis + errores evitados */}
          <WarningsList warnings={data.analysis.warnings} />
          <RulesApplied rules={["R03", "R12", "R21"]} />  {/* las reglas del system prompt que aplicaron */}
        </Tab>
      </Tabs>
    </div>
  );
}
```

**Severity badges:**
- `info` (azul): variables y triggers normales
- `success` (verde): conversiones (generate_lead, file_download)
- `warning` (naranja): custom HTML requerido, advertencias del análisis
- `danger` (rojo): si el análisis detecta que la estrategia de captura es frágil

**El JSX generado debe ser un archivo standalone** que funcione copiado directamente 
en Claude.ai (artifacts) o en cualquier proyecto React con Tailwind. Sin dependencias 
externas excepto React.

---

## EL CLI (cli.js) — INTERFAZ DE USO

```bash
# Uso básico: input desde archivo JSON
node cli.js --input examples/payload-catalogo.json

# Con output a directorio específico
node cli.js --input payload.json --output ./guias/argenta/

# Especificar qué renderers usar
node cli.js --input payload.json --format word    # solo Word
node cli.js --input payload.json --format jsx     # solo JSX
node cli.js --input payload.json --format all     # ambos (default)

# Modo interactivo: el CLI pregunta los campos del payload
node cli.js --interactive

# Ver el JSON output sin renderizar (útil para debug)
node cli.js --input payload.json --dry-run
```

**Modo interactivo — preguntas que debe hacer:**
```
? Nombre del cliente: Argenta Cerámica
? URL del site: argentaceramica.com
? ¿Tiene Facebook Pixel activo? (S/n): S
? Describe qué quieres trackear: Clic en el botón de descarga del catálogo
? Nombre del evento GA4 sugerido [file_download]: 
? Pega el HTML del elemento clickado (Enter vacío para terminar):
  > <a class="listado-catalogos__grid__item__descargas" href="/link.php?...">Descargar</a>
? Pega el HTML del elemento padre (opcional, Enter para saltar):
  > <div class="listado-catalogos__grid__item"><h4>Catálogo General 2025</h4>...</div>
? URL de la página: /descargas/catalogos/
? Notas adicionales para el analista (opcional): 
```

---

## EL VALIDADOR (core/validator.js) — SCHEMA OBLIGATORIO

```javascript
// Schema mínimo que debe cumplir el output del LLM:
const OUTPUT_SCHEMA = {
  required: ['analysis', 'variables', 'trigger', 'tags', 'documentation'],
  analysis: {
    required: ['element_type', 'capture_strategy'],
    optional: ['warnings']
  },
  variables: 'array',  // puede ser [] si no hay variables nuevas
  trigger: {
    required: ['name', 'type', 'conditions']
  },
  tags: {
    required: 'array',  // mínimo 1 tag
    each: {
      required: ['name', 'platform'],
      ga4: { required: ['event_name', 'parameters', 'trigger'] },
      facebook: { required: ['justification'] }  // justification siempre, haya o no tag
    }
  },
  documentation: {
    required: ['rationale', 'checklist']
  }
};

// Si el output no cumple el schema, el validador:
// - Lanza WARNING en consola (no error fatal)
// - Añade una nota visible en el Word y JSX output indicando qué falta
// - NO interrumpe la generación — entrega lo que tiene
```

---

## COMPORTAMIENTO ANTE ERRORES — REGLAS ESTRICTAS

**El motor NUNCA debe:**
- Fallar silenciosamente. Todo error visible en consola con el contexto exacto.
- Reintentar automáticamente al LLM más de 2 veces (cost control).
- Generar output parcial sin advertir que está incompleto.
- Sobrescribir archivos existentes sin confirmación.

**El motor SIEMPRE debe:**
- Guardar el JSON raw del LLM en un archivo `.debug.json` junto al output (para poder debuggear prompts).
- Loggear el tiempo de respuesta del LLM y el número de tokens usados.
- Incluir en el output la versión del system prompt usada (hash del archivo .md).

---

## EL README.md — LO QUE DEBE INCLUIR

El README es lo que el equipo ESES va a leer. Escríbelo como si fuera para alguien 
técnico pero que no conoce el código:

```markdown
# GTMXpert — Motor de etiquetado GTM

## Instalación rápida
## Configuración (.env)
## Cómo generar una implementación
## Cómo añadir un ejemplo al sistema (few-shot)
## Cómo actualizar el system prompt
## Cómo cambiar el LLM
## Solución de problemas comunes
```

---

## EJEMPLOS DE PAYLOAD — CREA ESTOS ARCHIVOS

**examples/payload-catalogo.json** — ya descrito en el system prompt (Ejemplo 1)

**examples/payload-formulario.json:**
```json
{
  "client": {
    "name": "Demo Cliente",
    "url": "cliente.com",
    "has_facebook_pixel": true
  },
  "intent": "Trackear inicio y envío exitoso del formulario de contacto",
  "event_name_suggestion": "generate_lead",
  "analyst_notes": "El formulario está visible desde que carga la página. Mensaje de éxito con clase .wpcf7-mail-sent-ok",
  "captured": {
    "click_element_html": "<form id=\"form_contacto\" class=\"wpcf7-form init\">...</form>",
    "parent_html": "<div class=\"seccion-contacto\"><form id=\"form_contacto\">...</form></div>",
    "click_url": "",
    "page_path": "/contacto/",
    "page_title": "Contacto — Demo Cliente"
  }
}
```

**examples/payload-menu.json:**
```json
{
  "client": {
    "name": "Argenta Cerámica",
    "url": "argentaceramica.com",
    "has_facebook_pixel": true
  },
  "intent": "Trackear clics en el menú principal de navegación, distinguiendo nivel 1 de submenús",
  "event_name_suggestion": "menu_click",
  "analyst_notes": "Hay dos versiones del menú: #menu-principal-es-1 (desktop) y #menu-principal-es-2 (mobile hamburguesa). Solo GA4, sin Facebook.",
  "captured": {
    "click_element_html": "<ul id=\"menu-principal-es-1\" class=\"menu\"><li class=\"menu-item-has-children\"><a href=\"/productos/\">Productos</a><ul class=\"sub-menu\"><li><a href=\"/productos/colecciones/\">Colecciones</a></li></ul></li></ul>",
    "parent_html": "<nav id=\"site-navigation\">...</nav>",
    "click_url": "https://argentaceramica.com/productos/",
    "page_path": "/",
    "page_title": "Argenta Cerámica"
  }
}
```

---

## ORDEN DE IMPLEMENTACIÓN — SIGUE ESTE ORDEN

No empieces por la UI ni por los renderers. El motor debe funcionar primero.

```
Semana 1:
  ☐ 1. package.json con dependencias
  ☐ 2. .env.example
  ☐ 3. core/prompt-loader.js  (leer el .md y devolverlo como string)
  ☐ 4. llm-adapters/claude.js (el primer adaptador)
  ☐ 5. core/engine.js         (llamar al LLM, parsear output)
  ☐ 6. cli.js básico          (--input payload.json --dry-run)

  HITO: `node cli.js --input examples/payload-catalogo.json --dry-run` 
        debe mostrar el JSON output correcto en consola.

Semana 2:
  ☐ 7. core/validator.js
  ☐ 8. llm-adapters/openai.js
  ☐ 9. llm-adapters/gemini.js
  ☐ 10. renderers/word-renderer.js   (leer los estilos de Argenta primero)
  ☐ 11. cli.js completo con --format word

  HITO: `node cli.js --input examples/payload-catalogo.json --format word`
        genera un .docx con el estilo exacto de la guía Argenta.

Semana 3:
  ☐ 12. renderers/jsx-renderer.js    (leer gtm-auditoria.jsx primero)
  ☐ 13. cli.js --interactive
  ☐ 14. README.md completo
  ☐ 15. Tests con los 3 ejemplos de payload

  HITO: El equipo ESES puede usar la herramienta para un cliente real
        sin ayuda del desarrollador.
```

---

## CRITERIOS DE CALIDAD DEL OUTPUT — CÓMO SABER QUE ESTÁ BIEN

Para cada implementación generada, verifica mentalmente estas preguntas:

**Sobre el código JavaScript generado:**
- ¿Usa `indexOf()` en lugar de `.includes()`? → si no, el system prompt no está aplicando R02
- ¿Hay algún regex? → si hay, el system prompt no está aplicando R01
- ¿Todos los `closest()` tienen null-check? → R06
- ¿La variable de begin_form usa listener de focus y no Element Visibility? → R12

**Sobre las etiquetas:**
- ¿`begin_form` usa `InitiateCheckout` en Facebook y no `Lead`? → R21
- ¿Los eventos de menú y navegación NO tienen etiqueta Facebook? → R23
- ¿Cada etiqueta Facebook sin implementar tiene `justification` explicando por qué? → R19

**Sobre el Word:**
- ¿El bloque de código es sobre fondo oscuro (#1E1E2E) con texto verde (#A8FF78)?
- ¿Las tablas tienen filas alternas en gris?
- ¿El checklist tiene checkboxes (☐) reales, no guiones?
- ¿El orden es siempre: Variables → Trigger → Etiquetas → Checklist?

**Sobre el JSX:**
- ¿Funciona standalone copiado en Claude.ai artifacts?
- ¿Los desplegables tienen severity badges correctos?
- ¿El código tiene syntax highlight (fondo oscuro, texto de colores)?
- ¿El tab de Validación muestra las reglas que aplicaron (R01, R12, etc.)?

---

## CONTEXTO DEL PROYECTO — LEE ESTO PARA ENTENDER EL NEGOCIO

ESES Agency produce guías de etiquetado GTM para clientes. Cada guía documenta 
entre 5 y 25 eventos de tracking para el site del cliente, con el código GTM 
exacto, la justificación estratégica y el checklist de validación.

Hasta ahora este proceso es 100% manual: el analista revisa el HTML del site, 
decide qué trackear, escribe el código, redacta la documentación. GTMXpert 
automatiza la parte técnica manteniendo el criterio humano donde importa.

El output de GTMXpert no reemplaza al analista — le ahorra 2-3 horas de trabajo 
mecánico por evento, y le garantiza que el código sigue el estándar técnico correcto.

El system prompt (GTMXPERT_SYSTEM_PROMPT.md) contiene:
- 23 reglas técnicas derivadas de auditar implementaciones reales
- 3 ejemplos completos de input → output correcto
- La lista de los 10 errores más frecuentes a evitar

**Ese archivo es el conocimiento propietario de ESES Agency. No lo modifiques 
sin revisión del equipo ESES. Cualquier cambio en el system prompt cambia el 
comportamiento de todas las implementaciones futuras.**

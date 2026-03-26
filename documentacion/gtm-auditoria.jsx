import { useState } from "react";

const auditData = {
  meta: {
    cliente: "Argenta Cerámica",
    guia: "Etiquetado_Argenta.docx",
    objetivo: "Convertir la guía en estándar ESES Agency",
    estado: "Auditoría completa — PASOS 0 al 7"
  },
  reglas: [
    { id: "R01", categoria: "Técnica", regla: "❌ No usar regex", razon: "Resultados inconsistentes y difícil mantenimiento. Usar indexOf() + substring() o startsWith() siempre." },
    { id: "R02", categoria: "Técnica", regla: "❌ No usar .includes() — usar indexOf() !== -1", razon: "String.includes() no está en IE. Usar indexOf() para cobertura universal y consistencia de equipo." },
    { id: "R03", categoria: "Técnica", regla: "❌ No usar CSS selectors como método principal de captura de datos en variables", razon: "Fallan con contenido dinámico y clicks en elementos hijos. Navegar el DOM desde {{Click Element}} con closest() y querySelector()." },
    { id: "R04", categoria: "Técnica", regla: "✅ Cuando JS intercepta el clic antes que GTM, usar Custom HTML con addEventListener en fase de captura (true)", razon: "Única forma fiable de adelantarse a onclick handlers en contenido dinámico." },
    { id: "R05", categoria: "Técnica", regla: "✅ Normalizar texto siempre con .trim(). Definir convención de mayúsculas/minúsculas por tipo de dato y mantenerla", razon: "Valores inconsistentes (AQUA / Aqua / aqua) rompen audiencias y segmentos." },
    { id: "R06", categoria: "Técnica", regla: "✅ Cuando un valor no existe en el DOM, documentar la lógica de inferencia explícitamente con indexOf()", razon: "Nunca describir una variable como 'se extrae del HTML' si hay lógica condicional detrás." },
    { id: "R07", categoria: "Técnica", regla: "✅ Detectar PDFs en URLs con indexOf('.pdf') !== -1, no con endsWith('.pdf')", razon: "Las URLs intermediarias tipo link.php?link=...pdf no terminan en .pdf, pero sí lo contienen." },
    { id: "R08", categoria: "Estructura GTM", regla: "✅ Siempre documentar en orden: Variable → Trigger → Etiqueta", razon: "Una implementación incompleta en cualquiera de las 3 partes invalida el evento completo." },
    { id: "R09", categoria: "Estructura GTM", regla: "✅ Nombrar con prefijo de tipo: JS - / DLV - / C - (Constante)", razon: "Permite identificar el tipo de variable sin abrirla. Consistencia obligatoria en todo el equipo." },
    { id: "R10", categoria: "Estructura GTM", regla: "✅ El parámetro link_domain no debe ser {{Click URL}} — extraer solo el dominio", razon: "Asignar la URL completa a link_domain hace inútil el parámetro. Extraer solo el hostname con window.location.hostname o parseando la URL." },
    { id: "R11", categoria: "Formularios", regla: "✅ Detectar submit exitoso via Visibilidad de elemento del mensaje de éxito, nunca via Form Submit nativo de GTM", razon: "Formularios con validación JS o AJAX no disparan el evento submit nativo de GTM." },
    { id: "R12", categoria: "Formularios", regla: "⚠️ Todo trigger de Visibilidad de elemento requiere condición Page Path como salvaguarda obligatoria", razon: "Sin Page Path, el trigger puede dispararse en otras páginas si el selector CSS coincide con un elemento global." },
    { id: "R13", categoria: "Formularios", regla: "✅ Para begin_form usar listener de focus en el primer campo, no Visibilidad de elemento", razon: "Si el formulario está visible al cargar la página, Element Visibility dispara inmediatamente sin interacción." },
    { id: "R14", categoria: "Formularios", regla: "⚠️ Variables 'universales' que leen múltiples selectores del mismo campo deben documentarse y actualizarse cuando se añade un nuevo formulario", razon: "Sin esta actualización, el nuevo formulario no captura ese dato aunque el evento se dispare correctamente." },
    { id: "R15", categoria: "GA4", regla: "✅ PASO 0 obligatorio: dimensiones GA4 creadas ANTES de publicar cualquier tag", razon: "Sin dimensiones creadas, los parámetros llegan a GA4 pero se descartan para siempre. Los datos perdidos son irrecuperables." },
    { id: "R16", categoria: "GA4", regla: "✅ Dimensiones user-scoped solo con lógica GTM explícita y documentada que controla cuándo se actualiza el valor", razon: "GA4 guarda el ÚLTIMO valor recibido, no el más frecuente. Sin lógica controlada, los datos son inútiles." },
    { id: "R17", categoria: "GA4", regla: "✅ Antes de crear una dimensión, verificar si GA4 ya la captura nativamente", razon: "Evitar duplicar datos que GA4 ya analiza (ej: flujos de navegación en Exploración → Recorrido del usuario)." },
    { id: "R18", categoria: "GA4", regla: "✅ Organizar dimensiones en 3 niveles: Core / Por módulo / Avanzadas", razon: "Permite priorizar sin agotar el límite de 50. Las dimensiones eliminadas siguen contando contra el límite." },
    { id: "R19", categoria: "GA4", regla: "⚠️ Límite real GA4: 50 event-scoped por propiedad. Las dimensiones eliminadas NO liberan espacio.", razon: "Conservador por defecto: crear dimensión solo si se usará en informes o audiencias en los próximos 3 meses." },
    { id: "R20", categoria: "GA4", regla: "✅ Variable language es transversal — una sola JS variable reutilizada en todos los tags", razon: "No replicar la misma lógica en cada tag. Detectar prefijo de idioma en la URL una sola vez." },
    { id: "R21", categoria: "GA4", regla: "⚠️ select_item y select_promotion son eventos Enhanced Ecommerce — requieren estructura items[] o parámetros específicos, no parámetros planos arbitrarios", razon: "Usarlos con parámetros incorrectos no genera error pero tampoco aparece en informes de e-commerce/promociones de GA4." },
    { id: "R22", categoria: "GA4", regla: "✅ El Hero Slider View con Visibilidad de elemento se dispara en cada pageview si el elemento es visible al cargar — añadir condición Page Path = /", razon: "Sin limitar a la homepage, el trigger puede dispararse erróneamente si el selector existe en otras páginas." },
    { id: "R23", categoria: "Facebook", regla: "✅ Cada evento implementado = etiqueta GA4 + etiqueta Facebook, o justificación explícita documentada de por qué no", razon: "El tracking paralelo es un principio no negociable del estándar ESES. La ausencia debe estar justificada." },
    { id: "R24", categoria: "Facebook", regla: "✅ Para begin_form en Facebook: usar InitiateCheckout, no Lead", razon: "Lead en begin_form y en generate_lead suman juntos en Ads Manager. Sin diferenciación no se puede calcular Form Abandonment Rate." },
    { id: "R25", categoria: "Facebook", regla: "✅ Para audiencias de exclusión, añadir parámetro diferenciador (ej: user_intent: 'candidate') en el evento", razon: "Sin este parámetro no se puede crear la audiencia negativa para excluir candidatos de campañas comerciales." },
    { id: "R26", categoria: "Facebook", regla: "❌ No enviar datos de contacto reales (teléfono) en Object Properties de eventos Facebook", razon: "Datos de contacto en parámetros de eventos pueden tener implicaciones de privacidad. Usar tipo de contacto, no el dato en sí." },
    { id: "R27", categoria: "Facebook", regla: "❌ No trackear clics de navegación interna, RRSS ni iconos home con Facebook Pixel", razon: "Saturan el Pixel con eventos de bajo valor que degradan la optimización. Solo eventos con valor comercial directo." },
  ],
  pasos: [
    {
      id: "PASO 0", titulo: "Dimensiones Personalizadas GA4", estado: "revisado",
      errores: [
        { id: "P0-E1", severidad: "critico", titulo: "GA4 no calcula el valor 'más frecuente' en dimensiones user-scoped", descripcion: "La guía dice que primary_serie_interest y preferred_effect son automáticas. GA4 guarda el ÚLTIMO valor, no el más frecuente.", detalle: "Si envías serie_name='AQUA' 3 veces y luego 'ARCADIA' 1 vez, la dimensión queda como 'ARCADIA'. Los datos son estructuralmente incorrectos desde el día 1.", correccion: "Dimensiones user-scoped solo si existe lógica GTM explícita que controla cuándo y qué valor se escribe. Si esa lógica no existe, eliminar la dimensión.", reglaAsociada: "R16" },
        { id: "P0-E2", severidad: "critico", titulo: "user_journey_path no debería existir — GA4 ya analiza esto nativamente", descripcion: "La guía crea una dimensión para la ruta de navegación del usuario. GA4 tiene esta funcionalidad nativa.", detalle: "La variable se sobreescribiría en cada pageview perdiendo el histórico. Sin backend propio, construir esto desde GTM es un antipatrón sin valor práctico.", correccion: "Eliminar esta dimensión. Usar Exploración → Recorrido del usuario en GA4 nativamente.", reglaAsociada: "R17" },
        { id: "P0-E3", severidad: "medio", titulo: "submenu_nosotros y submenu_descargas deberían ser una sola dimensión submenu_item", descripcion: "Una dimensión por sección de menú no escala y consume el límite de 50 innecesariamente.", detalle: "Con este patrón, 5 secciones con submenú = 5 dimensiones haciendo exactamente lo mismo.", correccion: "Una sola dimensión submenu_item. Combinada con menu_section ya existente da la misma información. Ahorro mínimo de 1 dimensión del límite.", reglaAsociada: "R18" },
        { id: "P0-E4", severidad: "medio", titulo: "No se distingue entre dimensiones obligatorias y opcionales", descripcion: "Las 20 dimensiones se presentan como bloque monolítico sin prioridad ni prerequisitos claros.", detalle: "Se pueden crear dimensiones para módulos que nunca se implementen, agotando el límite de 50.", correccion: "Reorganizar en 3 niveles: CORE (siempre) / POR MÓDULO (solo si se implementa ese paso) / AVANZADAS (si hay estrategia definida).", reglaAsociada: "R18" },
        { id: "P0-E5", severidad: "aviso", titulo: "El límite de 50 se presenta como 'tenemos margen' sin mencionar que las eliminadas siguen contando", descripcion: "La guía omite que dimensiones eliminadas no liberan espacio del límite de 50.", detalle: "Una propiedad GA4 con proyectos previos puede alcanzar el límite inesperadamente.", correccion: "Añadir PASO 0.0: auditar dimensiones existentes antes de crear nuevas. Documentar cuántas hay y cuántas quedan.", reglaAsociada: "R19" },
      ]
    },
    {
      id: "PASO 1", titulo: "Página /descargas/catalogos/ — evento file_download", estado: "revisado",
      errores: [
        { id: "P1-E1", severidad: "critico", titulo: "Variable catalog_name extrae de la URL incorrecta (link.php)", descripcion: "Los enlaces de descarga usan URL intermediaria. {{Click URL}} no contiene el nombre del catálogo.", detalle: "La URL en el momento del clic es 'argentaceramica.com/link.php?link=...'. Cualquier extracción desde esta URL falla.", correccion: "Extraer desde el <h4> del item padre:\n\nvar el = {{Click Element}};\nvar item = el.closest('.listado-catalogos__grid__item');\nvar h4 = item ? item.querySelector('h4') : null;\nreturn h4 ? h4.textContent.trim() : 'unknown';", reglaAsociada: "R03" },
        { id: "P1-E2", severidad: "critico", titulo: "catalog_category no existe en el DOM — lógica de inferencia no documentada", descripcion: "La guía asume que catalog_category se puede capturar del HTML. No existe ningún atributo que la indique.", detalle: "Todos los items tienen estructura HTML idéntica. Solo el <h4> varía. La categoría hay que inferirla del nombre.", correccion: "Inferir con indexOf() (sin regex):\n\nvar n = /* texto del h4 */;\nif (n.indexOf('Novelties') !== -1) return 'novelties';\nif (n.indexOf('Artech') !== -1 || n.indexOf('ARTECH') !== -1) return 'collection';\nif (n.indexOf('MAX') !== -1 || n.indexOf('EXTREM') !== -1) return 'collection';\nif (n.indexOf('Manual') !== -1) return 'technical';\nreturn 'general';", reglaAsociada: "R06" },
        { id: "P1-E3", severidad: "medio", titulo: "Segunda condición del trigger 'a[download]' falla cuando el clic es en un hijo del enlace", descripcion: "Si el usuario hace clic en el icono SVG o en el texto dentro del <a download>, el Click Element es el hijo y el selector no lo matchea.", detalle: "El trigger se construye con AND obligatorio, por lo que si esta condición falla, el evento no se dispara aunque el click sea correcto.", correccion: "Eliminar la condición del selector CSS a[download]. Con solo 'Click Classes contiene listado-catalogos__grid__item__descargas' es suficiente.", reglaAsociada: "R03" },
        { id: "P1-E4", severidad: "medio", titulo: "Variable language no documentada para el contexto multiidioma del site", descripcion: "La dimensión language aparece en parámetros pero no se documenta cómo capturarla.", detalle: "Argenta tiene 3 versiones: /descargas/ (ES), /en/downloads/ (EN), /fr/telechargement/ (FR).", correccion: "Variable JS global (crear en PASO 0, reutilizar en todos los tags):\n\nfunction() {\n  var path = window.location.pathname;\n  if (path.indexOf('/en/') === 0) return 'en';\n  if (path.indexOf('/fr/') === 0) return 'fr';\n  return 'es';\n}", reglaAsociada: "R20" },
      ]
    },
    {
      id: "PASO 2", titulo: "Formularios del menú lateral (begin_form, generate_lead, user_login, search)", estado: "revisado",
      errores: [
        { id: "P2-E1", severidad: "critico", titulo: "Trigger begin_form usa Visibilidad de elemento — detecta carga de página, no interacción del usuario", descripcion: "La guía configura Form Start como 'Visibilidad de elemento' en el campo nombre. Dispara al cargar la página si el formulario es visible.", detalle: "Cada visita a una página con el formulario visible genera un begin_form falso, aunque el usuario no haya tocado nada.", correccion: "Custom HTML con listener de focus en el primer campo:\n\ndocument.querySelector('#frmregistro').addEventListener('focus', function handler(e) {\n  window.dataLayer.push({event: 'form_start_registration'});\n  this.removeEventListener('focus', handler, true);\n}, true);", reglaAsociada: "R13" },
        { id: "P2-E2", severidad: "critico", titulo: "Trigger Registration Success (Visibilidad de .ultimo_paso_registro) sin condición Page Path", descripcion: "El trigger de envío exitoso no tiene condición de URL. Cualquier página que incluya ese selector dispara el evento.", detalle: "Es una vulnerabilidad ante actualizaciones del site que pueden generar falsos leads sin ningún error visible.", correccion: "Añadir condición obligatoria:\n- Page Path no contiene /trabaja-con-nosotros/\n\nRegla estándar: todo trigger de Visibilidad de elemento lleva Page Path como salvaguarda.", reglaAsociada: "R12" },
        { id: "P2-E3", severidad: "critico", titulo: "Trigger User Login Success detecta un icono SVG por nombre de archivo — extremadamente frágil", descripcion: "El trigger detecta el login cuando aparece img[src*='Login_check']. Cualquier cambio en el nombre del archivo rompe el tracking silenciosamente.", detalle: "Un rediseño del menú o una optimización de assets invalida completamente el tracking de login sin ningún error visible.", correccion: "Alternativa más robusta: Custom HTML que wrappea la función acciones_formulario_acceso_login() original para detectar su ejecución exitosa:\n\nvar original = window.acciones_formulario_acceso_login;\nwindow.acciones_formulario_acceso_login = function() {\n  original.apply(this, arguments);\n  // Listener MutationObserver sobre el DOM del menú\n};", reglaAsociada: "R11" },
        { id: "P2-E4", severidad: "critico", titulo: "Variable JS - Newsletter Consent busca '#recibir_news' pero ese campo no existe en el HTML real del registro", descripcion: "La variable busca '#recibir_news' en el formulario de registro, pero el HTML real de #frmregistro no tiene ese campo.", detalle: "El formulario de registro tiene: nombre, apellidos, email, empresa, pais, provincia. No hay checkbox de newsletter. La variable devuelve siempre 'no' para todos los registros.", correccion: "Verificar en el HTML real si el formulario de registro tiene checkbox de newsletter antes de crear la variable. Si no existe, newsletter_consent no aplica a este formulario y no debe incluirse en sus parámetros.", reglaAsociada: "R14" },
        { id: "P2-E5", severidad: "medio", titulo: "JS - Search Location se crea como constante 'menu' en PASO 2 y se reemplaza en PASO 3 — flujo de actualización no advertido", descripcion: "En PASO 2 se crea como constante. En PASO 3 hay que eliminarla y crear una variable JS distinta.", detalle: "Un implementador que siga el PASO 2 crea la constante y al llegar al PASO 3 la tiene que reemplazar, con riesgo de romper el PASO 2 si no se hace correctamente.", correccion: "Crear como variable JS desde el principio en PASO 2:\n\nfunction() {\n  var path = window.location.pathname;\n  if (path.indexOf('/productos/') !== -1) return 'productos';\n  return 'menu';\n}", reglaAsociada: "R08" },
        { id: "P2-E6", severidad: "medio", titulo: "begin_form en Facebook usa evento Lead igual que generate_lead — imposible separar en Ads Manager", descripcion: "La guía envía Lead de Facebook tanto en begin_form como en generate_lead.", detalle: "En informes de Facebook Ads los dos eventos Lead suman juntos. No hay forma de calcular Form Abandonment Rate.", correccion: "Para begin_form en Facebook: usar InitiateCheckout (no Lead).\nPermite calcular: Lead - InitiateCheckout = abandonos del formulario.", reglaAsociada: "R24" },
      ]
    },
    {
      id: "PASO 3", titulo: "Página /productos/ (slider colecciones, panel filtros, búsqueda)", estado: "revisado",
      errores: [
        { id: "P3-E1", severidad: "critico", titulo: "Variable JS - Collection Name from Slider usa .includes() — viola el estándar", descripcion: "El código usa classes.includes('coleccion_extrem'). El estándar ESES prohíbe includes() en favor de indexOf().", detalle: "String.prototype.includes() no está en IE. Crea inconsistencia con el resto de variables que usan indexOf().", correccion: "Reemplazar:\n// ❌ classes.includes('coleccion_extrem')\n// ✅ classes.indexOf('coleccion_extrem') !== -1", reglaAsociada: "R02" },
        { id: "P3-E2", severidad: "critico", titulo: "Fallback del slider usa regex onclick.match(/cargar_series\\('([^']+)'\\)/) — viola el estándar", descripcion: "La variable tiene un fallback que extrae el nombre de la colección usando regex sobre el atributo onclick.", detalle: "Cualquier cambio de espacios, comillas o nombre de función invalida silenciosamente el fallback.", correccion: "Sustituir por indexOf() + substring():\n\nvar marker = \"cargar_series('\";\nvar start = onclick.indexOf(marker);\nif (start === -1) return undefined;\nstart += marker.length;\nvar end = onclick.indexOf(\"')\", start);\nif (end === -1) return undefined;\nreturn onclick.substring(start, end).toUpperCase();", reglaAsociada: "R01" },
        { id: "P3-E3", severidad: "critico", titulo: "select_item en GA4 con parámetros planos — no es el esquema correcto del evento", descripcion: "La guía envía item_name e item_category como parámetros planos en select_item. Este evento requiere array items[].", detalle: "Funciona técnicamente pero los datos no aparecen en los informes de e-commerce de GA4.", correccion: "Opción 1 (recomendada): Usar custom event 'filter_applied' con parámetros planos filter_name, filter_type.\n\nOpción 2: Si se quiere select_item correcto:\nitems: [{ item_name: '{{DLV - Filter Name}}', item_category: '{{DLV - Filter Type}}' }]", reglaAsociada: "R21" },
        { id: "P3-E4", severidad: "medio", titulo: "Trigger Click - Collection Slider depende de Click URL contains 'productos/#' — frágil ante cambios de URL", descripcion: "El trigger tiene 3 condiciones incluyendo Click URL que contiene 'productos/#'. Si cambia la estructura de URLs, el trigger falla.", detalle: "La clase del elemento (.item_producto) es suficiente para identificar el slider sin depender de la URL.", correccion: "Simplificar a 2 condiciones:\n1. Page Path contiene /productos/\n2. Click Classes contiene item_producto\n\nEliminar la condición de Click URL.", reglaAsociada: "R03" },
        { id: "P3-E5", severidad: "aviso", titulo: "Custom HTML Filter Listener no tiene null-check para closest() en browsers sin soporte", descripcion: "El listener usa target.closest('.checkbox') sin verificar si closest() está disponible.", detalle: "closest() no está en IE. El null-check explícito es buena práctica ausente en la guía.", correccion: "var checkboxParent = target.closest ? target.closest('.checkbox') : null;\nif (checkboxParent) { ... }", reglaAsociada: "R04" },
      ]
    },
    {
      id: "PASO 4", titulo: "Página /contacto/ (begin_form, generate_lead, clic teléfono)", estado: "revisado",
      errores: [
        { id: "P4-E1", severidad: "critico", titulo: "Trigger begin_form usa Visibilidad de elemento — mismo error que PASO 2", descripcion: "En /contacto/ el formulario está visible desde la carga. El trigger dispara en cada visita a la página.", detalle: "Cada usuario que visita /contacto/ genera un begin_form falso aunque no haya tocado ningún campo.", correccion: "Custom HTML con listener de focus:\n\ndocument.querySelector('#form_contacto').addEventListener('focus', function handler(e) {\n  window.dataLayer.push({event: 'form_start_contact'});\n  this.removeEventListener('focus', handler, true);\n}, true);", reglaAsociada: "R13" },
        { id: "P4-E2", severidad: "critico", titulo: "Variable JS - Form Provincia 'universal' puede leer el formulario equivocado si hay dos en la misma página", descripcion: "La variable busca #provincia, luego #provincia_bim, luego select[name='provincia'] sin validar qué formulario está activo.", detalle: "Si el menú lateral (con #provincia del registro) está renderizado en /contacto/, puede leer la provincia del formulario incorrecto.", correccion: "Variables separadas por formulario (JS - Form Provincia Registro / JS - Form Provincia Contacto)\nO variable universal con validación del contexto activo antes de leer el valor.", reglaAsociada: "R14" },
        { id: "P4-E3", severidad: "medio", titulo: "Número de teléfono real hardcodeado en Object Properties de Facebook", descripcion: "La guía propone enviar phone_number: '+34964324003' como parámetro en el evento Facebook Contact.", detalle: "Datos de contacto reales en parámetros de eventos Facebook pueden tener implicaciones de privacidad. Además si el teléfono cambia hay que actualizar GTM.", correccion: "No enviar el número de teléfono en parámetros:\ncontent_type: 'phone_contact'\ncontact_method: 'phone'\n\nSi se necesita el número, usar una variable C - Phone Number como constante GTM actualizable.", reglaAsociada: "R26" },
        { id: "P4-E4", severidad: "medio", titulo: "Integración Mailchimp via Zapier mezclada en el documento GTM — dominios técnicos diferentes", descripcion: "La guía mezcla implementación GTM con configuración de Zapier y Mailchimp en el mismo documento.", detalle: "El fetch() al webhook de Zapier desde GTM expone la URL del webhook en el frontend. Cualquiera puede enviar datos falsos al Zap.", correccion: "Separar en documentos independientes:\n- PASO 4 GTM: solo tracking de eventos del formulario\n- PASO 4B: integración Mailchimp (Zapier/Make)\n\nEn el Zap: añadir validación de origen para no aceptar datos de fuentes no esperadas.", reglaAsociada: "R08" },
      ]
    },
    {
      id: "PASO 5", titulo: "Menú principal de navegación (click navegación)", estado: "revisado",
      errores: [
        { id: "P5-E1", severidad: "critico", titulo: "Trigger usa CSS selector '#menu-principal-es-1 a' como condición única — viola el estándar", descripcion: "El trigger usa 'Click Element matches CSS selector #menu-principal-es-1 a, #menu-principal-es-2 a' como condición principal.", detalle: "Además matchea TODOS los links del menú incluyendo externos y PDFs que pueden requerir tratamiento diferente.", correccion: "Custom HTML con listener en los contenedores de menú:\n\n['menu-principal-es-1','menu-principal-es-2'].forEach(function(id) {\n  var menu = document.getElementById(id);\n  if (!menu) return;\n  menu.addEventListener('click', function(e) {\n    var link = e.target.closest ? e.target.closest('a') : null;\n    if (!link) return;\n    window.dataLayer.push({event:'menu_click', linkText: link.textContent.trim(), linkUrl: link.href});\n  });\n});", reglaAsociada: "R03" },
        { id: "P5-E2", severidad: "critico", titulo: "Variable JS - Menu Section falla cuando el clic es en un elemento hijo del link", descripcion: "La lógica usa 'clickElement.parentElement === parentLi' para distinguir padre vs hijo. Falla si hay elementos intermedios.", detalle: "Si el usuario hace clic en un span o img dentro del link del menú, clickElement.parentElement es el <a>, no el <li>.", correccion: "Simplificar con closest():\n\nvar link = el.tagName === 'A' ? el : (el.closest ? el.closest('a') : null);\nif (!link) return undefined;\nif (!link.closest('#menu-principal-es-1, #menu-principal-es-2')) return undefined;\nvar subMenu = link.closest ? link.closest('.sub-menu') : null;\nif (subMenu) {\n  var parentLi = subMenu.closest('li.menu-item-has-children');\n  var parentLink = parentLi ? parentLi.querySelector(':scope > a') : null;\n  return parentLink ? parentLink.textContent.trim() : undefined;\n}\nreturn link.textContent.trim();", reglaAsociada: "R08" },
        { id: "P5-E3", severidad: "medio", titulo: "Ausencia de etiqueta Facebook no está justificada explícitamente en la guía", descripcion: "La guía solo documenta etiqueta GA4 para el menú. Sin justificación, el implementador puede asumir que se olvidó incluirla.", detalle: "Si alguien añade Facebook Pixel para clics de menú, satura el Pixel con eventos de bajo valor que degradan la optimización de campañas.", correccion: "Añadir nota explícita en la guía:\n'Sin etiqueta Facebook Pixel. Los clics de navegación interna no representan señales de conversión para el algoritmo de Facebook. El Pixel solo debe recibir eventos con valor comercial demostrable.'", reglaAsociada: "R27" },
        { id: "P5-E4", severidad: "aviso", titulo: "Variable JS - Menu Item Type detecta PDFs con endsWith('.pdf') — no funciona con URLs de link.php", descripcion: "La detección de PDFs con clickUrl.endsWith('.pdf') no funciona con URLs intermediarias tipo link.php.", detalle: "El Packing List del submenú Descargas se sirve via link.php. La URL no termina en .pdf.", correccion: "var isPdf = clickUrl.indexOf('.pdf') !== -1;", reglaAsociada: "R07" },
      ]
    },
    {
      id: "PASO 6", titulo: "Redes sociales y enlaces externos (click RRSS, click external links)", estado: "revisado",
      errores: [
        { id: "P6-E1", severidad: "critico", titulo: "Variable JS - Social Network usa .includes() — viola el estándar en todos sus if-blocks", descripcion: "Toda la variable usa clickUrl.includes('facebook.com'), .includes('instagram.com'), etc. en lugar de indexOf().", detalle: "Este es el mismo error que PASO 3, pero aquí afecta a todas las ramas de la función, no solo a algunas.", correccion: "Reemplazar todos los .includes() por indexOf() !== -1:\n\n// ❌ Actual\nif (clickUrl.includes('facebook.com')) return 'Facebook';\n\n// ✅ Correcto\nif (clickUrl.indexOf('facebook.com') !== -1) return 'Facebook';\n\nAplicar a todas las redes sociales en la función.", reglaAsociada: "R02" },
        { id: "P6-E2", severidad: "critico", titulo: "Variable JS - External Link Type usa .includes() y endsWith('.pdf') — doble violación del estándar", descripcion: "La variable usa clickUrl.includes() para detectar dominios externos y clickUrl.endsWith('.pdf') para detectar PDFs.", detalle: "El endsWith('.pdf') no funciona con URLs intermediarias tipo link.php?link=...pdf (como el Packing List del menú).", correccion: "Reemplazar:\n// Dominios: .includes() → .indexOf() !== -1\n// PDFs: .endsWith('.pdf') → .indexOf('.pdf') !== -1\n\nif (clickUrl.indexOf('.pdf') !== -1) return 'pdf_external';\nif (clickUrl.indexOf('wolterskluwer') !== -1 || clickUrl.indexOf('portalempleado') !== -1) return 'employee_portal';\n// etc.", reglaAsociada: "R02, R07" },
        { id: "P6-E3", severidad: "critico", titulo: "Trigger Click - External Links usa regex: Click URL matches regex ^https?:// — viola el estándar", descripcion: "La segunda condición del trigger de enlaces externos usa regex ^https?:// para verificar que la URL es externa.", detalle: "El regex es innecesario aquí: si Click URL does NOT contain 'argentaceramica.com' ya sabemos que es externo. El regex añade complejidad sin añadir precisión.", correccion: "Eliminar la condición con regex. El trigger queda con:\n1. Click URL does NOT contain argentaceramica.com\n2. Y Click URL does NOT contain facebook.com\n3. Y Click URL does NOT contain instagram.com\n4. Y Click URL does NOT contain linkedin.com\n\nSuficiente para distinguir enlaces externos no-RRSS.", reglaAsociada: "R01" },
        { id: "P6-E4", severidad: "medio", titulo: "Parámetro link_domain en etiqueta GA4 recibe {{Click URL}} completo — no solo el dominio", descripcion: "La guía documenta 'link_domain: {{Click URL}} (extraer dominio)' con un comentario entre paréntesis, pero no implementa la extracción.", detalle: "Si link_domain recibe la URL completa (https://www.facebook.com/ArgentaCeramica), el parámetro es inútil para agrupar clics por dominio.", correccion: "Crear variable JS - Click Domain que extrae solo el hostname:\n\nfunction() {\n  try {\n    var url = {{Click URL}};\n    if (!url) return undefined;\n    // Extraer dominio sin www.\n    var match = url.indexOf('://');\n    if (match === -1) return undefined;\n    var domain = url.substring(match + 3);\n    var slash = domain.indexOf('/');\n    if (slash !== -1) domain = domain.substring(0, slash);\n    return domain.replace(/^www\\./, '');\n  } catch(e) { return undefined; }\n}", reglaAsociada: "R10" },
        { id: "P6-E5", severidad: "medio", titulo: "Variable JS - Social Click Location usa .closest('.menuopen-principal') — selector CSS frágil como método principal", descripcion: "La variable detecta si el clic es en el menú buscando .menuopen-principal con closest(). Si el desarrollador cambia ese nombre de clase, la variable devuelve siempre 'other'.", detalle: "Además el orden de comprobación importa: si la función devuelve 'footer' antes de comprobar 'menu', y un elemento está en ambos contextos (no debería, pero podría), el resultado sería incorrecto.", correccion: "Usar un selector más estable como el ID del contenedor del menú que ya usamos en PASO 5:\n\nvar isMenu = clickElement.closest('#menu-principal-es-1') !== null ||\n             clickElement.closest('#menu-principal-es-2') !== null;\nif (isMenu) return 'menu';\n\nMás robusto que depender del nombre de clase del estado abierto del menú.", reglaAsociada: "R03" },
      ]
    },
    {
      id: "PASO 7", titulo: "Página Home — Hero Slider, Iconos de acceso rápido, Slider inferior", estado: "revisado",
      errores: [
        { id: "P7-E1", severidad: "critico", titulo: "Trigger Hero Slider - View (Visibilidad de elemento) sin condición Page Path = '/'", descripcion: "El trigger detecta visibilidad de #rev_slider_40_1 sin restringirse a la homepage. Si ese ID existe en otra página, disparará erróneamente.", detalle: "Aunque actualmente el slider solo está en la homepage, la ausencia de Page Path viola la regla estándar y es una vulnerabilidad ante futuras actualizaciones del site.", correccion: "Añadir condición obligatoria al trigger:\n- Page Path = / (exactamente la raíz)\n\nSin esta condición, view_promotion podría dispararse en páginas donde no corresponde.", reglaAsociada: "R22" },
        { id: "P7-E2", severidad: "critico", titulo: "Variable JS - Home Icon Name usa regex implícito: iconText.replace(/\\s+/g, ' ')", descripcion: "La variable usa iconText.replace(/\\s+/g, ' ') para limpiar espacios múltiples en el texto del icono.", detalle: "Aunque este regex es simple y poco probable que falle, viola la regla R01. Además, si el texto viene vacío y se intenta extraer del atributo title de una imagen, la lógica de split('_') es frágil.", correccion: "Reemplazar el regex de limpieza por normalización manual:\n\n// ❌ iconText.replace(/\\s+/g, ' ').trim();\n// ✅ Usar solo .trim() — los espacios múltiples en textContent son raros en la práctica\nvar iconText = linkElement.textContent.trim();\n\n// Para el fallback de img.title, usar indexOf en lugar de split:\nif (img && img.title) {\n  var lastUnderscore = img.title.lastIndexOf('_');\n  iconText = lastUnderscore !== -1 ? img.title.substring(lastUnderscore + 1) : img.title;\n}", reglaAsociada: "R01" },
        { id: "P7-E3", severidad: "critico", titulo: "Trigger Click - Home Icons usa CSS selector .iconos-home a como condición única", descripcion: "La condición 'Click Element matches CSS selector .iconos-home a' es un CSS selector como método principal de trigger.", detalle: "Si el usuario hace clic en el img o el span dentro del <a>, el Click Element no es el <a> y el trigger no dispara. Mismo patrón de error que PASO 1 y PASO 5.", correccion: "Cambiar la condición del trigger:\n- Click Classes contiene item_enlace_new\n\nO añadir condición de respaldo:\n- Click Classes contiene item_enlace_new\n- O Click Element más cercano a .item_enlace_new\n\nAlternativamente: Custom HTML con listener en .iconos-home para capturar el clic a nivel de contenedor y navegar al <a> padre.", reglaAsociada: "R03" },
        { id: "P7-E4", severidad: "critico", titulo: "Trigger Slider Home - Interaction usa CSS selector como condición única: #slider_home .slick-dots button", descripcion: "El trigger de interacción con el slider usa 'Click Element matches CSS selector #slider_home .slick-dots button'. Mismo problema estructural.", detalle: "Si el usuario hace clic en el span dentro del button, el Click Element es el span, no el button. El selector no matchea y el evento no se dispara.", correccion: "Cambiar tipo de trigger a 'Todos los clics' con condición:\n- Click Element más cercano a #slider_home .slick-dots button (usando contains)\n\nO usar Custom HTML con listener:\n\nvar dots = document.querySelector('#slider_home .slick-dots');\nif (dots) {\n  dots.addEventListener('click', function(e) {\n    window.dataLayer.push({event: 'slider_dot_click'});\n  });\n}", reglaAsociada: "R03" },
        { id: "P7-E5", severidad: "medio", titulo: "Variable JS - Page Section se calcula en el momento del pageview, no en el momento del clic — puede devolver valores incorrectos", descripcion: "La variable JS - Page Section calcula la sección de la página basándose en window.scrollY en el momento en que la variable es evaluada.", detalle: "Si GTM evalúa la variable justo antes de un scroll o durante la animación, el valor puede no reflejar la sección que el usuario tenía visible en el momento del clic.", correccion: "Esta variable solo tiene sentido si se evalúa en el trigger correcto. Documentar que JS - Page Section no debe usarse como parámetro de un evento de clic (el scroll habrá cambiado). Para iconos home, usar el identificador del contenedor (.iconos-home) que ya es específico.", reglaAsociada: "R08" },
        { id: "P7-E6", severidad: "medio", titulo: "Ninguno de los 3 eventos de la Home tiene etiqueta Facebook Pixel — no está justificado en la guía", descripcion: "Los 3 eventos (Hero View, Icon Click, Slider Interaction) son solo GA4. La guía no explica por qué no hay etiqueta Facebook.", detalle: "Sin justificación documentada, el implementador puede añadir Facebook Pixel erróneamente, saturando el Pixel con eventos de bajo valor.", correccion: "Añadir nota explícita para los 3 eventos:\n'Sin etiqueta Facebook Pixel. Visualizaciones y clics de la homepage son señales de UX/engagement sin valor de conversión directo para el algoritmo de Facebook. Añadirlos degradaría la calidad de los eventos de conversión reales.'", reglaAsociada: "R27" },
        { id: "P7-E7", severidad: "aviso", titulo: "El evento view_promotion para el Hero se dispara automáticamente al cargar — no indica que el usuario lo haya visto conscientemente", descripcion: "El trigger de Visibilidad de elemento al 50% en el hero slider dispara en cuanto la página carga, porque el hero ocupa la pantalla completa desde el inicio.", detalle: "Esto no es un error técnico, pero sí un error conceptual: el evento mide 'la página cargó', no 'el usuario vio el hero conscientemente'.", correccion: "Documentar esta limitación explícitamente en la guía. Si se quiere medir engagement real con el hero, usar un tiempo mínimo de visibilidad (ej: 2 segundos) en el trigger de Visibilidad de elemento:\n- Porcentaje mínimo visible: 50%\n- Tiempo mínimo en pantalla: 2000ms", reglaAsociada: "R08" },
      ]
    },
  ]
};

const sevCfg = {
  critico: { label: "🔴 Crítico", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  medio: { label: "🟡 Medio", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
  aviso: { label: "🔵 Aviso", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" }
};
const estadoCfg = {
  revisado: { label: "✅ Revisado", badge: "bg-green-100 text-green-700" },
  pendiente: { label: "⏳ Pendiente", badge: "bg-gray-100 text-gray-500" },
};
const catColor = {
  "Técnica": "bg-purple-100 text-purple-700",
  "Estructura GTM": "bg-blue-100 text-blue-700",
  "Formularios": "bg-teal-100 text-teal-700",
  "GA4": "bg-orange-100 text-orange-700",
  "Facebook": "bg-indigo-100 text-indigo-700",
};

function ErrorCard({ error }) {
  const [open, setOpen] = useState(false);
  const c = sevCfg[error.severidad];
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} mb-3`}>
      <button className="w-full text-left px-4 py-3 flex items-start justify-between gap-3" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 mt-0.5 ${c.badge}`}>{c.label}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-snug">{error.titulo}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{error.descripcion}</p>
          </div>
        </div>
        <span className="text-gray-400 text-xs shrink-0 mt-1">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Problema</p>
            <p className="text-sm text-gray-700 leading-relaxed">{error.detalle}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Corrección</p>
            <pre className="text-xs bg-gray-900 text-green-300 rounded p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">{error.correccion}</pre>
          </div>
          {error.reglaAsociada && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Regla:</span>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{error.reglaAsociada}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PasoCard({ paso, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = estadoCfg[paso.estado];
  const crit = paso.errores.filter(e => e.severidad === "critico").length;
  const med = paso.errores.filter(e => e.severidad === "medio").length;
  const avi = paso.errores.filter(e => e.severidad === "aviso").length;
  return (
    <div className="rounded-xl border border-gray-200 bg-white mb-4 shadow-sm">
      <button className="w-full text-left px-5 py-4 flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${c.badge}`}>{c.label}</span>
          <div>
            <p className="font-bold text-gray-800 text-sm">{paso.id}</p>
            <p className="text-sm text-gray-500">{paso.titulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          {crit > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{crit}🔴</span>}
          {med > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{med}🟡</span>}
          {avi > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{avi}🔵</span>}
          <span className="text-gray-400 text-xs ml-1">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {paso.errores.map(e => <ErrorCard key={e.id} error={e} />)}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("auditoria");
  const totalE = auditData.pasos.reduce((s, p) => s + p.errores.length, 0);
  const totalC = auditData.pasos.reduce((s, p) => s + p.errores.filter(e => e.severidad === "critico").length, 0);

  const patrones = [
    { patron: "begin_form con Visibilidad de elemento", pasos: "PASO 2, PASO 4", impacto: "Genera begin_form falsos en cada pageview si el formulario está visible al cargar." },
    { patron: "Triggers de Visibilidad sin condición Page Path", pasos: "PASO 2, PASO 4, PASO 7", impacto: "Vulnerabilidad ante cambios del site — falsos positivos sin ningún error visible." },
    { patron: "Uso de .includes() en variables JS", pasos: "PASO 3, PASO 6", impacto: "Inconsistencia con el estándar. Fallo silencioso en browsers legacy." },
    { patron: "Uso de regex en código GTM", pasos: "PASO 3, PASO 6, PASO 7", impacto: "Frágiles ante cambios menores de HTML/JS. Difíciles de debuggear." },
    { patron: "CSS selectors como condición de trigger", pasos: "PASO 1, PASO 3, PASO 5, PASO 7", impacto: "No detectan clicks en elementos hijos del selector. Fallan silenciosamente." },
    { patron: "Lead de Facebook en begin_form y generate_lead", pasos: "PASO 2, PASO 4", impacto: "Imposible calcular Form Abandonment Rate. Datos de conversión inflados." },
    { patron: "Ausencia de justificación para no usar Facebook Pixel", pasos: "PASO 5, PASO 7", impacto: "El implementador puede añadir etiquetas Facebook innecesarias que degradan el Pixel." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">ESES Agency · Estándar GTM</p>
              <h1 className="text-xl font-bold">Auditoría Guía Argenta</h1>
              <p className="text-sm text-gray-400 mt-1">{auditData.meta.objetivo}</p>
            </div>
            <span className="text-xs text-green-400 shrink-0 ml-4 font-semibold">{auditData.meta.estado}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Pasos revisados", value: `${auditData.pasos.filter(p => p.estado === "revisado").length}/${auditData.pasos.length}`, color: "text-green-400" },
              { label: "Errores totales", value: totalE, color: "text-yellow-400" },
              { label: "Críticos", value: totalC, color: "text-red-400" },
              { label: "Reglas estándar", value: auditData.reglas.length, color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-lg px-3 py-2.5">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 flex">
          {[
            { id: "auditoria", label: "Auditoría por paso" },
            { id: "reglas", label: `Reglas (${auditData.reglas.length})` },
            { id: "resumen", label: "Resumen ejecutivo" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {tab === "auditoria" && (
          <div>
            <p className="text-sm text-gray-500 mb-5">Haz clic en cada error para ver el problema detallado y la corrección exacta con código.</p>
            {auditData.pasos.map((p, i) => <PasoCard key={p.id} paso={p} defaultOpen={i >= auditData.pasos.length - 2} />)}
          </div>
        )}

        {tab === "reglas" && (
          <div>
            <p className="text-sm text-gray-500 mb-5">Reglas consolidadas del estándar ESES Agency derivadas de la auditoría completa PASOS 0–7.</p>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-2 shadow-sm">
              {auditData.reglas.map(r => (
                <div key={r.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="font-mono text-xs text-gray-400 mt-0.5 w-10 shrink-0">{r.id}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${catColor[r.categoria] || "bg-gray-100 text-gray-600"}`}>{r.categoria}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{r.regla}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.razon}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "resumen" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4">Errores por paso</h2>
              {auditData.pasos.map(p => {
                const c = p.errores.filter(e => e.severidad === "critico").length;
                const m = p.errores.filter(e => e.severidad === "medio").length;
                const a = p.errores.filter(e => e.severidad === "aviso").length;
                const total = p.errores.length;
                return (
                  <div key={p.id} className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{p.id} — {p.titulo.split("(")[0].trim().substring(0, 50)}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{total} errores</span>
                    </div>
                    <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-gray-100">
                      {c > 0 && <div className="bg-red-400" style={{ width: `${(c / Math.max(total, 1)) * 100}%` }} />}
                      {m > 0 && <div className="bg-yellow-400" style={{ width: `${(m / Math.max(total, 1)) * 100}%` }} />}
                      {a > 0 && <div className="bg-blue-400" style={{ width: `${(a / Math.max(total, 1)) * 100}%` }} />}
                    </div>
                    <div className="flex gap-3 mt-1">
                      {c > 0 && <span className="text-xs text-red-600">{c} crítico{c > 1 ? "s" : ""}</span>}
                      {m > 0 && <span className="text-xs text-yellow-600">{m} medio{m > 1 ? "s" : ""}</span>}
                      {a > 0 && <span className="text-xs text-blue-600">{a} aviso{a > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3">Todos los errores críticos</h2>
              <div className="space-y-1.5">
                {auditData.pasos.flatMap(p => p.errores.filter(e => e.severidad === "critico").map(e => ({ ...e, paso: p.id }))).map(e => (
                  <div key={e.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded shrink-0">{e.paso}</span>
                    <p className="text-sm text-gray-700 leading-snug">{e.titulo}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3">Patrones de error recurrentes</h2>
              <div className="space-y-3">
                {patrones.map((item, i) => (
                  <div key={i} className="border-l-4 border-orange-300 pl-3 py-1">
                    <p className="text-sm font-semibold text-gray-800">{item.patron}</p>
                    <p className="text-xs text-orange-700 font-medium mt-0.5">{item.pasos}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.impacto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h2 className="font-bold text-green-800 mb-1">✅ Auditoría completada — PASOS 0 al 7</h2>
              <p className="text-sm text-green-700">{totalE} errores identificados ({totalC} críticos) en {auditData.pasos.length} pasos. {auditData.reglas.length} reglas del estándar consolidadas. Listo para redactar el documento estándar corregido de la guía ESES Agency.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

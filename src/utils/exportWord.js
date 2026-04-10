import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, PageBreak,
} from 'docx'
import { saveAs } from 'file-saver'

// A4 usable width: 11906 - (1134 * 2) = 9638 DXA
const PAGE_W = 9638

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  CARBON:   '1B1B1A',
  GREEN:    '82FF7A',
  GRIS:     '666666',
  GRIS_BG:  'F4F4F4',
  BLANCO:   'FFFFFF',
  CODE_BG:  '1E1E1E',
  CODE_FG:  '82FF7A',
  WARN:     '856404',
  WARN_BG:  'FFF3CD',
}

const FONT_HEAD = 'Calibri'
const FONT_BODY = 'Calibri'
const FONT_MONO = 'Courier New'

// ─── Simple helpers ───────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, font: FONT_HEAD, color: C.CARBON })]
  })
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, font: FONT_HEAD, color: C.CARBON })]
  })
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: FONT_HEAD, color: C.CARBON })]
  })
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({
      text: text || '',
      size: opts.size || 20,
      color: opts.color || C.CARBON,
      italics: opts.italic || false,
      bold: opts.bold || false,
      font: FONT_BODY,
    })]
  })
}

function label(text) {
  return new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 17, color: C.GRIS, font: FONT_HEAD })]
  })
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 0 }, children: [new TextRun({ text: '' })] })
}

function divider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
    children: [new TextRun({ text: '' })]
  })
}

// A shaded box implemented as a single-cell table — simplest compatible approach
function shadeBox(lines = [], bgColor = C.GRIS_BG, textColor = C.CARBON) {
  const paragraphs = lines.map((line, i) => new Paragraph({
    spacing: { before: i === 0 ? 0 : 40, after: 0 },
    children: [new TextRun({ text: line || '', size: 18, color: textColor, font: FONT_MONO })]
  }))

  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
      insideH:{ style: BorderStyle.NONE },
      insideV:{ style: BorderStyle.NONE },
    },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: PAGE_W, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: paragraphs
      })]
    })]
  })
}

// A simple 2-column table for key/value pairs
function kvTable(rows = []) {
  if (!rows || rows.length === 0) return body('—')
  const keyW = Math.round(PAGE_W * 0.35)
  const valW = PAGE_W - keyW
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      insideV:{ style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
    },
    rows: rows.map(([k, v], i) => new TableRow({
      children: [
        new TableCell({
          width: { size: keyW, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C.GRIS_BG : C.BLANCO, fill: i % 2 === 0 ? C.GRIS_BG : C.BLANCO },
          margins: { top: 80, bottom: 80, left: 120, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: k || '', bold: true, size: 18, font: FONT_BODY, color: C.CARBON })] })]
        }),
        new TableCell({
          width: { size: valW, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? C.GRIS_BG : C.BLANCO, fill: i % 2 === 0 ? C.GRIS_BG : C.BLANCO },
          margins: { top: 80, bottom: 80, left: 120, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: v || '', size: 18, font: FONT_BODY, color: C.CARBON })] })]
        }),
      ]
    }))
  })
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function exportToWord(impls, clientName) {
  const children = []

  // Cover
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1400, after: 160 },
      children: [new TextRun({ text: 'GTMXpert', bold: true, size: 80, font: FONT_HEAD, color: C.CARBON })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: 'Plan de Implementación GTM', size: 32, font: FONT_BODY, color: C.GRIS })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: clientName || 'Cliente', bold: true, size: 40, font: FONT_HEAD, color: C.CARBON })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 0 },
      children: [new TextRun({ 
        text: `Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 
        size: 20, font: FONT_BODY, color: C.GRIS, italics: true 
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 0 },
      children: [new TextRun({ text: 'Motor GTMXpert · Estándar ESES v1.0 · Gemini 2.5 Pro', size: 18, font: FONT_BODY, color: C.GRIS, italics: true })]
    }),
    new Paragraph({ children: [new PageBreak()] })
  )

  // Each event
  impls.forEach((impl, idx) => {
    // Title
    children.push(h1(`Evento ${idx + 1} — ${impl.event_name}`))
    children.push(body(`Página: /${impl.page || 'global'}`, { color: C.GRIS, italic: true }))
    children.push(spacer())

    // Capture strategy
    children.push(label('Estrategia de captura'))
    children.push(body(impl.analysis?.capture_strategy || 'No especificada'))
    children.push(spacer())

    // Warnings
    if (impl.analysis?.warnings?.length) {
      children.push(label('⚠ Avisos técnicos'))
      impl.analysis.warnings.forEach(w => children.push(body(`• ${w}`, { color: C.WARN })))
      children.push(spacer())
    }

    // GA4 Custom Dimensions
    if (impl.setup?.custom_dimensions?.length) {
      children.push(divider())
      children.push(h2('Paso 0: Dimensiones personalizadas GA4'))
      children.push(body(impl.setup.notes || 'Crear estas dimensiones en GA4 antes de publicar.', { color: C.GRIS, italic: true }))
      children.push(spacer())
      children.push(kvTable(impl.setup.custom_dimensions.map(d => [
        `${d.parameter} [${d.scope}]`,
        d.description || ''
      ])))
      children.push(spacer())
    }

    // 1. Variables
    children.push(divider())
    children.push(h2('1. Variables'))
    if (!impl.variables?.length) {
      children.push(body('No se requieren variables adicionales.', { color: C.GRIS }))
    } else {
      impl.variables.forEach(v => {
        children.push(h3(`${v.name}  [${v.type}]`))
        // Code block as shaded box — one line per row for readability
        const codeLines = (v.code || '').split('\n')
        children.push(shadeBox(codeLines, C.CODE_BG, C.CODE_FG))
        children.push(body(`→ Devuelve: ${v.returns || 'N/A'}`, { color: C.GRIS, italic: true }))
        children.push(spacer())
      })
    }

    // 2. Trigger
    children.push(divider())
    children.push(h2('2. Trigger'))
    const triggerRows = [
      ['Nombre', impl.trigger?.name || 'N/A'],
      ['Tipo', impl.trigger?.type || 'N/A'],
      ...((impl.trigger?.conditions || []).map(c => [
        c.field || 'Campo',
        `${c.operator || ''}: "${c.value || ''}"`
      ]))
    ]
    children.push(kvTable(triggerRows))
    if (impl.trigger?.notes) {
      children.push(spacer())
      children.push(body(impl.trigger.notes, { color: C.GRIS, italic: true }))
    }
    children.push(spacer())

    // 3. Tags
    children.push(divider())
    children.push(h2('3. Etiquetas'))
    ;(impl.tags || []).forEach(tag => {
      const platform = tag.platform || 'GTM'
      children.push(h3(`[${platform}] ${tag.name}`))
      const params = tag.parameters || tag.object_properties || []
      if (params.length) {
        children.push(kvTable(params.map(p => [p.key || '', p.value || ''])))
      }
      if (tag.justification) {
        children.push(body(`Justificación: ${tag.justification}`, { color: C.GRIS, italic: true }))
      }
      children.push(spacer())
    })

    // 4. Checklist
    children.push(divider())
    children.push(h2('4. Checklist de validación'))
    const checklist = impl.documentation?.checklist || impl.checklist || []
    if (!checklist.length) {
      children.push(body('No hay tareas de validación registradas.', { color: C.GRIS }))
    } else {
      checklist.forEach(item => {
        children.push(new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: '☐  ', bold: true, size: 20, font: 'Calibri', color: C.CARBON }),
            new TextRun({ text: item, size: 20, font: FONT_BODY, color: C.CARBON }),
          ]
        }))
      })
    }
    children.push(spacer())

    // 5. Strategic Rationale
    const rationale = impl.documentation?.rationale || impl.rationale
    if (rationale) {
      children.push(divider())
      children.push(h2('Justificación estratégica'))
      children.push(body(rationale))
      children.push(spacer())
    }

    // Page break between events
    if (idx < impls.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
  })

  // Footer
  children.push(
    spacer(), spacer(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: 'Generado por GTMXpert · ESES Agency · No distribuir sin autorización', 
        size: 16, color: 'AAAAAA', italics: true, font: FONT_BODY 
      })]
    })
  )

  const doc = new Document({
    creator: 'GTMXpert — ESES Agency',
    title: `Plan de Tracking GTM — ${clientName}`,
    description: 'Generado por GTMXpert con Estándar ESES v1.0',
    sections: [{
      properties: {
        page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }
      },
      children
    }]
  })

  const blob = await Packer.toBlob(doc)
  const safeName = (clientName || 'cliente').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/gi, '')
  const filename = `GTMXpert_${safeName}_${new Date().toISOString().slice(0, 10)}.docx`
  saveAs(blob, filename)
}

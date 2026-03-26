import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, Header, PageBreak, TabStopType,
  UnderlineType
} from 'docx'
import { saveAs } from 'file-saver'

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  AZUL:      '1F4E79',
  AZUL_MED:  '2E75B6',
  AZUL_CLARO:'BDD7EE',
  VERDE:     '375623',
  VERDE_BG:  'E2EFDA',
  NARANJA:   'C55A11',
  NARANJA_BG:'FCE4D6',
  ROJO_BG:   'FCE4D6',
  GRIS:      '595959',
  GRIS_BG:   'F2F2F2',
  NEGRO:     '1A1A1A',
  BLANCO:    'FFFFFF',
  CODE_BG:   '1E1E2E',
  CODE_FG:   '00C853',
}

function cell(text, { bg, bold, mono, color, width } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: bg ? { type: ShadingType.SOLID, color: bg, fill: bg } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({
        text,
        bold: bold || false,
        font: mono ? 'Courier New' : 'Calibri',
        size: 18,
        color: color || C.NEGRO,
      })]
    })]
  })
}

function twoColTable(rows = []) {
  if (!rows || rows.length === 0) {
    return new Table({ rows: [new TableRow({ children: [cell('—')] })] })
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideV:{ style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    rows: rows.map(([label, value], i) => new TableRow({
      children: [
        cell(label, { bg: i % 2 === 0 ? C.GRIS_BG : C.BLANCO, bold: true, width: 35 }),
        cell(value, { bg: i % 2 === 0 ? C.GRIS_BG : C.BLANCO }),
      ]
    }))
  })
}

function heading(text, level, color = C.AZUL) {
  const sizes = { 1: 36, 2: 28, 3: 24 }
  return new Paragraph({
    spacing: { before: level === 1 ? 480 : 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: sizes[level] || 24, color, font: 'Calibri' })]
  })
}

function para(text, { color, italic, size, spacing } = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80, ...(spacing || {}) },
    children: [new TextRun({ text, size: size || 20, color: color || C.NEGRO, italics: italic || false, font: 'Calibri' })]
  })
}

function infoBox(label, text, { bgColor = C.AZUL_CLARO, labelColor = C.AZUL } = {}) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.THICK, size: 8, color: labelColor }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        margins: { top: 80, bottom: 80, left: 180, right: 120 },
        children: [
          new Paragraph({ children: [new TextRun({ text: label.toUpperCase(), bold: true, size: 16, color: labelColor, font: 'Calibri' })] }),
          new Paragraph({ spacing: { before: 40, after: 0 }, children: [new TextRun({ text, size: 18, color: C.NEGRO, font: 'Calibri' })] }),
        ]
      })]
    })]
  })
}

function codeBlock(code = '') {
  const lines = (code || '').split('\n')
  if (lines.length === 0 || (lines.length === 1 && !lines[0])) {
    return new Table({ rows: [new TableRow({ children: [cell('// No code provided')] })] })
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
    rows: lines.map(line => new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.SOLID, color: C.CODE_BG, fill: C.CODE_BG },
        margins: { top: 20, bottom: 20, left: 180, right: 120 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 16, color: C.CODE_FG })]
        })]
      })]
    }))
  })
}

function checklistTable(items = []) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [cell('No hay tareas de validación registradas.')] })]
    })
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
      insideV:{ style: BorderStyle.NONE },
    },
    rows: items.map((item, i) => new TableRow({
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: C.VERDE_BG, fill: C.VERDE_BG } : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 60 },
          children: [new Paragraph({ children: [new TextRun({ text: '☐', size: 20, bold: true, color: C.VERDE, font: 'Calibri' })] })]
        }),
        new TableCell({
          shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: C.VERDE_BG, fill: C.VERDE_BG } : undefined,
          margins: { top: 80, bottom: 80, left: 60, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: item, size: 18, color: C.NEGRO, font: 'Calibri' })] })]
        })
      ]
    }))
  })
}

// ─── Main export function ─────────────────────────────────────────────────────
export async function exportToWord(impls, clientName) {
  const children = []

  // ── Cover page ──
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [new TextRun({ text: 'GTMXpert', font: 'Calibri', size: 72, bold: true, color: C.AZUL })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Plan de Implementación GTM', font: 'Calibri', size: 36, color: C.AZUL_MED })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 0 },
      children: [new TextRun({ text: clientName || 'Cliente', font: 'Calibri', size: 28, bold: true, color: C.NEGRO })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 0 },
      children: [new TextRun({ text: `Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, font: 'Calibri', size: 20, color: C.GRIS, italics: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 0 },
      children: [new TextRun({ text: 'Motor GTMXpert · Estándar ESES v1.0 · Gemini 2.5 Pro', font: 'Calibri', size: 18, color: C.GRIS, italics: true })]
    }),
    // page break after cover
    new Paragraph({ children: [new PageBreak()] })
  )

  // ── Each event implementation ──
  impls.forEach((impl, idx) => {
    // Event title
    children.push(
      heading(`Evento ${idx + 1} — ${impl.event_name}`, 1),
      para(`Página: /${impl.page}`, { color: C.GRIS, italic: true }),
    )

    // Strategy box
    children.push(
      new Paragraph({ spacing: { before: 160, after: 60 } }),
      infoBox('Estrategia de captura', impl.analysis.capture_strategy, { bgColor: 'DEEAF1', labelColor: C.AZUL_MED }),
    )

    // Warnings
    if (impl.analysis.warnings?.length) {
      impl.analysis.warnings.forEach(w => {
        children.push(
          new Paragraph({ spacing: { before: 80, after: 0 } }),
          infoBox('⚠ Aviso técnico', w, { bgColor: C.NARANJA_BG, labelColor: C.NARANJA }),
        )
      })
    }

    // 1. Variables
    children.push(heading('1. Variables', 2, C.AZUL_MED))
    impl.variables.forEach(v => {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: v.name, bold: true, size: 20, color: C.AZUL_MED, font: 'Calibri' }),
            new TextRun({ text: `  [${v.type}]`, size: 18, color: C.GRIS, font: 'Calibri' }),
          ]
        }),
        codeBlock(v.code),
        para(`→ Devuelve: ${v.returns}`, { color: C.GRIS, italic: true, size: 17, spacing: { before: 60, after: 120 } })
      )
    })

    // 2. Trigger
    children.push(heading('2. Trigger', 2, C.AZUL_MED))
    const triggerRows = [
      ['Nombre', impl.trigger?.name || 'N/A'],
      ['Tipo', impl.trigger?.type || 'N/A'],
      ...((impl.trigger?.conditions || []).map(c => [c.field || 'Field', `${c.operator || 'Op'}: "${c.value || ''}"`]))
    ]
    children.push(twoColTable(triggerRows))
    if (impl.trigger.notes) {
      children.push(para(impl.trigger.notes, { color: C.GRIS, italic: true, size: 17 }))
    }

    // 3. Tags
    children.push(heading('3. Etiquetas', 2, C.AZUL_MED))
    impl.tags.forEach(tag => {
      const color = tag.platform === 'GA4' ? 'E45C00' : '1877F2'
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({ text: `[${tag.platform}]`, bold: true, size: 20, color, font: 'Calibri' }),
            new TextRun({ text: `  ${tag.name}`, bold: true, size: 20, color: C.NEGRO, font: 'Calibri' }),
          ]
        })
      )
      const params = tag.parameters || tag.object_properties || []
      if (params.length) {
        children.push(twoColTable(params.map(p => [p.key || 'Key', p.value || ''])))
      }
      if (tag.justification) {
        children.push(para(`Justificación: ${tag.justification}`, { color: C.GRIS, italic: true, size: 17 }))
      }
    })

    // 4. Checklist
    children.push(heading('4. Checklist de validación', 2, C.VERDE))
    children.push(checklistTable(impl.checklist))

    // 5. Rationale
    children.push(
      heading('Justificación estratégica', 3, C.AZUL),
      para(impl.rationale),
    )

    // Page break between events (not after last)
    if (idx < impls.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
  })

  // ── Footer note ──
  children.push(
    new Paragraph({ spacing: { before: 480 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Generado por GTMXpert · ESES Agency · No distribuir sin autorización', size: 16, color: 'AAAAAA', italics: true, font: 'Calibri' })]
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

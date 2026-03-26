import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// No mock data - fetching from backend directly
const priorityColors = {
  high: 'bg-brand-boreal/10 text-brand-boreal border-brand-boreal/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10',
}

// ─── Page Card ────────────────────────────────────────────────────────────────
function PageCard({ page, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const lineCount = (page.html.match(/\n/g) || []).length + 1
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-7 h-7 rounded-lg bg-brand-boreal/10 flex items-center justify-center shrink-0">
          <span className="text-brand-boreal text-xs font-display font-black">{page.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-bold text-gray-900 dark:text-white truncate transition-colors">/{page.name}</p>
          <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">{lineCount} líneas · {(page.html.length / 1024).toFixed(1)} KB</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-900 dark:text-white/20 dark:hover:text-white/60 transition-colors text-xs px-2 py-1">
            {expanded ? '▲' : '▼'}
          </button>
          <button onClick={() => onRemove(page.id)} className="text-gray-400 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400 transition-colors text-sm">✕</button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 px-4 pb-3 transition-colors">
          <pre className="text-xs text-gray-500 dark:text-white/40 font-mono mt-2 max-h-24 overflow-y-auto custom-scrollbar leading-relaxed transition-colors">
            {page.html.substring(0, 600)}{page.html.length > 600 ? '\n...' : ''}
          </pre>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Scout View ──────────────────────────────────────────────────────────
export default function ScoutView({ navigate, client }) {
  const [pages, setPages] = useState([])
  const [pageName, setPageName] = useState('')
  const [pageHtml, setPageHtml] = useState('')
  const [clientName, setClientName] = useState(client?.name || '')
  const [clientUrl, setClientUrl] = useState(client?.url || '')
  const [hasFacebook, setHasFacebook] = useState(client?.hasFacebook ?? true)
  const [stage, setStage] = useState('input') // input | loading | results
  const [selectedEvents, setSelectedEvents] = useState([])
  const [scoutResults, setScoutResults] = useState(null)
  const [addMode, setAddMode] = useState('paste') // paste | upload
  const fileRef = useRef(null)

  // Restaurar estado si viene del historial
  useEffect(() => {
    if (client?.latestScout) {
      setScoutResults(client.latestScout)
      setSelectedEvents(client.latestScout.suggested_events?.map(e => e.event_name) || [])
      setStage('results')
    }
  }, [client])

  const handleAddPage = () => {
    if (!pageName.trim() || !pageHtml.trim()) return
    console.log(`[UI] Adding page: ${pageName}`)
    setPages(prev => [...prev, { id: Date.now(), name: pageName.trim().toLowerCase().replace(/\//g, ''), html: pageHtml.trim() }])
    setPageName('')
    setPageHtml('')
  }

  const handleRemovePage = (id) => setPages(prev => prev.filter(p => p.id !== id))

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const autoName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result
      setPages(prev => [...prev, { id: Date.now(), name: autoName, html: content }])
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const toggleEvent = (name) => {
    setSelectedEvents(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    )
  }

  const handleScout = async () => {
    if (pages.length === 0) return
    setStage('loading')
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    try {
      console.log(`[UI] Launching Scout for ${clientName} (${pages.length} pages)...`)
      
      // Concatenate all pages HTML with a small separator
      const combinedHtml = pages.map(p => `<!-- PAGE: /${p.name} -->\n${p.html}`).join('\n\n')
      
      const res = await fetch('http://localhost:3000/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          html_snippet: combinedHtml,
          client: { name: clientName, url: clientUrl, hasFacebook }
        })
      })
      
      clearTimeout(timeoutId);
      
      const data = await res.json()
      if (res.ok && data.suggested_events) {
        setScoutResults(data)
        setSelectedEvents(data.suggested_events.map(e => e.event_name))
        setStage('results')
      } else {
        const errorMsg = data.error || 'Respuesta del servidor incompleta (sin eventos sugeridos).'
        console.error('API Error:', errorMsg)
        alert('Error en el Scout: ' + errorMsg)
        setStage('input')
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Scout submission failed:', err)
      if (err.name === 'AbortError') {
        alert('La solicitud ha tardado demasiado (más de 60s). Revisa tu conexión o el volumen de HTML enviado.')
      } else {
        alert('Error conectando con el motor Scout: ' + err.message)
      }
      setStage('input')
    }
  }

  const handleGenerate = () => {
    if (!scoutResults || !scoutResults.suggested_events) {
      alert('Primero debes realizar un análisis (Scout) con éxito.');
      return;
    }
    navigate('plan', {
      client: { name: clientName, url: clientUrl, hasFacebook },
      selected: selectedEvents,
      results: scoutResults,
      pages: pages
    })
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs text-brand-boreal font-display font-bold uppercase tracking-widest mb-2">GTMXpert · Scout Agent</p>
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-1 transition-colors">Análisis de páginas</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm transition-colors">Añade el HTML de cada página de la web. Cuando hayas subido todas, lanza el Scout.</p>
        </div>
        {client?.id && (
          <button 
            onClick={() => navigate('scout', null)}
            className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-[10px] font-display font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm dark:shadow-none"
          >
            + Nuevo análisis
          </button>
        )}
      </motion.div>

      <div className={`grid gap-6 ${stage === 'results' ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {/* ── LEFT: Input panel ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="col-span-2 space-y-4">

          {/* Client info */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-none transition-colors">
            <h3 className="font-display font-bold text-xs text-gray-500 dark:text-white/40 uppercase tracking-widest transition-colors">Cliente</h3>
            <input
              type="text" value={clientName} onChange={e => setClientName(e.target.value)}
              placeholder="Argenta Cerámica"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-boreal/50 transition-colors"
            />
            <input
              type="text" value={clientUrl} onChange={e => setClientUrl(e.target.value)}
              placeholder="dominio.com"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-boreal/50 transition-colors"
            />
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm text-gray-700 dark:text-white/80 font-medium transition-colors">Facebook Pixel</p>
                <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">¿Active?</p>
              </div>
              <button onClick={() => setHasFacebook(!hasFacebook)} className={`w-11 h-6 rounded-full transition-all relative ${hasFacebook ? 'bg-brand-boreal' : 'bg-gray-200 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow ${hasFacebook ? 'bg-brand-carbon left-6' : 'bg-white left-1'}`} />
              </button>
            </div>
          </div>

          {/* Add HTML page */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-3 shadow-sm dark:shadow-none transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xs text-gray-500 dark:text-white/40 uppercase tracking-widest transition-colors">Añadir página</h3>
              {/* Toggle paste/upload */}
              <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 gap-0.5 transition-colors">
                {['paste', 'upload'].map(m => (
                  <button key={m} onClick={() => setAddMode(m)}
                    className={`text-xs px-3 py-1 rounded-md font-bold transition-all ${addMode === m ? 'bg-brand-boreal text-brand-carbon shadow-sm' : 'text-gray-500 dark:text-white/30 hover:text-gray-800 dark:hover:text-white/60'}`}>
                    {m === 'paste' ? '✏️ Pegar' : '📂 Archivo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Identifier */}
            <div>
              <label className="text-xs text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest block mb-1.5 transition-colors">Identificador de página</label>
              <input
                type="text" value={pageName} onChange={e => setPageName(e.target.value)}
                placeholder="contacto"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-brand-boreal/50 transition-colors font-mono"
              />
              <p className="text-xs text-gray-400 dark:text-white/20 mt-1 transition-colors">Ej: home, contacto, catalogos, productos…</p>
            </div>

            {addMode === 'paste' ? (
              <div>
                <label className="text-xs text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest block mb-1.5 transition-colors">HTML de la página</label>
                <textarea
                  value={pageHtml} onChange={e => setPageHtml(e.target.value)}
                  rows={7}
                  placeholder="Pega aquí el código HTML completo de la página (Ctrl+A, Ctrl+C en el inspector de Chrome)..."
                  className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-700 dark:text-white/70 font-mono placeholder-gray-400 dark:placeholder-white/15 focus:outline-none focus:border-brand-boreal/30 transition-colors resize-none custom-scrollbar"
                />
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" accept=".html,.htm,.txt" onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl py-6 text-center hover:border-brand-boreal/40 dark:hover:border-brand-boreal/40 hover:bg-brand-boreal/5 transition-all group"
                >
                  <p className="text-2xl mb-1">📂</p>
                  <p className="text-sm text-gray-500 dark:text-white/50 group-hover:text-gray-800 dark:group-hover:text-white/70 transition-colors">Haz clic para subir un archivo</p>
                  <p className="text-xs text-gray-400 dark:text-white/20 mt-0.5 transition-colors">.html · .htm · .txt</p>
                </button>
                <p className="text-xs text-gray-400 dark:text-white/20 mt-1 transition-colors">El nombre del archivo se usará como identificador de página</p>
              </div>
            )}

            <button
              onClick={handleAddPage}
              disabled={addMode === 'upload' || !pageName.trim() || !pageHtml.trim()}
              className="w-full bg-gray-800 dark:bg-white/10 text-white font-display font-bold uppercase tracking-widest rounded-xl py-3 text-xs hover:bg-gray-700 dark:hover:bg-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              + Añadir página
            </button>
          </div>

          {/* Pages list */}
          {pages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest px-1">{pages.length} página{pages.length > 1 ? 's' : ''} cargada{pages.length > 1 ? 's' : ''}</p>
              <AnimatePresence>
                {pages.map(p => <PageCard key={p.id} page={p} onRemove={handleRemovePage} />)}
              </AnimatePresence>
            </div>
          )}

          {/* Launch Scout */}
          <button
            onClick={handleScout}
            disabled={pages.length === 0 || stage === 'loading'}
            className="w-full bg-brand-boreal text-brand-carbon font-display font-black uppercase tracking-widest rounded-2xl py-4 text-sm hover:shadow-2xl hover:shadow-brand-boreal/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {stage === 'loading' ? '🔍 Analizando...' : `🔍 Iniciar Scout${pages.length > 0 ? ` (${pages.length} pág.)` : ''}`}
          </button>
        </motion.div>

        {/* ── RIGHT: Results panel ───────────────────────── */}
        <div className="col-span-3">
          <AnimatePresence mode="wait">
            {stage === 'input' && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-24">
                <div className="text-5xl mb-4 opacity-30">🔍</div>
                <p className="text-gray-500 dark:text-white/20 text-sm transition-colors">Añade páginas y lanza el Scout</p>
                <p className="text-gray-400 dark:text-white/10 text-xs mt-1 transition-colors">Los eventos sugeridos aparecerán aquí</p>
              </motion.div>
            )}

            {stage === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-2 border-brand-boreal/20 border-t-brand-boreal mb-6"
                />
                <p className="text-gray-700 dark:text-white/60 text-sm font-display font-bold transition-colors">Gemini 2.5 Pro analizando {pages.length} página{pages.length > 1 ? 's' : ''}...</p>
                <p className="text-gray-400 dark:text-white/20 text-xs mt-1 transition-colors">Detectando POIs · Consolidando eventos · Aplicando reglas ESES</p>
              </motion.div>
            )}

            {stage === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Summary */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 shadow-sm dark:shadow-none transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest transition-colors">Análisis completado</p>
                    <span className="text-xs bg-brand-boreal/10 text-brand-boreal px-2 py-0.5 rounded-full font-bold">
                      {scoutResults?.suggested_events?.length || 0} eventos consolidados
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-white/60 leading-relaxed transition-colors">{scoutResults?.page_analysis}</p>
                </div>

                {/* Suggested Events */}
                <div className="space-y-3">
                  {scoutResults?.suggested_events?.map((event, i) => {
                    const isSelected = selectedEvents.includes(event.event_name)
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        onClick={() => toggleEvent(event.event_name)}
                        className={`border rounded-2xl p-5 cursor-pointer transition-all ${isSelected ? 'border-brand-boreal/40 bg-brand-boreal/5' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/8 hover:border-brand-boreal/20 dark:hover:border-white/20 shadow-sm dark:shadow-none'}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-brand-boreal font-bold">{event.event_name}</span>
                            <span className="text-xs text-gray-500 dark:text-white/20 transition-colors">← /{event.page}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${priorityColors[event.priority || 'medium']}`}>
                              {event.priority === 'high' ? '🔥 Alta' : '📋 Media'}
                            </span>
                            {event.rules?.map(r => (
                              <span key={r} className="text-xs font-mono bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/25 px-1.5 py-0.5 rounded transition-colors">{r}</span>
                            ))}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${isSelected ? 'border-brand-boreal bg-brand-boreal' : 'border-gray-300 dark:border-white/20'}`}>
                            {isSelected && <span className="text-brand-carbon text-xs font-black">✓</span>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed mb-3 transition-colors">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest transition-colors">Param:</span>
                          {event.dynamic_parameters?.map(p => (
                            <span key={p} className="text-xs font-mono text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded transition-colors">{p}</span>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {selectedEvents.length > 0 && (
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleGenerate}
                    className="w-full bg-brand-boreal text-brand-carbon font-display font-black uppercase tracking-widest rounded-2xl py-4 text-sm hover:shadow-2xl hover:shadow-brand-boreal/20 transition-all">
                    ⚡ Generar implementación ({selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''})
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

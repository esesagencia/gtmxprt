import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Word Document Export ─────────────────────────────────────────────────────
import { exportToWord } from '../utils/exportWord'
import { exportToMarkdown, exportToHTML } from '../utils/exportUtils'

// ─── Event Implementation Card ────────────────────────────────────────────────
function EventImplementation({ impl }) {
  const [tab, setTab] = useState('implementation')
  const [openSections, setOpenSections] = useState({ variables: true, trigger: false, tags: false })
  const toggle = (s) => setOpenSections(p => ({ ...p, [s]: !p[s] }))

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-4 flex-wrap transition-colors">
        <span className="font-mono text-brand-boreal font-bold text-sm">{impl.event_name}</span>
        <span className="text-xs text-gray-500 dark:text-white/20 transition-colors">← /{impl.page || 'varias'}</span>
        {impl.analysis?.warnings?.length > 0 && (
          <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full transition-colors">⚠️ {impl.analysis.warnings.length} aviso</span>
        )}
      </div>
      <div className="flex border-b border-gray-100 dark:border-white/5 transition-colors">
        {['implementation', 'docs', 'validate'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs font-display font-bold uppercase tracking-widest transition-colors ${tab === t ? 'text-brand-boreal border-b-2 border-brand-boreal' : 'text-gray-500 dark:text-white/30 hover:text-gray-800 dark:hover:text-white/60'}`}>
            {t === 'implementation' && '⚙️ Implementación'}
            {t === 'docs' && '📋 Docs'}
            {t === 'validate' && '✅ Checklist'}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-3">
        {tab === 'implementation' && (
          <>
            {impl.setup?.custom_dimensions?.length > 0 && (
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 mb-3">
                <p className="text-xs font-bold text-purple-400/80 dark:text-purple-400/60 uppercase tracking-widest mb-1">Paso 0: Dimensiones GA4</p>
                <p className="text-[10px] text-gray-500 dark:text-white/40 mb-3">{impl.setup.notes || 'Crea estas dimensiones personalizadas en GA4 antes de publicar.'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {impl.setup.custom_dimensions.map((dim, i) => (
                    <div key={i} className="flex flex-col bg-white dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-gray-800 dark:text-white/80 truncate pr-2 max-w-[70%]">{dim.parameter}</span>
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded uppercase">{dim.scope}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-white/40 leading-tight">{dim.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest mb-1">Estrategia de captura</p>
              <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed transition-colors">{impl.analysis?.capture_strategy || 'No detectada'}</p>
            </div>
            {impl.analysis?.warnings?.map((w, i) => (
              <div key={i} className="bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/10 rounded-xl p-3 flex gap-2 transition-colors">
                <span className="text-yellow-600 dark:text-yellow-400/60 shrink-0">⚠️</span>
                <p className="text-xs text-yellow-700 dark:text-yellow-400/70 leading-relaxed transition-colors">{w}</p>
              </div>
            ))}
            {/* Variables */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden transition-colors">
              <button onClick={() => toggle('variables')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-500 dark:text-white/60 transition-colors">Variables ({impl.variables.length})</span>
                <span className="text-gray-400 dark:text-white/20 text-xs transition-colors">{openSections.variables ? '▲' : '▼'}</span>
              </button>
              {openSections.variables && impl.variables.map((v, i) => (
                <div key={i} className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 transition-colors">
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <span className="text-xs font-mono text-gray-800 dark:text-white/80 font-bold transition-colors">{v.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/30 px-2 py-0.5 rounded-lg transition-colors">{v.type}</span>
                  </div>
                  <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 text-xs rounded-xl p-4 overflow-x-auto font-mono leading-relaxed border border-gray-200 dark:border-white/5 transition-colors">{v.code}</pre>
                  <p className="text-xs text-gray-500 dark:text-white/30 mt-2 transition-colors">Devuelve: <span className="text-gray-600 dark:text-white/50 font-mono transition-colors">{v.returns}</span></p>
                </div>
              ))}
            </div>
            {/* Trigger */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden transition-colors">
              <button onClick={() => toggle('trigger')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-500 dark:text-white/60 transition-colors">Trigger</span>
                <span className="text-gray-400 dark:text-white/20 text-xs transition-colors">{openSections.trigger ? '▲' : '▼'}</span>
              </button>
              {openSections.trigger && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 transition-colors">
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 transition-colors"><p className="text-gray-500 dark:text-white/30 mb-0.5 transition-colors">Nombre</p><p className="text-gray-800 dark:text-white/80 font-mono font-bold transition-colors">{impl.trigger.name}</p></div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 transition-colors"><p className="text-gray-500 dark:text-white/30 mb-0.5 transition-colors">Tipo</p><p className="text-gray-800 dark:text-white/80 transition-colors">{impl.trigger.type}</p></div>
                  </div>
                  {impl.trigger.conditions.map((c, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-white/3 rounded-lg p-3 text-xs flex items-center gap-3 mb-1 transition-colors">
                      <span className="text-gray-600 dark:text-white/40 transition-colors">{c.field}</span>
                      <span className="text-brand-polar/80 dark:text-brand-boreal/60 font-bold transition-colors">{c.operator}</span>
                      <span className="text-gray-800 dark:text-white/70 font-mono transition-colors">{c.value}</span>
                    </div>
                  ))}
                  {impl.trigger.notes && <p className="text-xs text-gray-500 dark:text-white/30 italic mt-2 leading-relaxed transition-colors">{impl.trigger.notes}</p>}
                </div>
              )}
            </div>
            {/* Tags */}
            <div className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden transition-colors">
              <button onClick={() => toggle('tags')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-500 dark:text-white/60 transition-colors">Etiquetas ({impl.tags.length})</span>
                <span className="text-gray-400 dark:text-white/20 text-xs transition-colors">{openSections.tags ? '▲' : '▼'}</span>
              </button>
              {openSections.tags && impl.tags.map((tag, i) => (
                <div key={i} className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 transition-colors">
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-bold transition-colors ${tag.platform === 'GA4' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>{tag.platform}</span>
                    <span className="text-xs font-mono text-gray-800 dark:text-white/80 font-bold transition-colors">{tag.name}</span>
                  </div>
                  {(tag.parameters || tag.object_properties) && (
                    <table className="w-full text-xs mb-2">
                      <tbody>
                        {(tag.parameters || tag.object_properties).map((p, j) => (
                          <tr key={j} className={j % 2 === 0 ? 'bg-gray-50 dark:bg-white/3' : 'transition-colors'}>
                            <td className="py-1.5 px-3 text-gray-500 dark:text-white/40 rounded-l-lg w-1/3 transition-colors">{p.key}</td>
                            <td className="py-1.5 px-3 text-gray-800 dark:text-white/70 font-mono transition-colors">{p.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {tag.justification && <p className="text-xs text-gray-500 dark:text-white/40 italic leading-relaxed bg-gray-50 dark:bg-white/3 rounded-lg px-3 py-2 transition-colors">{tag.justification}</p>}
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'docs' && (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-transparent rounded-xl p-5 shadow-sm dark:shadow-none transition-colors">
            <p className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3 transition-colors">Justificación estratégica</p>
            <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed transition-colors">
              {impl.documentation?.rationale || impl.rationale || 'No hay justificación estratégica disponible.'}
            </p>
          </div>
        )}
        {tab === 'validate' && (
          <div className="space-y-0 bg-white dark:bg-transparent rounded-xl border border-gray-200 dark:border-transparent p-2 dark:p-0 transition-colors">
            {(impl.documentation?.checklist || impl.checklist || []).length > 0 ? (
              (impl.documentation?.checklist || impl.checklist).map((item, i) => (
                <div key={i} className={`flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-white/2'} px-2 rounded transition-colors`}>
                  <span className="text-brand-polar dark:text-brand-boreal/50 mt-0.5 shrink-0 transition-colors">☐</span>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed transition-colors">{item}</p>
                </div>
              ))
            ) : (
              <div className="p-10 text-center opacity-40 dark:opacity-30 text-xs text-gray-500 dark:text-white transition-colors">No hay tareas de validación registradas.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Plan View ───────────────────────────────────────────────────────────
export default function PlanView({ plan, navigate }) {
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeImpls, setActiveImpls] = useState([])
  const [eventStatuses, setEventStatuses] = useState({}) // { eventName: 'loading' | 'completed' | 'error' } 
  const [error, setError] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    // Si ya tenemos eventos sugeridos (cargado desde el historial), no re-generamos
    if (plan.suggested_events && plan.suggested_events.length > 0) {
      setActiveImpls(plan.suggested_events)
      setLoading(false)
      return
    }

    if (plan.selected && plan.selected.length > 0) {
      fetchAllEvents(plan.selected)
    }
  }, [plan])

  async function fetchAllEvents(eventList) {
    setLoading(true)
    setError(null)
    
    // Inicializar estados
    const initialStatuses = {}
    eventList.forEach(name => initialStatuses[name] = 'pending')
    setEventStatuses(initialStatuses)

    const combinedHtml = (plan.pages || []).map(p => `<!-- PAGE: /${p.name} -->\n${p.html}`).join('\n\n')
    const results = []

    for (let i = 0; i < eventList.length; i++) {
      const eventName = eventList[i]
      setEventStatuses(prev => ({ ...prev, [eventName]: 'loading' }))
      
      try {
        const res = await fetch('/api/plan/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: plan.client,
            eventName: eventName,
            htmlContent: combinedHtml
          })
        })
        
        const data = await res.json()
        if (res.ok) {
          results.push(data)
          setActiveImpls([...results]) // Update UI live
          setEventStatuses(prev => ({ ...prev, [eventName]: 'completed' }))
        } else {
          setEventStatuses(prev => ({ ...prev, [eventName]: 'error' }))
          console.error(`Error en evento ${eventName}:`, data.error)
        }
      } catch (err) {
        setEventStatuses(prev => ({ ...prev, [eventName]: 'error' }))
        console.error(`Error fetch ${eventName}:`, err.message)
      }
    }

    setLoading(false)

    // Persistir en Supabase si hay resultados
    if (results.length > 0 && plan.client?.name) {
      try {
        await fetch('/api/plan/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: plan.client,
            suggested_events: results
          })
        })
        console.log('[PlanView] Plan guardado en Supabase ✓')
      } catch (saveErr) {
        console.warn('[PlanView] Error guardando plan (no crítico):', saveErr.message)
      }
    }
  }

  const handleRetryEvent = async (eventName, idx) => {
    setEventStatuses(prev => ({ ...prev, [eventName]: 'loading' }))
    const combinedHtml = (plan.pages || []).map(p => `<!-- PAGE: /${p.name} -->\n${p.html}`).join('\n\n')

    try {
      const res = await fetch('/api/plan/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: plan.client,
          eventName: eventName,
          htmlContent: combinedHtml
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setActiveImpls(prev => {
          const next = [...prev]
          const existingIdx = next.findIndex(impl => impl.event_name === eventName)
          if (existingIdx !== -1) {
            next[existingIdx] = data
          } else {
            next.push(data)
          }
          return next
        })
        setEventStatuses(prev => ({ ...prev, [eventName]: 'completed' }))
      } else {
        setEventStatuses(prev => ({ ...prev, [eventName]: 'error' }))
      }
    } catch (err) {
      setEventStatuses(prev => ({ ...prev, [eventName]: 'error' }))
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportToWord(activeImpls, plan?.client?.name || 'Cliente')
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExporting(false)
    }
  }

  const client = plan?.client || {}
  const completedCount = Object.values(eventStatuses).filter(s => s === 'completed').length
  // En modo historial, plan.selected no existe — derivamos la lista de eventos de activeImpls
  const isHistoryMode = !plan.selected || plan.selected.length === 0
  const eventList = isHistoryMode ? activeImpls.map(impl => impl.event_name) : plan.selected
  const totalCount = eventList.length

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('scout', client)} className="text-xs text-gray-400 dark:text-white/30 hover:text-brand-polar dark:hover:text-brand-boreal transition-colors font-bold">← Scout</button>
          <span className="text-gray-300 dark:text-white/10 transition-colors">/</span>
          <span className="text-xs text-gray-400 dark:text-white/40 transition-colors">Plan de implementación</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-brand-boreal font-display font-bold uppercase tracking-widest mb-2">
              {client.name || 'Cliente'} · {client.url || ''}
            </p>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-1 transition-colors">Plan de Tracking</h1>
            <p className="text-gray-500 dark:text-white/40 text-sm transition-colors">
              {loading ? `Generando ${completedCount}/${totalCount}...` : `${activeImpls.length} eventos generados`} · Gemini 2.5 Pro · Estándar ESES v1.0
            </p>
          </div>
          {activeImpls.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToMarkdown(activeImpls, client.name)}
                className="shrink-0 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 font-display font-bold uppercase tracking-widest rounded-xl text-[10px] hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"
              >
                MD
              </button>
              <button
                onClick={() => exportToHTML(activeImpls, client.name)}
                className="shrink-0 px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 font-display font-bold uppercase tracking-widest rounded-xl text-[10px] hover:bg-gray-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"
              >
                HTML
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || activeImpls.length === 0}
                className="shrink-0 flex items-center gap-2 px-5 py-3 bg-brand-boreal text-brand-carbon font-display font-black uppercase tracking-widest rounded-xl text-xs hover:shadow-xl hover:shadow-brand-boreal/20 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block">⏳</motion.span>
                    Exportando...
                  </>
                ) : (
                  <>📄 Word</>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress Bar (Visible during loading) */}
      {loading && totalCount > 0 && (
        <div className="w-full h-1 bg-gray-200 dark:bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-brand-boreal"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center mb-8">
          <p className="text-red-400 font-bold mb-1">Error crítico</p>
          <p className="text-red-400/60 text-sm">{error}</p>
          <button onClick={() => fetchAllEvents(plan.selected)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold uppercase">Reintentar Todo</button>
        </div>
      )}

      {/* Event Tabs navigation */}
      {(loading || activeImpls.length > 0) && (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
            {eventList.map((eventName, i) => {
              const status = isHistoryMode ? 'completed' : eventStatuses[eventName]
              const implIdx = activeImpls.findIndex(impl => impl.event_name === eventName)
              return (
                <button
                  key={i}
                  disabled={status === 'pending'}
                  onClick={() => { if (implIdx !== -1) setActiveIdx(implIdx) }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all ${implIdx === activeIdx && implIdx !== -1 ? 'bg-brand-boreal text-brand-carbon shadow-md' : 'bg-white dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/70 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none'} ${status === 'pending' ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                >
                  {status === 'loading' && <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border border-current border-t-transparent rounded-full" />}
                  {status === 'completed' && <span className="text-brand-polar dark:text-brand-boreal">✓</span>}
                  {status === 'error' && <span className="text-red-500">⚠</span>}
                  <span className="font-mono normal-case">{eventName}</span>
                </button>
              )
            })}
          </div>

          {/* Active implementation or Loading State */}
          <AnimatePresence mode="wait">
            <motion.div key={activeIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              {activeImpls[activeIdx] ? (
                <EventImplementation impl={activeImpls[activeIdx]} />
              ) : (
                <div className="p-20 flex flex-col items-center justify-center bg-white dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-4">⚙️</motion.div>
                      <p className="text-sm font-bold text-gray-500 dark:text-white/40">Generando planes secuencialmente...</p>
                    </>
                  ) : (
                    <div className="p-4">
                      <p className="text-red-500 text-sm font-bold mb-4">No se pudo generar este evento.</p>
                      <button onClick={() => handleRetryEvent(eventList[activeIdx], activeIdx)} className="px-6 py-2 bg-brand-carbon dark:bg-brand-boreal text-brand-boreal dark:text-brand-carbon rounded-xl text-xs font-black uppercase tracking-widest">Reintentar Evento</button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Prev/Next navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 transition-colors"
            >
              ← Evento anterior
            </button>
            <span className="text-xs text-gray-400 dark:text-white/20 transition-colors">{activeIdx + 1} / {activeImpls.length || totalCount}</span>
            <button
              onClick={() => setActiveIdx(i => Math.min(Math.max(activeImpls.length - 1, 0), i + 1))}
              disabled={activeIdx >= (activeImpls.length - 1)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white disabled:opacity-20 transition-colors"
            >
              Evento siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

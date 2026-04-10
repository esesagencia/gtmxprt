import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Stats removed for a more direct/pill-based distribution

export default function DashboardHome({ navigate }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/clients')
        const data = await res.json()
        if (Array.isArray(data)) {
          setClients(data)
        }
      } catch (err) {
        console.error('Error fetching clients:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const handleClientClick = async (client) => {
    try {
      setLoading(true)
      // 1. Intentar cargar Plan
      const planRes = await fetch(`/api/clients/${client.id}/latest-plan`)
      const plan = await planRes.json()
      
      if (plan && plan.suggested_events) {
        navigate('plan', { ...plan, client: client })
        return
      }

      // 2. Si no hay plan, intentar cargar Scout Result
      const scoutRes = await fetch(`/api/clients/${client.id}/latest-scout`)
      const scout = await scoutRes.json()

      if (scout) {
        navigate('scout', { ...client, latestScout: scout })
      } else {
        navigate('scout', client)
      }
    } catch (err) {
      console.error('Error al recuperar el historial:', err)
      navigate('scout', client)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      {/* Hero Section / Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Welcome Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-br from-brand-slate/50 to-brand-carbon/30 dark:from-white/5 dark:to-transparent border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-center min-h-[220px] backdrop-blur-md group transition-all duration-500"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-boreal/5 rounded-full blur-3xl group-hover:bg-brand-boreal/10 transition-colors duration-700" />
          <p className="text-xs text-brand-boreal font-display font-black uppercase tracking-[0.2em] mb-4">ESES Agency · GTMXpert</p>
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white leading-tight">
            Yeeeeep. <br />
            <span className="text-brand-boreal">¡Vamos a empezar un nuevo etiquetado!</span>
          </h2>
        </motion.div>

        {/* Scout Pill (Primary CTA) */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={() => navigate('scout')}
          className="relative overflow-hidden group bg-brand-boreal text-brand-carbon rounded-[2.5rem] p-8 flex flex-col justify-between hover:shadow-[0_0_50px_-12px_rgba(130,255,122,0.4)] transition-all duration-500 text-left"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-32 translate-x-32 group-hover:-translate-y-24 group-hover:translate-x-24 transition-transform duration-700" />
          
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-brand-carbon rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-500">
              🔍
            </div>
            <div className="text-brand-carbon/40 font-display font-black text-6xl select-none">01</div>
          </div>

          <div>
            <h3 className="text-2xl font-display font-black mb-2">Analizar nueva página</h3>
            <p className="text-brand-carbon/70 text-sm max-w-[280px] leading-relaxed">
              Detecta automáticamente todos los puntos de interés enviando el HTML de tus páginas.
            </p>
            <div className="mt-6 flex items-center gap-2 font-display font-black uppercase tracking-widest text-xs">
              <span className="w-8 h-px bg-brand-carbon/30 group-hover:w-12 transition-all duration-500" />
              Iniciar ahora
            </div>
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📄</div>
            <div>
              <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white transition-colors">Estándar ESES v1.0</h4>
              <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">23 reglas técnicas activas · Prompt sincronizado</p>
            </div>
            <span className="ml-auto text-[10px] bg-brand-boreal/10 text-brand-boreal px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Activo</span>
          </div>
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-colors cursor-pointer group">
            <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🤖</div>
            <div>
              <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white transition-colors">Motor IA</h4>
              <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">Motor GTMXpert por ESES Agency activo</p>
            </div>
            <span className="ml-auto text-[10px] bg-brand-boreal/10 text-brand-boreal px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Gemini 2.5 Pro</span>
          </div>
      </div>

      {/* Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-lg text-gray-900 dark:text-white transition-colors">Clientes recientes</h2>
          <button className="text-xs text-gray-500 dark:text-white/30 hover:text-brand-boreal dark:hover:text-brand-boreal transition-colors font-bold uppercase tracking-widest">
            {loading ? 'Cargando...' : 'Ver todos →'}
          </button>
        </div>
        <div className="space-y-3">
          {clients.length === 0 && !loading && (
            <div className="bg-white dark:bg-white/3 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 text-center transition-colors">
              <p className="text-gray-400 dark:text-white/20 text-sm transition-colors">No hay clientes recientes aún. Empieza con un nuevo Scout.</p>
            </div>
          )}
          {clients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ x: 4 }}
              onClick={() => handleClientClick(client)}
              className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 flex items-center gap-5 cursor-pointer hover:border-brand-boreal/30 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-all"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center font-display font-black text-sm text-gray-500 dark:text-white/60 shrink-0 transition-colors">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm transition-colors">{client.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-brand-boreal/10 text-brand-boreal`}>
                    Activo
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/30 mt-0.5 transition-colors">{client.url} · {new Date(client.last_updated).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400 dark:text-white/20 transition-colors">{new Date(client.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs text-brand-boreal/80 dark:text-brand-boreal/60 mt-1">→ Ver Plan</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

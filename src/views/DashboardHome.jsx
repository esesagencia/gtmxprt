import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Clientes activos', value: '2', delta: '+1 este mes' },
  { label: 'Planes generados', value: '4', delta: '+2 esta semana' },
  { label: 'Reglas aplicadas', value: '23', delta: 'ESES Standard v1' },
  { label: 'Tiempo ahorrado', value: '~6h', delta: 'vs proceso manual' },
]

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-xs text-brand-boreal font-display font-bold uppercase tracking-widest mb-2">
          ESES Agency · Motor GTM
        </p>
        <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white mb-3 transition-colors">
          GTMXpert Dashboard
        </h1>
        <p className="text-gray-500 dark:text-white/40 text-sm max-w-xl transition-colors">
          Genera implementaciones GTM perfectas en segundos. Carga el HTML de cualquier página, y el motor de IA detecta qué trackear y cómo.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-10"
      >
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 shadow-sm dark:shadow-none transition-colors">
            <p className="text-3xl font-display font-black text-brand-boreal">{s.value}</p>
            <p className="text-sm text-gray-700 dark:text-white/80 mt-1 font-medium transition-colors">{s.label}</p>
            <p className="text-xs text-gray-500 dark:text-white/30 mt-1 transition-colors">{s.delta}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-4 mb-10"
      >
        <button
          onClick={() => navigate('scout')}
          className="group relative bg-brand-boreal text-brand-carbon rounded-2xl p-6 text-left overflow-hidden hover:shadow-2xl hover:shadow-brand-boreal/20 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:translate-x-12 transition-transform duration-500" />
          <p className="text-3xl mb-2">🔍</p>
          <h3 className="font-display font-black text-xl mb-1">Analizar nueva página</h3>
          <p className="text-brand-carbon/60 text-sm">Pega el HTML y el Scout detecta automáticamente todos los puntos de tracking</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
            Iniciar Scout →
          </span>
        </button>

        <div className="grid grid-rows-2 gap-4">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-colors cursor-pointer">
            <span className="text-2xl">📄</span>
            <div>
              <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white transition-colors">Estándar ESES v1.0</h4>
              <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">23 reglas técnicas activas · Prompt sincronizado</p>
            </div>
            <span className="ml-auto text-xs bg-brand-boreal/10 text-brand-boreal px-2 py-1 rounded-lg font-bold">Activo</span>
          </div>
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-colors cursor-pointer">
            <span className="text-2xl">🤖</span>
            <div>
              <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white transition-colors">Motor IA</h4>
              <p className="text-xs text-gray-500 dark:text-white/30 transition-colors">Motor GTMXpert por ESES Agency activo</p>
            </div>
            <span className="ml-auto text-xs bg-brand-boreal/10 text-brand-boreal px-2 py-1 rounded-lg font-bold">Gemini 2.5 Pro</span>
          </div>
        </div>
      </motion.div>

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

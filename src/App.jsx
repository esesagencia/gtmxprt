import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import DashboardHome from './views/DashboardHome'
import ScoutView from './views/ScoutView'
import PlanView from './views/PlanView'

export default function App() {
  const [view, setView] = useState('home')
  const [activeClient, setActiveClient] = useState(null)
  const [activePlan, setActivePlan] = useState(null)
  const [navKey, setNavKey] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const navigate = (to, payload = null) => {
    setNavKey(prev => prev + 1)
    if (to === 'plan') setActivePlan(payload)
    if (to === 'scout') {
      setActiveClient(payload)
      setActivePlan(null)
    }
    if (to === 'home') {
      setActiveClient(null)
      setActivePlan(null)
    }
    setView(to)
  }

  return (
    <div className="min-h-screen bg-brand-slate dark:bg-brand-carbon font-sans text-gray-900 dark:text-white transition-colors duration-300">
      {/* Global Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-white/5 bg-white/90 dark:bg-brand-carbon/90 backdrop-blur-sm transition-colors duration-300">
        <button onClick={() => navigate('home')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-brand-boreal rounded-lg flex items-center justify-center">
            <span className="text-brand-carbon font-display font-black text-xs">GTX</span>
          </div>
          <span className="font-display font-bold tracking-wider text-sm text-gray-900 dark:text-white/90 group-hover:dark:text-white transition-colors">
            GTMXpert
          </span>
          <span className="text-xs text-gray-400 dark:text-white/20 font-sans tracking-widest uppercase">by ESES</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[
              { id: 'home', label: 'Dashboard' },
              { id: 'scout', label: 'Scout' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-widest rounded-lg transition-all ${
                  view === item.id
                    ? 'bg-brand-boreal text-brand-carbon'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-gray-400 hover:text-gray-900 dark:text-white/40 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">
        {view === 'home' && <DashboardHome navigate={navigate} />}
        {view === 'scout' && <ScoutView key={`scout-${activeClient?.id || 'new'}-${navKey}`} navigate={navigate} client={activeClient} />}
        {view === 'plan' && <PlanView key={`plan-${activePlan?.id || 'new'}-${navKey}`} plan={activePlan} navigate={navigate} />}
      </main>
    </div>
  )
}

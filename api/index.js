import express from 'express'
import cors from 'cors'
import { scoutPage } from '../core/scout.js'
import { generateImplementation } from '../core/engine.js'
import * as db from '../core/supabase.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Export as default for Vercel
export default app

// 0. Endpoint: Obtener clientes recientes de Supabase
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.getRecentClients()
    res.json(clients)
  } catch (error) {
    console.error('[API] Error listando clientes:', error)
    res.status(500).json({ error: error.message })
  }
})

// 0b. Endpoint: Obtener todos los planes consolidados de un cliente
app.get('/api/clients/:id/latest-plan', async (req, res) => {
  try {
    console.log(`[API] Buscando todos los planes para cliente ID: ${req.params.id}`)
    const plan = await db.getAllPlansForClient(req.params.id)
    res.json(plan)
  } catch (error) {
    console.error('[API] Error obteniendo último plan:', error)
    res.status(500).json({ error: error.message })
  }
})

// 0c. Endpoint: Obtener el último resultado de Scout
app.get('/api/clients/:id/latest-scout', async (req, res) => {
  try {
    const scout = await db.getLatestScoutForClient(req.params.id)
    res.json(scout)
  } catch (error) {
    console.error('[API] Error obteniendo último scout:', error)
    res.status(500).json({ error: error.message })
  }
})

// 1. Endpoint: Lanza el Scout Agent a una página HTML
app.post('/api/scout', async (req, res) => {
  try {
    const { html_snippet, client } = req.body
    if (!html_snippet) return res.status(400).json({ error: 'Falta html_snippet' })
    
    console.log(`[API] Solicitud Scout recibida para ${client?.name}`)
    
    let inventory = []
    if (client?.name) {
      try {
        const dbClient = await db.saveClient(client)
        inventory = await db.getEventInventory(dbClient.id)
      } catch (dbError) {
        console.error('[API] Error recuperando inventario:', dbError.message)
      }
    }

    const result = await scoutPage(html_snippet, client, inventory)
    
    if (client?.name) {
      try {
        const savedClient = await db.saveClient(client)
        await db.saveScoutResult(savedClient.id, result)
      } catch (dbError) {
        console.error('[API] Error de persistencia Supabase (Scout):', dbError.message)
      }
    }

    res.json(result)
  } catch (error) {
    console.error('[API] Error Scout:', error)
    res.status(500).json({ error: error.message })
  }
})

// 2. Endpoint: Genera la implementación de los eventos seleccionados
app.post('/api/plan', async (req, res) => {
  try {
    const { client, eventsToImplement, htmlContent } = req.body
    
    if (!eventsToImplement || !eventsToImplement.length) {
      return res.status(400).json({ error: 'No events selected' })
    }

    console.log(`[API] Solicitud de Plan recibida para ${eventsToImplement.length} eventos de ${client?.name}`)
    
    const implementations = []

    for (const eventName of eventsToImplement) {
      const payload = {
        client,
        intent: `Produce a complete tracking plan implementation for the event: ${eventName}.`,
        captured: {
          click_element_html: htmlContent || '<p>HTML Context lost.</p>'
        }
      }
      
      const impl = await generateImplementation(payload)
      impl.event_name = eventName
      impl.page = client?.url ? `/${client.url.split('/').slice(1).join('/') || ''}` : "Global"
      
      if (htmlContent && htmlContent.indexOf('<!-- PAGE: ') !== -1) {
        const marker = '<!-- PAGE: ';
        const start = htmlContent.indexOf(marker);
        if (start !== -1) {
          const end = htmlContent.indexOf(' -->', start);
          if (end !== -1) {
            impl.page = htmlContent.substring(start + marker.length, end);
          }
        }
      }

      implementations.push(impl)
    }

    const finalResult = { suggested_events: implementations }

    if (client?.name) {
      const savedClient = await db.saveClient(client)
      await db.saveTrackingPlan(savedClient.id, finalResult)
    }

    res.json(finalResult)
  } catch (error) {
    console.error('[API] Error Plan:', error)
    res.status(500).json({ error: error.message })
  }
})

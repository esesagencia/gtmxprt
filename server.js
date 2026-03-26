import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { scoutPage } from './core/scout.js'
import { generateImplementation } from './core/engine.js'
import * as db from './core/supabase.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

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

// 0b. Endpoint: Obtener el último plan de un cliente
app.get('/api/clients/:id/latest-plan', async (req, res) => {
  try {
    console.log(`[API] Buscando último plan para cliente ID: ${req.params.id}`)
    const plan = await db.getLatestPlanForClient(req.params.id)
    if (plan && plan.suggested_events) {
      console.log(`[API] Plan encontrado para ID: ${req.params.id} (${plan.suggested_events.length} eventos)`)
    } else if (plan) {
      console.log(`[API] Plan hallado pero MALFORMADO (sin suggested_events) para ID: ${req.params.id}`)
    } else {
      console.log(`[API] No se encontró plan para ID: ${req.params.id}`)
    }
    res.json(plan)
  } catch (error) {
    console.error('[API] Error obteniendo último plan:', error)
    res.status(500).json({ error: error.message })
  }
})

// 0c. Endpoint: Obtener el último resultado de Scout
app.get('/api/clients/:id/latest-scout', async (req, res) => {
  try {
    console.log(`[API] Buscando último scout para cliente ID: ${req.params.id}`)
    const scout = await db.getLatestScoutForClient(req.params.id)
    if (scout) {
      console.log(`[API] Scout encontrado para ID: ${req.params.id}`)
    } else {
      console.log(`[API] No se encontró scout para ID: ${req.params.id}`)
    }
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
    
    // Recuperamos el inventario de eventos ya existentes para este cliente
    let inventory = []
    if (client?.name) {
      try {
        const dbClient = await db.saveClient(client)
        inventory = await db.getEventInventory(dbClient.id)
        console.log(`[API] Inventario recuperado para ${client.name}: ${inventory.length} eventos`)
      } catch (dbError) {
        console.error('[API] Error recuperando inventario:', dbError.message)
      }
    }

    const result = await scoutPage(html_snippet, client, inventory)
    
    // Persistencia opcional en Supabase si hay cliente
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

// 2. Endpoint: Genera la implementación de los eventos seleccionados usando el Engine core
app.post('/api/plan', async (req, res) => {
  try {
    const { intent, client, eventsToImplement, htmlContent } = req.body
    
    if (!eventsToImplement || !eventsToImplement.length) {
      return res.status(400).json({ error: 'No events selected' })
    }

    console.log(`[API] Solicitud de Plan recibida para ${eventsToImplement.length} eventos de ${client?.name}`)
    
    const implementations = []

    for (const eventName of eventsToImplement) {
      console.log(`[API] Generando plan para evento: ${eventName}`)
      const payload = {
        client,
        intent: `Produce a complete tracking plan implementation for the event: ${eventName}. Make sure to include all variables, trigger, tags, and validation checklist.`,
        captured: {
          click_element_html: htmlContent || '<p>HTML Context lost in Scout transfer. Derive from standard knowledge.</p>'
        }
      }
      
      const impl = await generateImplementation(payload)
      impl.event_name = eventName
      impl.page = client?.url ? `/${client.url.split('/').slice(1).join('/') || ''}` : "Global"
      
      // Intentar extraer una página más específica si hay contexto de varias páginas
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

    // Persistencia en Supabase
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

const PORT = 3000
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => {
  console.log(`🚀 GTMXpert API Backend corriendo en http://${HOST}:${PORT}`)
})

import express from 'express'
import cors from 'cors'
import { scoutPage } from '../core/scout.js'
import { generateImplementation } from '../core/engine.js'
import * as db from '../core/firebase.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// GET /api/clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.getRecentClients()
    res.json(clients)
  } catch (error) {
    console.error('[API] Error listando clientes:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/clients/:id/latest-plan
app.get('/api/clients/:id/latest-plan', async (req, res) => {
  try {
    const plan = await db.getAllPlansForClient(req.params.id)
    res.json(plan)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/clients/:id/latest-scout
app.get('/api/clients/:id/latest-scout', async (req, res) => {
  try {
    const scout = await db.getLatestScoutForClient(req.params.id)
    res.json(scout)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/scout
app.post('/api/scout', async (req, res) => {
  try {
    const { html_snippet, client } = req.body
    if (!html_snippet) return res.status(400).json({ error: 'Falta html_snippet' })

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
        console.error('[API] Error persistencia Scout:', dbError.message)
      }
    }

    res.json(result)
  } catch (error) {
    console.error('[API] Error Scout:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/plan
app.post('/api/plan', async (req, res) => {
  try {
    const { client, eventsToImplement, eventName, htmlContent, scoutPages } = req.body
    const eventsList = eventsToImplement || (eventName ? [eventName] : [])

    if (!eventsList || !eventsList.length) {
      return res.status(400).json({ error: 'No events selected' })
    }

    const implementations = []

    for (const eventName of eventsList) {
      const payload = {
        client,
        intent: `Produce a complete tracking plan implementation for the event: ${eventName} (detected on page: ${scoutPages?.[eventName] || 'global'}).`,
        captured: {
          click_element_html: htmlContent || '<p>HTML Context lost.</p>'
        }
      }

      const impl = await generateImplementation(payload)
      impl.event_name = eventName
      impl.page = (scoutPages && scoutPages[eventName]) ? scoutPages[eventName] : 'global'

      implementations.push(impl)
    }

    const finalResult = { suggested_events: implementations }

    if (client?.name) {
      const savedClient = await db.saveClient(client)
      await db.saveTrackingPlan(savedClient.id, finalResult)
    }

    // Si es llamada evento a evento (eventName singular), devolver solo la implementación
    if (eventName && !eventsToImplement) {
      res.json(implementations[0])
    } else {
      res.json(finalResult)
    }
  } catch (error) {
    console.error('[API] Error Plan:', error)
    res.status(500).json({ error: error.message })
  }
})

// ⚡ Vercel serverless handler — esto es lo que faltaba
export default function handler(req, res) {
  return app(req, res)
}

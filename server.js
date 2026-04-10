import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { scoutPage } from './core/scout.js'
import { generateImplementation } from './core/engine.js'
import * as db from './core/supabase.js'
import { slimHTML } from './core/slim-utils.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Retry wrapper for LLM calls
async function callLLMWithRetry(systemPrompt, payload, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const provider = process.env.LLM_PROVIDER === 'claude' ? (await import('./core/llm-adapters/claude.js')) : (await import('./core/llm-adapters/gemini.js'));
      return await provider.callLLM(systemPrompt, payload);
    } catch (error) {
      attempt++;
      if (attempt >= retries || !error.message.includes('503')) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[LLM] 503 error, retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Servir archivos estáticos del frontend en producción
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

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
    if (plan && plan.suggested_events) {
      console.log(`[API] Planes agregados para ID: ${req.params.id} (${plan.suggested_events.length} eventos totales)`)
    } else if (plan) {
      console.log(`[API] Planes hallados pero MALFORMADOS (sin suggested_events) para ID: ${req.params.id}`)
    } else {
      console.log(`[API] No se encontraron planes para ID: ${req.params.id}`)
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

// 2. Endpoint: Genera la implementación de un único evento (Granular)
app.post('/api/plan/event', async (req, res) => {
  try {
    const { client, eventName, htmlContent } = req.body
    
    if (!eventName) return res.status(400).json({ error: 'Falta eventName' })

    console.log(`[API] Generando plan para evento INDIVIDUAL: ${eventName} de ${client?.name}`)
    
    const payload = {
      client,
      intent: `Produce a complete tracking plan implementation for the event: ${eventName}. Make sure to include all variables, trigger, tags, and validation checklist.`,
      captured: {
        click_element_html: htmlContent || '<p>HTML Context lost. Derive from standard knowledge.</p>'
      }
    }
    
    const impl = await generateImplementation(payload)
    impl.event_name = eventName
    impl.page = client?.url ? `/${client.url.split('/').slice(1).join('/') || ''}` : "Global"
    
    res.json(impl)
  } catch (error) {
    console.error(`[API] Error Plan Event (${req.body.eventName}):`, error)
    res.status(500).json({ error: error.message })
  }
})

// 2b. Endpoint: Consolida y guarda el plan completo (para persistencia post-granular)
app.post('/api/plan/save', async (req, res) => {
  try {
    const { client, suggested_events } = req.body
    if (!suggested_events || !suggested_events.length) {
      return res.status(400).json({ error: 'No events to save' })
    }

    console.log(`[API] Guardando plan CONSOLIDADO para ${client?.name} (${suggested_events.length} eventos)`)
    
    if (client?.name) {
      const savedClient = await db.saveClient(client)
      const finalResult = { suggested_events }
      await db.saveTrackingPlan(savedClient.id, finalResult)
      res.json({ success: true, client_id: savedClient.id })
    } else {
      res.status(400).json({ error: 'Client identification missing' })
    }
  } catch (error) {
    console.error('[API] Error guardando plan:', error)
    res.status(500).json({ error: error.message })
  }
})

// 2c. Endpoint: Legacy / Bulk Plan (Consolidado)
app.post('/api/plan', async (req, res) => {
  try {
    const { client, eventsToImplement, htmlContent } = req.body
    if (!eventsToImplement || !eventsToImplement.length) {
      return res.status(400).json({ error: 'No events selected' })
    }

    console.log(`[API] Solicitud de Plan BULK recibida para ${eventsToImplement.length} eventos de ${client?.name}`)
    const implementations = []

    for (const eventName of eventsToImplement) {
      const payload = {
        client,
        intent: `Produce a complete tracking plan implementation for the event: ${eventName}.`,
        captured: { click_element_html: htmlContent }
      }
      const impl = await generateImplementation(payload)
      impl.event_name = eventName
      implementations.push(impl)
    }

    const finalResult = { suggested_events: implementations }
    if (client?.name) {
      const savedClient = await db.saveClient(client)
      await db.saveTrackingPlan(savedClient.id, finalResult)
    }
    res.json(finalResult)
  } catch (error) {
    console.error('[API] Error Plan Bulk:', error)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => {
  console.log(`🚀 GTMXpert API corriendo en puerto: ${PORT}`)
})

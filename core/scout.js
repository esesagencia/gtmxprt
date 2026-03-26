import { callLLM as callGemini } from './llm-adapters/gemini.js';
import fs from 'fs/promises';
import path from 'path';

const SCOUT_SYSTEM_PROMPT = `
Eres GTMScout, el agente de prospección de ESES Agency. 
Tu misión es analizar el HTML completo de una página web y detectar "Puntos de Interés" (POI) para el seguimiento de conversiones.

REGLAS DE ORO:
1. IDENTIDAD ESES: Buscamos eventos amplios y consolidados. No queremos 20 eventos si 3 eventos dinámicos pueden cubrirlo todo.
2. DETECCIÓN DE ELEMENTOS: Identifica formularios, botones de descarga, selectores de producto, sliders y navegación principal.
3. ESTRATEGIA DE CONSOLIDACIÓN: Si hay múltiples botones que hacen lo mismo (ej: botones de "Comprar" en un catálogo), agrúpalos en un solo evento sugerido con parámetros que los diferencien.
4. INVENTARIO EXISTENTE: Se te proporcionará una lista de eventos ya detectados anteriormente (INVENTARIO). 
   - No sugieras eventos que ya existan en el inventario para los mismos selectores/elementos.
   - Si detectas algo que parece nuevo pero el selector CSS ya está en el inventario, omítelo.
   - Tu objetivo es identificar SOLO lo que falta por trackear.
5. FORMULARIOS (CRÍTICO): Si detectas un formulario que no esté en el inventario, DEBES EXIGIR SIEMPRE DOS EVENTOS separados en el array: uno para iniciar ("begin_form") y otro para completar ("generate_lead").
6. FORMATO: Devuelve un JSON con una lista de "suggested_events".

ESTRUCTURA DEL OUTPUT:
{
  "page_analysis": "Breve resumen de la estructura de la página",
  "suggested_events": [
    {
      "event_name": "nombre_evento_sugerido",
      "page": "nombre_de_la_pagina",
      "description": "Qué estamos midiendo y por qué lo agrupamos así",
      "priority": "high|medium",
      "rules": ["R01", "R04"],
      "pois": [
         { "selector": "css selector del elemento", "type": "form|link|button|etc", "context": "texto o clase relevante" }
      ],
      "dynamic_parameters": ["param1", "param2"]
    }
  ]
}
`;

export async function scoutPage(htmlContent, clientMetadata = {}, inventory = []) {
    const payload = {
        client: clientMetadata,
        html_snippet: htmlContent.substring(0, 100000), // Safety cap for context window
        existing_inventory: inventory,
        intent: "Identify all NEW trackable POIs on this page according to ESES standards. DO NOT DUPLICATE items already in the existing_inventory."
    };

    console.log(`🔍 Scouting page for POIs (Inventory size: ${inventory.length})...`);
    const rawOutput = await callGemini(SCOUT_SYSTEM_PROMPT, payload);
    
    return parseOutput(rawOutput);
}

function parseOutput(raw) {
    try { return JSON.parse(raw); } catch (e) { }
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
        try { return JSON.parse(match[1]); } catch (e) { }
    }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        try { return JSON.parse(raw.substring(start, end + 1)); } catch (e) { }
    }
    throw new Error('Failed to parse Scout output');
}

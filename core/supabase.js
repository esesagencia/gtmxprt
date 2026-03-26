import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Persistence helpers for GTMXpert
 */

export async function saveClient(clientData) {
    // Normalizamos nombre: minúsculas + trim para evitar duplicados (Venux = venux)
    const name = (clientData.name?.trim() || 'Desconocido').toLowerCase();
    
    // Normalizamos URL: quitamos http(s):// y barra final para que siempre matchee
    let rawUrl = (clientData.url || '').trim();
    if (rawUrl.indexOf('://') !== -1) {
        rawUrl = rawUrl.substring(rawUrl.indexOf('://') + 3);
    }
    if (rawUrl.charAt(rawUrl.length - 1) === '/') {
        rawUrl = rawUrl.substring(0, rawUrl.length - 1);
    }
    const url = rawUrl;
    
    const { data, error } = await supabase
        .from('clients')
        .upsert({ 
            name, 
            url,
            last_updated: new Date().toISOString()
        }, { onConflict: 'name' })
        .select();
    
    if (error) {
        console.error('[Supabase] Error saving client:', error);
        throw error;
    }
    return data[0];
}

export async function saveScoutResult(clientId, resultData) {
    const { data, error } = await supabase
        .from('scout_results')
        .insert({
            client_id: clientId,
            content: resultData,
            created_at: new Date().toISOString()
        })
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function saveTrackingPlan(clientId, planData) {
    const { data, error } = await supabase
        .from('tracking_plans')
        .insert({
            client_id: clientId,
            content: planData,
            created_at: new Date().toISOString()
        })
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function getRecentClients() {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(10);
    
    if (error) throw error;
    return data;
}

export async function getAllPlansForClient(clientId) {
    const { data, error } = await supabase
        .from('tracking_plans')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    // El "plan principal" será el más reciente para heredar propiedades base
    const combinedPlan = { ...data[0].content, suggested_events: [] };
    
    // Combinamos todos los eventos sugeridos de todos los planes generados
    data.forEach(row => {
        if (row.content?.suggested_events) {
            combinedPlan.suggested_events.push(...row.content.suggested_events);
        }
    });
    
    return combinedPlan;
}

export async function getLatestScoutForClient(clientId) {
    const { data, error } = await supabase
        .from('scout_results')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (error) throw error;
    return data[0]?.content || null;
}

export async function getEventInventory(clientId) {
    const { data, error } = await supabase
        .from('tracking_plans')
        .select('content')
        .eq('client_id', clientId);
    
    if (error) throw error;
    
    // Aplanamos todos los eventos sugeridos en una sola lista de inventario
    const inventory = [];
    data.forEach(plan => {
        if (plan.content?.suggested_events) {
            plan.content.suggested_events.forEach(event => {
                inventory.push({
                    event_name: event.event_name,
                    description: event.description,
                    pois: event.pois?.map(p => p.selector) || []
                });
            });
        }
    });
    
    return inventory;
}

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

// ─── Firebase Admin Initialization ───────────────────────────────────────────
// Credentials come exclusively from environment variables (NEVER hardcoded).
// For local dev: set variables in .env (git-ignored).
// For Vercel: set variables in the Vercel dashboard Environment Variables section.

function getFirebaseApp() {
    if (getApps().length > 0) return getApps()[0];

    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error(
            '[Firebase] Missing environment variables. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file.'
        );
    }

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
        }),
    });
}

const app = getFirebaseApp();
const db = getFirestore(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes a client name to be used as a deterministic Firestore document ID.
 * This gives us automatic upsert behaviour (same as Supabase's onConflict:'name').
 */
function normalizeClientId(name) {
    return (name || 'desconocido')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_');
}

/**
 * Normalizes a URL: strips protocol and trailing slash.
 */
function normalizeUrl(rawUrl = '') {
    let url = rawUrl.trim();
    if (url.includes('://')) url = url.substring(url.indexOf('://') + 3);
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
}

// ─── Database Operations ──────────────────────────────────────────────────────

/**
 * Saves (or updates) a client document. Uses the normalized name as the document ID
 * so the same client is never duplicated — equivalent to Supabase's upsert({onConflict:'name'}).
 */
export async function saveClient(clientData) {
    const name = (clientData.name?.trim() || 'Desconocido').toLowerCase();
    const url = normalizeUrl(clientData.url);
    const docId = normalizeClientId(name);

    const ref = db.collection('clients').doc(docId);
    await ref.set({ name, url, last_updated: new Date().toISOString() }, { merge: true });

    const snap = await ref.get();
    return { id: docId, ...snap.data() };
}

/**
 * Saves a Scout analysis result linked to a client.
 */
export async function saveScoutResult(clientId, resultData) {
    const ref = await db.collection('scout_results').add({
        client_id: clientId,
        content: resultData,
        created_at: new Date().toISOString(),
    });
    return { id: ref.id, client_id: clientId, content: resultData };
}

/**
 * Saves a generated Tracking Plan linked to a client.
 */
export async function saveTrackingPlan(clientId, planData) {
    const ref = await db.collection('tracking_plans').add({
        client_id: clientId,
        content: planData,
        created_at: new Date().toISOString(),
    });
    return { id: ref.id, client_id: clientId, content: planData };
}

/**
 * Returns the 10 most recently updated clients.
 */
export async function getRecentClients() {
    const snap = await db.collection('clients').get();
    const clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in memory to avoid needing a Firestore composite index
    clients.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
    return clients.slice(0, 10);
}

/**
 * Returns a merged "combined plan" with all suggested_events from all plans for a client.
 */
export async function getAllPlansForClient(clientId) {
    const snap = await db.collection('tracking_plans')
        .where('client_id', '==', clientId)
        .get();

    if (snap.empty) return null;

    // Sort newest first in memory
    const plans = snap.docs
        .map(d => d.data())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const combinedPlan = { ...plans[0].content, suggested_events: [] };
    plans.forEach(row => {
        if (row.content?.suggested_events) {
            combinedPlan.suggested_events.push(...row.content.suggested_events);
        }
    });

    return combinedPlan;
}

/**
 * Returns the content of the most recent scout result for a client.
 */
export async function getLatestScoutForClient(clientId) {
    const snap = await db.collection('scout_results')
        .where('client_id', '==', clientId)
        .get();

    if (snap.empty) return null;

    // Sort newest first in memory
    const results = snap.docs
        .map(d => d.data())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return results[0]?.content || null;
}

/**
 * Returns a flat inventory of all tracked events for a client across all plans.
 */
export async function getEventInventory(clientId) {
    const snap = await db.collection('tracking_plans')
        .where('client_id', '==', clientId)
        .get();

    const inventory = [];
    snap.docs.forEach(d => {
        const plan = d.data();
        if (plan.content?.suggested_events) {
            plan.content.suggested_events.forEach(event => {
                inventory.push({
                    event_name: event.event_name,
                    description: event.description,
                    pois: event.pois?.map(p => p.selector) || [],
                });
            });
        }
    });
    return inventory;
}

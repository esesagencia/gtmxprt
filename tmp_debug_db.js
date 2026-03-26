import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
    try {
        console.log('--- ALL CLIENTS ---');
        const { data: clients, error: cErr } = await supabase.from('clients').select('*');
        if (cErr) throw cErr;
        console.table(clients);

        console.log('\n--- DATA SUMMARY PER CLIENT ---');
        for (const client of (clients || [])) {
            const { count: scoutCount, error: sErr } = await supabase
                .from('scout_results')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id);
            
            const { count: planCount, error: pErr } = await supabase
                .from('tracking_plans')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id);

            console.log(`Client: "${client.name}" (ID: ${client.id}) -> Scouts: ${scoutCount}, Plans: ${planCount}`);
        }

        console.log('\n--- LATEST SESSIONS (Global) ---');
        const { data: latestPlans } = await supabase.from('tracking_plans').select('id, client_id, created_at').order('created_at', { ascending: false }).limit(5);
        console.table(latestPlans);

    } catch (err) {
        console.error('CRITICAL ERROR DURING DEBUG:', err);
    }
}

debug();

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
    try {
        console.log('--- RECENT CLIENTS ---');
        const { data: clients } = await supabase.from('clients').select('*');
        console.table(clients);

        console.log('\n--- SCOUT RESULTS ---');
        const { data: scouts } = await supabase.from('scout_results').select('id, client_id, created_at');
        console.table(scouts);

        console.log('\n--- TRACKING PLANS ---');
        const { data: plans } = await supabase.from('tracking_plans').select('id, client_id, created_at');
        console.table(plans);

        if (plans && plans.length > 0) {
            const orphanPlans = plans.filter(p => !clients?.find(c => c.id === p.client_id));
            if (orphanPlans.length > 0) {
                console.warn('!!! Found orphan plans (no client match):', orphanPlans.length);
                console.table(orphanPlans);
            } else {
                console.log('All plans have matching clients.');
            }
        }
    } catch (err) {
        console.error(err);
    }
}

debug();

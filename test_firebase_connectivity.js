/**
 * GTMXpert - Firebase Connectivity Test
 *
 * Run with: node test_firebase_connectivity.js
 *
 * This script verifies that the Firebase Admin SDK can connect to Firestore
 * and perform basic CRUD operations using the credentials in your .env file.
 * Check your Firebase console after running this to confirm the test data appears.
 */
import { saveClient, saveScoutResult, saveTrackingPlan, getRecentClients, getAllPlansForClient, getLatestScoutForClient } from './core/firebase.js';

async function run() {
    console.log('\n🔥 GTMXpert — Firebase Connectivity Test\n');

    // 1. Save a test client
    console.log('1️⃣  Saving test client...');
    const client = await saveClient({ name: 'Firebase Test Client', url: 'https://test.example.com' });
    console.log('   ✅ Client saved:', JSON.stringify(client, null, 2));

    // 2. Save a mock scout result
    console.log('\n2️⃣  Saving scout result...');
    const scoutResult = await saveScoutResult(client.id, {
        headline: 'Test Scout',
        suggested_events: [{ event_name: 'test_click', description: 'A test click event' }]
    });
    console.log('   ✅ Scout saved:', scoutResult.id);

    // 3. Save a mock tracking plan
    console.log('\n3️⃣  Saving tracking plan...');
    const plan = await saveTrackingPlan(client.id, {
        suggested_events: [{ event_name: 'test_click', description: 'A test click event', pois: [] }]
    });
    console.log('   ✅ Plan saved:', plan.id);

    // 4. Read back recent clients
    console.log('\n4️⃣  Reading recent clients...');
    const clients = await getRecentClients();
    console.log(`   ✅ Found ${clients.length} client(s). First:`, clients[0]?.name);

    // 5. Read back plans for the test client
    console.log('\n5️⃣  Reading plans for test client...');
    const plans = await getAllPlansForClient(client.id);
    console.log(`   ✅ Combined plan has ${plans?.suggested_events?.length} event(s).`);

    // 6. Read back latest scout
    console.log('\n6️⃣  Reading latest scout for test client...');
    const latestScout = await getLatestScoutForClient(client.id);
    console.log('   ✅ Latest scout headline:', latestScout?.headline);

    console.log('\n🎉 All tests passed! Check your Firebase console to confirm the data.\n');
    console.log('   👉 https://console.firebase.google.com/project/' + process.env.FIREBASE_PROJECT_ID + '/firestore\n');
    process.exit(0);
}

run().catch(err => {
    console.error('\n❌ Firebase connectivity test FAILED:\n', err.message);
    console.error('\n💡 Check that your .env file has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY set correctly.');
    console.error('   Get these from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key\n');
    process.exit(1);
});

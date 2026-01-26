
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');
// ... env loading ...
let envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkOrders() {
    const { error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.log('ORDER ERROR:', error.message);
        if (error.code) console.log('CODE:', error.code);
    } else {
        console.log('ORDERS TABLE EXISTS');
    }
}
checkOrders();

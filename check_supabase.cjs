const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'e:/My Portfolio/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data: certs, error: err1 } = await supabase.from('certifications').select('*');
        const { data: port, error: err2 } = await supabase.from('portfolio_data').select('*').limit(1);
        
        fs.writeFileSync('output.json', JSON.stringify({
            certs,
            err1,
            port,
            err2
        }, null, 2));
    } catch (e) {
        fs.writeFileSync('output.json', JSON.stringify({ error: e.message }));
    }
}
check();

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'e:/My Portfolio/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { error: e1 } = await supabase.from('experience').select('id').limit(1);
        const { error: e2 } = await supabase.from('projects').select('id').limit(1);
        const { error: e3 } = await supabase.from('skills').select('id').limit(1);
        const { error: e4 } = await supabase.from('certifications').select('id').limit(1);
        
        fs.writeFileSync('output-tables.json', JSON.stringify({
            experience: e1 ? e1.message : "OK",
            projects: e2 ? e2.message : "OK",
            skills: e3 ? e3.message : "OK",
            certifications: e4 ? e4.message : "OK"
        }, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();

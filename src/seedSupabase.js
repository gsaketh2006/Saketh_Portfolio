import { supabase } from './lib/supabase';
import { initialData } from './initialData';

export const seedSupabase = async () => {
    console.log('Starting Supabase Seeding...');
    
    try {
        // 1. Seed Portfolio Data (Profile)
        const { error: profileError } = await supabase
            .from('portfolio_data')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000',
                settings: initialData.settings,
                hero: initialData.hero,
                about: initialData.about,
                contact: initialData.contact
            });
        
        if (profileError) throw profileError;
        console.log('✅ Portfolio data seeded.');

        // 2. Seed Experience
        const { error: expError } = await supabase
            .from('experience')
            .insert(initialData.experience.map((exp, i) => ({ ...exp, order_index: i })));
        
        if (expError) console.warn('Experience seeding skipped (might already exist)');
        else console.log('✅ Experience seeded.');

        // 3. Seed Certifications
        const { error: certError } = await supabase
            .from('certifications')
            .insert(initialData.certifications.map((cert, i) => ({ ...cert, order_index: i })));
        
        if (certError) console.warn('Certifications seeding skipped (might already exist)');
        else console.log('✅ Certifications seeded.');

        // 4. Seed Skills
        const flatSkills = [];
        Object.entries(initialData.skills).forEach(([category, skills], catIdx) => {
            skills.forEach((skill, skillIdx) => {
                flatSkills.push({
                    category,
                    skill_name: skill,
                    order_index: (catIdx * 100) + skillIdx
                });
            });
        });
        
        if (flatSkills.length > 0) {
            const { error: skillsError } = await supabase
                .from('skills')
                .insert(flatSkills);
            if (skillsError) console.warn('Skills seeding skipped (might already exist)');
            else console.log('✅ Skills seeded.');
        }

        console.log('🚀 Seeding completed successfully!');
        alert('Database seeded successfully! You can now remove the seed call.');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        alert('Seeding failed. Check console.');
    }
};

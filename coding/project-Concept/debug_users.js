const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rdubzgyjyyumapvifwuq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWJ6Z3lqeXl1bWFwdmlmd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTI0OTAsImV4cCI6MjA4MDg2ODQ5MH0.ZNgFLKO0z5xpASKFAr1uXp8PPmNsdpwN58I7dP6ZIeM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUsers() {
    console.log("Fetching users...");
    const { data, error } = await supabase
        .from('project_users')
        .select('email, first_name, middle_name, last_name, phone');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found users:", data.length);
    data.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`  First: "${user.first_name}"`);
        console.log(`  Middle: "${user.middle_name}"`);
        console.log(`  Last: "${user.last_name}"`);
        console.log(`-------------------`);
    });
}

checkUsers();

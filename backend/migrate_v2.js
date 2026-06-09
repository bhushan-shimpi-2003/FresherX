require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();

    console.log('1. Adding preferred_roles to student_profiles...');
    await client.query(`
      ALTER TABLE public.student_profiles 
      ADD COLUMN IF NOT EXISTS preferred_roles TEXT[] DEFAULT '{}';
    `);

    console.log('2. Creating applied_jobs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.applied_jobs (
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, job_id)
      );

      -- Enable RLS
      ALTER TABLE public.applied_jobs ENABLE ROW LEVEL SECURITY;

      -- Policies for applied_jobs
      CREATE POLICY "Users can view their own applied jobs" 
        ON public.applied_jobs FOR SELECT 
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own applied jobs" 
        ON public.applied_jobs FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    `);
    
    // Also add RLS policies for Service Role just in case
    await client.query(`
      CREATE POLICY "Service role full access on applied_jobs" 
        ON public.applied_jobs FOR ALL 
        USING (true) WITH CHECK (true);
    `);

    console.log('Reloading PostgREST schema cache...');
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log('✅ Migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();

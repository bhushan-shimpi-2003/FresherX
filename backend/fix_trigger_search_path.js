require('dotenv').config();
const { Client } = require('pg');

async function fixTrigger() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    console.log('Fixing trigger function to use explicit schema...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER 
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name',
          COALESCE(NEW.raw_user_meta_data->>'role', 'student')
        );

        -- Create role-specific profile
        IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
          INSERT INTO public.student_profiles (user_id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
        ELSIF NEW.raw_user_meta_data->>'role' = 'recruiter' THEN
          INSERT INTO public.recruiter_profiles (user_id, full_name, email)
          VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
        END IF;

        RETURN NEW;
      END;
      $$;
    `);
    
    console.log('✅ Trigger fixed successfully!');
  } catch (err) {
    console.error('❌ Error fixing trigger:', err);
  } finally {
    await client.end();
  }
}

fixTrigger();

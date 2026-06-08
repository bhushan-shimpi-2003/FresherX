import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_fresherx_change_me';

// ==========================================
// REGISTER ROUTE
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role !== 'student' && role !== 'recruiter') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // 1. Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. Insert into profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        email,
        password_hash,
        full_name: fullName,
        role
      })
      .select('*')
      .single();

    if (profileError) {
      console.error('Registration Profile Error:', profileError);
      if (profileError.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: 'Error creating profile' });
    }

    // 3. Create role-specific profile
    if (role === 'student') {
      const { error: studentError } = await supabaseAdmin
        .from('student_profiles')
        .insert({ user_id: profile.id, full_name: fullName });
      
      if (studentError) console.error('Student Profile Error:', studentError);
    } else if (role === 'recruiter') {
      const { error: recruiterError } = await supabaseAdmin
        .from('recruiter_profiles')
        .insert({ user_id: profile.id, full_name: fullName, email });
      
      if (recruiterError) console.error('Recruiter Profile Error:', recruiterError);
    }

    // 4. Generate custom JWT
    const token = jwt.sign(
      { 
        sub: profile.id, 
        email: profile.email, 
        role: profile.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // 5. Respond with user and token (mimicking Supabase's format roughly)
    res.status(201).json({
      session: {
        access_token: token,
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: {
            full_name: profile.full_name,
            role: profile.role
          }
        }
      }
    });

  } catch (err) {
    console.error('Registration Exception:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // 1. Fetch user from profiles table
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !profile) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, profile.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // 3. Generate custom JWT
    const token = jwt.sign(
      { 
        sub: profile.id, 
        email: profile.email, 
        role: profile.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Respond
    res.status(200).json({
      session: {
        access_token: token,
        user: {
          id: profile.id,
          email: profile.email,
          user_metadata: {
            full_name: profile.full_name,
            role: profile.role
          }
        }
      }
    });

  } catch (err) {
    console.error('Login Exception:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { sensitiveRouteLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_fresherx_change_me';

// ==========================================
// ==========================================
// REGISTER ROUTE
// ==========================================
router.post('/register', sensitiveRouteLimiter, async (req, res) => {
  try {
    const { email, password, fullName, role, posterType } = req.body;

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
        role,
        poster_type: posterType
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
// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', sensitiveRouteLimiter, async (req, res) => {
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

// ==========================================
// ==========================================
// UPDATE PASSWORD ROUTE
// ==========================================
router.put('/update-password', requireAuth, sensitiveRouteLimiter, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // 1. Fetch current profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, profile.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // 3. Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 4. Update password
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      console.error('Password Update Error:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update Password Exception:', err);
    res.status(500).json({ error: 'Internal server error during password update' });
  }
});

export default router;

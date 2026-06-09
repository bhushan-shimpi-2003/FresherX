-- FresherX Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_modified_column function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- PROFILES (base user table)
-- ============================================================
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'recruiter', 'admin')) DEFAULT 'student',
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT PROFILES
-- ============================================================
CREATE TABLE student_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar TEXT,

  -- Education
  college TEXT,
  degree TEXT,
  branch TEXT,
  passing_year INTEGER,
  cgpa NUMERIC(3,2),

  -- Skills & Preferences
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  preferred_job_types TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_salary_min INTEGER,

  -- Resume
  resume_url TEXT,
  resume_name TEXT,

  -- Meta
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  profile_complete BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  location TEXT,
  description TEXT NOT NULL,
  linked_in TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECRUITER PROFILES
-- ============================================================
CREATE TABLE recruiter_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  designation TEXT,
  avatar TEXT,
  company_id UUID REFERENCES companies(id),

  -- Verification
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verification_note TEXT,
  verified_at TIMESTAMPTZ,

  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  skills TEXT[] DEFAULT '{}',
  job_type TEXT NOT NULL CHECK (job_type IN ('Full-time', 'Part-time', 'Internship', 'Freelance', 'Remote')),
  experience_level TEXT DEFAULT 'Fresher',
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'INR',
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  apply_link TEXT NOT NULL,
  deadline TIMESTAMPTZ,

  -- Relations
  recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')) DEFAULT 'pending',
  rejection_reason TEXT,

  -- Analytics
  views INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED JOBS
-- ============================================================
CREATE TABLE saved_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, job_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_job', 'deadline', 'saved_job', 'application', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('spam_job', 'fake_recruiter', 'complaint')),
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('job', 'recruiter', 'user')),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved', 'dismissed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users can only read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Student profiles
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can manage own profile" ON student_profiles FOR ALL USING (auth.uid() = user_id);

-- Companies: verified recruiters can manage
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (TRUE);
CREATE POLICY "Recruiters can manage their companies" ON companies FOR ALL USING (auth.uid() = created_by);

-- Recruiter profiles
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters can manage own profile" ON recruiter_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all recruiter profiles" ON recruiter_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Jobs: public read for published, recruiter write
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published jobs" ON jobs FOR SELECT USING (status = 'published');
CREATE POLICY "Recruiters can manage their jobs" ON jobs FOR ALL USING (auth.uid() = recruiter_id);
CREATE POLICY "Admins can manage all jobs" ON jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Saved jobs: per-user
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = student_id);

-- Notifications: per-user
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports: users can create, admins can manage
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can view their reports" ON reports FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Admins can manage all reports" ON reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- STORAGE BUCKETS (run in Storage > Buckets)
-- ============================================================
-- Trigger for tracking updated_at for recruiter_profiles
CREATE TRIGGER update_recruiter_profiles_updated_at
  BEFORE UPDATE ON recruiter_profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
-- ============================================================
-- EPIC 1: CHAT & FOLLOWS SCHEMA
-- ============================================================

-- 1. CHAT REQUESTS
CREATE TABLE chat_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message TEXT, -- Optional initial message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_chat_requests_updated_at
  BEFORE UPDATE ON chat_requests
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 2. CHAT THREADS
CREATE TABLE chat_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON chat_threads
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 3. CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'job_card', 'referral_request', 'system')) DEFAULT 'text',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FOLLOWS
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Chat Requests
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their chat requests" ON chat_requests 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create chat requests" ON chat_requests 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update chat requests" ON chat_requests 
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Chat Threads
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their threads" ON chat_threads 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create threads" ON chat_threads 
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their threads" ON chat_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE chat_threads.id = chat_messages.thread_id 
      AND (chat_threads.user1_id = auth.uid() OR chat_threads.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can insert messages in their threads" ON chat_messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update message read status" ON chat_messages 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_threads 
      WHERE chat_threads.id = chat_messages.thread_id 
      AND (chat_threads.user1_id = auth.uid() OR chat_threads.user2_id = auth.uid())
    )
  );

-- Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view follows" ON follows 
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can follow others" ON follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows 
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================
-- SUPABASE REALTIME
-- ============================================================
-- (Assuming the publication exists, this adds the tables to it)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
-- ============================================================
-- EPIC 2: PUSH NOTIFICATIONS
-- ============================================================

-- Add FCM Token to profiles to support Firebase Cloud Messaging
ALTER TABLE profiles ADD COLUMN fcm_token TEXT;

-- Index the fcm_token for faster lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);
-- ============================================================
-- EPIC 4: REFERRAL SYSTEM UPDATES
-- ============================================================

-- Add referral fields to the jobs table
ALTER TABLE jobs ADD COLUMN referral_available BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN referral_slots INTEGER DEFAULT 0;

-- Optional constraint to ensure slots are non-negative
ALTER TABLE jobs ADD CONSTRAINT check_referral_slots CHECK (referral_slots >= 0);
-- ============================================================
-- PHASE 2, EPIC 1: RECRUITER SUB-TYPES
-- ============================================================

-- Create the ENUM type for recruiter sub-types
CREATE TYPE poster_type AS ENUM ('JOB_POSTER');

-- Add poster_type to profiles
ALTER TABLE profiles ADD COLUMN poster_type poster_type;

-- Optional: Add verification notes column if not already present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_note TEXT;
-- ============================================================
-- PHASE 2, EPIC 1: AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'user_approval', 'user_suspension', 'job_rejection', 'job_approval'
    target_id UUID NOT NULL, -- The ID of the user or job affected
    target_type VARCHAR(50) NOT NULL, -- 'user' or 'job'
    metadata JSONB, -- Additional details (e.g., rejection reason)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" 
    ON audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" 
    ON audit_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
-- ============================================================
-- PHASE 2, EPIC 2: SKILL VERIFICATIONS
-- ============================================================

CREATE TABLE skill_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, skill) -- Prevent multiple passes/records for the same skill without logic
);

-- RLS Policies
ALTER TABLE skill_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill verifications" 
    ON skill_verifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified skills of users" 
    ON skill_verifications FOR SELECT 
    USING (passed = true);

-- In a real app, inserts would be secured by Edge Functions handling the grading,
-- but for now we allow authenticated users to insert their own attempts.
CREATE POLICY "Users can insert their own attempts" 
    ON skill_verifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
-- ============================================================
-- PHASE 2, EPIC 3: JOB ALERTS
-- ============================================================

CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword VARCHAR(255),
    skills TEXT[],
    job_type VARCHAR(100),
    is_remote BOOLEAN,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alerts" 
    ON job_alerts FOR ALL 
    USING (auth.uid() = user_id);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_job_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_alerts_timestamp
BEFORE UPDATE ON job_alerts
FOR EACH ROW EXECUTE FUNCTION update_job_alerts_updated_at();

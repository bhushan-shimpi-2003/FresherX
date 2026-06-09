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

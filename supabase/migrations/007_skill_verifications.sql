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

-- ============================================================
-- PHASE 3, EPIC 3: COMMUNITY FEATURES
-- ============================================================

-- Table for Anonymous Salary Submissions
CREATE TABLE salary_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    salary_amount INTEGER NOT NULL,
    salary_currency VARCHAR(10) DEFAULT 'INR',
    experience_level VARCHAR(50) DEFAULT 'Fresher',
    location VARCHAR(255),
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Keeping user ID optional for anonymity
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for Hire Celebrations Feed
CREATE TABLE hire_celebrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    recruiter_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- For referral/hiring attribution
    message TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE salary_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_celebrations ENABLE ROW LEVEL SECURITY;

-- Anyone can read salaries
CREATE POLICY "Anyone can view salary insights" 
    ON salary_insights FOR SELECT USING (true);

-- Authenticated users can submit salaries
CREATE POLICY "Authenticated users can submit salary insights" 
    ON salary_insights FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can read hire celebrations
CREATE POLICY "Anyone can view hire celebrations" 
    ON hire_celebrations FOR SELECT USING (true);

-- Authenticated users can create their own celebrations
CREATE POLICY "Users can create hire celebrations" 
    ON hire_celebrations FOR INSERT WITH CHECK (auth.uid() = student_id);

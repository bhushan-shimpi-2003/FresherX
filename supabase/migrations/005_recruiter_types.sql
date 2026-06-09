-- ============================================================
-- PHASE 2, EPIC 1: RECRUITER SUB-TYPES
-- ============================================================

-- Create the ENUM type for recruiter sub-types
CREATE TYPE poster_type AS ENUM ('JOB_POSTER');

-- Add poster_type to profiles
ALTER TABLE profiles ADD COLUMN poster_type poster_type;

-- Optional: Add verification notes column if not already present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_note TEXT;

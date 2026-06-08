-- ============================================================
-- EPIC 4: REFERRAL SYSTEM UPDATES
-- ============================================================

-- Add referral fields to the jobs table
ALTER TABLE jobs ADD COLUMN referral_available BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN referral_slots INTEGER DEFAULT 0;

-- Optional constraint to ensure slots are non-negative
ALTER TABLE jobs ADD CONSTRAINT check_referral_slots CHECK (referral_slots >= 0);

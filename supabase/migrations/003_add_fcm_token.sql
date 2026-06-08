-- ============================================================
-- EPIC 2: PUSH NOTIFICATIONS
-- ============================================================

-- Add FCM Token to profiles to support Firebase Cloud Messaging
ALTER TABLE profiles ADD COLUMN fcm_token TEXT;

-- Index the fcm_token for faster lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token ON profiles(fcm_token);

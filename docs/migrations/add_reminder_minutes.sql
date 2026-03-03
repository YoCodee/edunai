-- Migration: Add reminder_minutes to events table
-- Run this in Supabase SQL Editor

ALTER TABLE events
ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT NULL;

-- Optional: add index for reminder queries
-- CREATE INDEX IF NOT EXISTS idx_events_reminder ON events(reminder_minutes) WHERE reminder_minutes IS NOT NULL;

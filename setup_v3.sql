-- PatientVoice V3 Database Migration: Add Doctor Contact Details
-- Run this in your Supabase SQL Editor.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS doctor_name text,
ADD COLUMN IF NOT EXISTS doctor_email text;

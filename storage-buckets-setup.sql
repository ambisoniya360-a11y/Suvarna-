-- ============================================================
-- SQL PATCH: Setup Supabase Storage Buckets and RLS Policies
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('documents', 'documents', true),
  ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Drop existing conflicting policies on storage.objects if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- 3. Create RLS policies for storage.objects

-- Allow logged-in (authenticated) users to upload files to 'documents' and 'photos' buckets
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'photos'));

-- Allow logged-in (authenticated) users to read/download files from both buckets
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('documents', 'photos'));

-- Allow anyone (public/anonymous users) to read/download files from the public 'photos' bucket
CREATE POLICY "Allow public read of photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'photos');

-- Allow anyone (public/anonymous users) to read/download files from the public 'documents' bucket
CREATE POLICY "Allow public read of documents" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'documents');


-- Allow logged-in (authenticated) users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('documents', 'photos') AND owner = auth.uid())
  WITH CHECK (bucket_id IN ('documents', 'photos') AND owner = auth.uid());

-- Allow logged-in (authenticated) users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('documents', 'photos') AND owner = auth.uid());


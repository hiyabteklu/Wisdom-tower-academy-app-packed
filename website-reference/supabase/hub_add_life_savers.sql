-- ============================================================
-- Add hub: life-savers to learning_resources constraint
-- Run in Supabase → SQL Editor (after deploy)
-- Safe to re-run.
-- ============================================================

-- 1) Drop old check constraint if it exists
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT c.conname INTO con_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.relname = 'learning_resources'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%hub%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.learning_resources DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

-- 2) New check constraint including life-savers
ALTER TABLE public.learning_resources
  ADD CONSTRAINT learning_resources_hub_check
  CHECK (hub in (
    'books',
    'short-notes',
    'videos',
    'flashcards',
    'question-banks',
    'exams',
    'life-savers'
  ));

-- Verify:
-- SELECT hub, count(*) FROM learning_resources GROUP BY hub ORDER BY hub;

-- Freshman subject rename + new courses
-- Safe to re-run. Run in Supabase SQL editor after deploying the app rename.
--
-- App changes:
--   mathematics  → math-natural  (Math Natural)
--   NEW          → math-social   (Math Social)
--   NEW          → physical-fitness (Physical Fitness)
--
-- Content hubs per subject (unchanged structure):
--   scope_path = freshman/{subject-id}
--   hub in (books, references, videos, flashcards, question-banks, exams)

-- 1) Migrate learning content from old mathematics scope
UPDATE learning_resources
SET scope_path = 'freshman/math-natural',
    updated_at = now()
WHERE scope_path = 'freshman/mathematics';

-- 2) Migrate academic_results scope_id if you used "freshman/mathematics"
UPDATE academic_results
SET scope_id = 'freshman/math-natural'
WHERE scope_id = 'freshman/mathematics';

-- 3) Optional: any progress rows are tied to resource_id (UUID),
--    so they follow automatically when resources keep the same ids.

-- 4) New subjects need no seed rows — empty hubs are valid.
--    Upload content in Admin → Content library → Freshman →
--      Math Natural | Math Social | Physical Fitness → [hub]

-- 5) Thumbnail files (Git, not SQL):
--    public/images/freshman/math-natural.jpg
--    public/images/freshman/math-social.jpg
--    public/images/freshman/physical-fitness.jpg

-- Verify
-- SELECT scope_path, hub, count(*) FROM learning_resources
-- WHERE scope_path LIKE 'freshman/%'
-- GROUP BY 1, 2 ORDER BY 1, 2;

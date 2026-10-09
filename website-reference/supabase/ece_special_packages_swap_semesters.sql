-- ECE Special Packages Semester Course Swap Migration
-- Swaps Semester 1 and Semester 2 courses to align with actual curriculum:
--
-- Semester 1 Courses:
--   - ECEg3071 (Applied Electronics II)
--   - Econ1011 (Economics)
--   - ECEg3051 (Electromagnetic Fields)
--   - ECEg3081 (Signals and Systems Analysis)
--   - ECEg3073 (Electrical Engineering Laboratory III)
--   - ECEg3101 (Object Oriented Programming)
--   - ECEg3061 (Computational Methods)
--
-- Semester 2 Courses:
--   - MEng3052 (Engineering Thermodynamics)
--   - ECEg3082 (Network Analysis and Synthesis)
--   - ECEg3092 (Introduction to Electrical Machines)
--   - ECEg3094 (Electrical Engineering Lab IV)
--   - ECEg3102 (Digital Logic Design)
--   - ECEg3052 (Electrical Materials and Technology)
--   - ECEg3096 (Electrical Workshop Practice II)

-- Step 1: Update learning_resources table if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_resources') THEN
    -- Move Semester 1 courses that were accidentally marked as sem-2 into sem-1
    UPDATE public.learning_resources
    SET scope_path = REPLACE(scope_path, 'ece/sem-2/', 'ece/sem-1/'),
        package_id = 'ece-y3-sem-1',
        updated_at = now()
    WHERE scope_path LIKE 'ece/sem-2/%'
      AND (
        scope_path LIKE '%eceg3071%' OR
        scope_path LIKE '%econ1011%' OR
        scope_path LIKE '%eceg3051%' OR
        scope_path LIKE '%eceg3081%' OR
        scope_path LIKE '%eceg3073%' OR
        scope_path LIKE '%eceg3101%' OR
        scope_path LIKE '%eceg3061%'
      );

    -- Move Semester 2 courses that were accidentally marked as sem-1 into sem-2
    UPDATE public.learning_resources
    SET scope_path = REPLACE(scope_path, 'ece/sem-1/', 'ece/sem-2/'),
        package_id = 'ece-y3-sem-2',
        updated_at = now()
    WHERE scope_path LIKE 'ece/sem-1/%'
      AND (
        scope_path LIKE '%meng3052%' OR
        scope_path LIKE '%eceg3082%' OR
        scope_path LIKE '%eceg3092%' OR
        scope_path LIKE '%eceg3094%' OR
        scope_path LIKE '%eceg3102%' OR
        scope_path LIKE '%eceg3052%' OR
        scope_path LIKE '%eceg3096%'
      );
  END IF;
END $$;

-- Step 2: Update academic_results table if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'academic_results') THEN
    -- Migrate Semester 1 courses
    UPDATE public.academic_results
    SET scope_path = REPLACE(scope_path, 'ece/sem-2/', 'ece/sem-1/'),
        scope_id = REPLACE(scope_id, 'sem-2-', 'sem-1-')
    WHERE (scope_path LIKE 'ece/sem-2/%' OR scope_id LIKE '%sem-2-%')
      AND (
        scope_path LIKE '%eceg3071%' OR scope_id LIKE '%eceg3071%' OR
        scope_path LIKE '%econ1011%' OR scope_id LIKE '%econ1011%' OR
        scope_path LIKE '%eceg3051%' OR scope_id LIKE '%eceg3051%' OR
        scope_path LIKE '%eceg3081%' OR scope_id LIKE '%eceg3081%' OR
        scope_path LIKE '%eceg3073%' OR scope_id LIKE '%eceg3073%' OR
        scope_path LIKE '%eceg3101%' OR scope_id LIKE '%eceg3101%' OR
        scope_path LIKE '%eceg3061%' OR scope_id LIKE '%eceg3061%'
      );

    -- Migrate Semester 2 courses
    UPDATE public.academic_results
    SET scope_path = REPLACE(scope_path, 'ece/sem-1/', 'ece/sem-2/'),
        scope_id = REPLACE(scope_id, 'sem-1-', 'sem-2-')
    WHERE (scope_path LIKE 'ece/sem-1/%' OR scope_id LIKE '%sem-1-%')
      AND (
        scope_path LIKE '%meng3052%' OR scope_id LIKE '%meng3052%' OR
        scope_path LIKE '%eceg3082%' OR scope_id LIKE '%eceg3082%' OR
        scope_path LIKE '%eceg3092%' OR scope_id LIKE '%eceg3092%' OR
        scope_path LIKE '%eceg3094%' OR scope_id LIKE '%eceg3094%' OR
        scope_path LIKE '%eceg3102%' OR scope_id LIKE '%eceg3102%' OR
        scope_path LIKE '%eceg3052%' OR scope_id LIKE '%eceg3052%' OR
        scope_path LIKE '%eceg3096%' OR scope_id LIKE '%eceg3096%'
      );
  END IF;
END $$;

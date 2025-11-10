-- Query para ver la constraint de civil_status en user_profiles

-- Ver la definición de la constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'user_profiles'
  AND con.contype = 'c' -- check constraint
  AND con.conname LIKE '%civil_status%';

-- Ver todos los constraints de la tabla
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'user_profiles'
ORDER BY con.conname;


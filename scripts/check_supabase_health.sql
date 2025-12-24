-- Check if auth schema is properly set up
SELECT 
  n.nspname as schema_name,
  t.typname as type_name
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'auth'
LIMIT 10;

-- Check auth functions
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'auth' AND p.proname IN ('jwt_extract_claim', 'jwt_encode')
LIMIT 5;

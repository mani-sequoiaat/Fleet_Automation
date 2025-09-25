SELECT id, filename, created_at, filepath
FROM "Audit".file_details
WHERE filename ILIKE 'em-fleet-%' and created_at::date = CURRENT_DATE
ORDER BY id DESC
LIMIT 1;

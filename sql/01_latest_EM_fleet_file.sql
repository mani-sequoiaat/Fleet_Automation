SELECT id, filename, created_at
FROM "Audit".file_details
WHERE filename ILIKE 'em-fleet-%'
ORDER BY id DESC
LIMIT 1;

SELECT
  b.id,
  b.guid,
  b.batch_type_id,
  bt.name AS batch_type_name,
  b.status_type_id,
  st.name AS status_type_name,
  b.start_datetime,
  b.end_datetime,
  b.created_at,
  b.updated_at,
  b.file_id
FROM "Audit".batch b
LEFT JOIN "Audit".types bt ON b.batch_type_id = bt.id
LEFT JOIN "Audit".types st ON b.status_type_id = st.id
WHERE b.file_id = $1
ORDER BY b.id DESC;

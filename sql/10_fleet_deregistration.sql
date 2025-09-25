

-- SELECT 
--   f.license_plate_number,
--   f.license_plate_state
--   -- f.fleet_end_date
--   -- f.registration_end_date,
--   -- f.is_active,
--   -- f.created_at,
--   -- f.updated_at
-- FROM 
--   "FleetAgency".fleet f
-- where 
--   f.fleet_end_date IS NOT NULL
--   AND f.registration_end_date = current_date
--   AND EXISTS (
--     SELECT 1
--     FROM "FleetAgency".s_fleet_delta sfd 
--     WHERE f.license_plate_number = sfd.license_plate_number 
--       AND f.license_plate_state = sfd.license_plate_state 
--       AND sfd.action_to_be_taken_id = 9
--       AND sfd.created_at > f.fleet_end_date
--       AND sfd.created_at <= (f.fleet_end_date + 4)
--   );


SELECT
  f.license_plate_number,
  f.license_plate_state,
  f.fleet_end_date,
  f.registration_end_date,
  f.is_active,
  f.created_at,
  f.updated_at
FROM
  "FleetAgency".fleet f
INNER JOIN
  "FleetAgency".s_fleet_delta sfd
    ON f.license_plate_number = sfd.license_plate_number
   AND f.license_plate_state = sfd.license_plate_state
WHERE
  sfd.action_to_be_taken_id = 9
  AND f.is_active = FALSE
  AND f.fleet_end_date IS not NULL and f.fleet_end_date = current_date - INTERVAL '3 days'
  AND f.updated_at::DATE = CURRENT_DATE

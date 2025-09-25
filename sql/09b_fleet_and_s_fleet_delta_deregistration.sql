SELECT DISTINCT ON (fd.license_plate_number, fd.license_plate_state) *
FROM "FleetAgency".s_fleet_delta fd
WHERE fd.action_to_be_taken_id = 9
  AND fd.created_at::date = current_date - INTERVAL '4 days'
  AND EXISTS (
      SELECT 1
      FROM "FleetAgency".fleet sf
      WHERE sf.license_plate_number = fd.license_plate_number
        AND sf.license_plate_state = fd.license_plate_state
  )
ORDER BY fd.license_plate_number, fd.license_plate_state, fd.created_at DESC;
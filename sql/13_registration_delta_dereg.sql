SELECT DISTINCT ON (sfd.license_plate_number, sfd.license_plate_state)
  sfd.*
FROM "FleetRegistration".registrations_delta sfd
WHERE sfd.registration_end_date IS NOT NULL 
  AND EXISTS (
    SELECT 1
    FROM "FleetAgency".s_fleet_delta AS sf
    WHERE sf.license_plate_number = sfd.license_plate_number
      AND sf.license_plate_state = sfd.license_plate_state
      AND sf.make = sfd.make
      AND sf.model = sfd.model
      AND sf.color = sfd.color
      AND sf.action_to_be_taken_id = 9
      AND sf.created_at::date = current_date - INTERVAL '4 days'
)
ORDER BY sfd.license_plate_number, sfd.license_plate_state, sfd.created_at DESC;

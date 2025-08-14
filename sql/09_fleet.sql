SELECT 
  f.license_plate_number,
  f.license_plate_state
  
FROM 
  "FleetAgency".fleet f
INNER JOIN 
  "FleetAgency".s_fleet_delta sfd 
    ON f.license_plate_number = sfd.license_plate_number 
   AND f.license_plate_state = sfd.license_plate_state 
WHERE 
  sfd.action_to_be_taken_id = 8
  AND f.is_active = FALSE
  AND f.fleet_end_date IS NULL
  AND f.created_at::DATE = CURRENT_DATE
  OR f.updated_at::DATE = CURRENT_DATE
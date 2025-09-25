SELECT * 
FROM "FleetAgency".fleet fd
WHERE fd.registration_end_date is not null and EXISTS (
SELECT 1
        FROM "FleetAgency".s_fleet_delta AS sf
        WHERE sf.license_plate_number = fd.license_plate_number
        AND sf.license_plate_state = fd.license_plate_state
       AND sf.action_to_be_taken_id = 9
        AND sf.created_at::date = current_date - INTERVAL '4 days'
)
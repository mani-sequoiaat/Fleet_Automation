-- Fetch fleet records created today and are active
SELECT 
    license_plate_number,
    license_plate_state
FROM "FleetAgency".fleet
WHERE is_active = TRUE
  AND created_at::date = CURRENT_DATE
ORDER BY license_plate_number;

SELECT 
  rd.license_plate_number,
  rd.license_plate_state,
  rd.registration_start_date,
  rd.year,
  rd.make,
  rd.model,
  rd.color
FROM 
  "FleetRegistration".registrations_delta rd
INNER JOIN 
  "FleetRegistration".registrations r 
    ON rd.license_plate_number = r.license_plate_number 
   AND rd.license_plate_state = r.license_plate_state 
   AND rd.make = r.make
    AND rd.model = r.model
    AND rd.color = r.color
    AND rd.year = r.year
   AND rd.registration_start_date = r.registration_start_date

WHERE 
  rd.batch_id = $1 
  AND r.registration_account_id = 1
  AND rd.registration_start_date = CURRENT_DATE;
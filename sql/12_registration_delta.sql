SELECT license_plate_number, 
license_plate_state ,
license_plate_country,
make,
model,
year,
color
FROM "FleetRegistration".registrations_delta WHERE batch_id = $1;

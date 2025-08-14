SELECT license_plate_number,
license_plate_state,
year,
make,
model,
color,
vin
FROM "FleetAgency".fleet_history WHERE file_id = $1;
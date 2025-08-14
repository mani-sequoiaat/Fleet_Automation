SELECT license_plate_number,
license_plate_state,
year,
make,
model,
color,
vin
FROM "FleetAgency".s_fleet_delta WHERE batch_id = $1;

WITH valid_records AS (
    SELECT
        sf.brand,
        sf.ody_vehicle_id_number,
        sf.license_plate_state,
        sf.license_plate_number,
        sf.year,
        sf.model,
        sf.make,
        sf.color,
        sf.vin,
        sf.vehicle_erac
    FROM "FleetAgency".s_fleet sf
    WHERE sf.batch_id = $1
      AND sf.license_plate_number IS NOT NULL
      AND sf.license_plate_state IS NOT NULL
      AND CHAR_LENGTH(sf.license_plate_state) = 2
      AND CHAR_LENGTH(sf.license_plate_number) < 12

)
SELECT *
FROM valid_records;



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
      AND sf.license_plate_number = TRIM(sf.license_plate_number)
      AND sf.license_plate_state = TRIM(sf.license_plate_state)
      AND CHAR_LENGTH(sf.license_plate_state) = 2
      AND CHAR_LENGTH(sf.license_plate_number) < 12
      AND sf.license_plate_number ~ '^[A-Za-z0-9 -]*$'
      AND sf.license_plate_state ~ '^[A-Za-z]+$'
)
SELECT *
FROM valid_records;


-- SELECT sf.brand,
--        sf.ody_vehicle_id_number,
--        sf.license_plate_state,
--        sf.license_plate_number,
--        sf.year,
--        sf.model,
--        sf.make,
--        sf.color,
--        sf.vin,
--        sf.vehicle_erac
-- FROM "FleetAgency".s_fleet sf
-- WHERE batch_id = $1;

--   AND (year IS NULL OR year = '');

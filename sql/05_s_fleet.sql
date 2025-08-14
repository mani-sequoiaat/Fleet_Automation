WITH
valid_records AS (
    SELECT
        sf.license_plate_state,
        sf.license_plate_number
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
),
record_counts AS (
    SELECT
        license_plate_state,
        license_plate_number,
        COUNT(*) OVER (
            PARTITION BY license_plate_state, license_plate_number
        ) AS total_count
    FROM valid_records
)
SELECT
    license_plate_number,
    license_plate_state
FROM record_counts
WHERE total_count = 1;

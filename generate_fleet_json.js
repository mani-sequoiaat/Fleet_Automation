const fs = require('fs');
const { parse } = require('csv-parse');

const csvFilePath = 'C:\\Users\\SAT-0066\\Downloads\\em-fleet-08-13-2025-12-10.csv';

// Mapping for s_fleet_error table
const errorColumnMapping = {
  brand: 0,
  ody_vehicle_id_number: 1,
  license_plate_number: 2,
  license_plate_state: 3,
  year: 4,
  make: 5,
  model: 6,
  color: 7,
  vin: 8,
  location_group: 9,
  location_code: 10,
  location_name: 11,
  address_1: 12,
  address_2: 13,
  city: 14,
  state: 15,
  zip: 16,
  phone_number: 17,
  vehicle_erac: 18
};

// Mapping for s_fleet_delta table
const s_fleet_delta_mapping = {
  license_plate_number: 2,
  license_plate_state: 3,
  year: 4,
  make: 5,
  model: 6,
  color: 7,
  vin: 8
};

// Mapping for fleet records (only LPN and LPS)
const fleetmapping = {
  license_plate_number: 2,
  license_plate_state: 3,
};

// Row number ranges
const ranges = {
  infleet: { start: 4416, end: 4515 },
  defleet: { start: 4406, end: 4415 },
  update: { start: 4396, end: 4405 },
  error: { start: 4516, end: 4517 }
};

// Helper: check if row index is within a range
function isInRange(sno, range) {
  return sno >= range.start && sno <= range.end;
}

// Helper: map full s_fleet_delta record
function mapSFleetDelta(row) {
  const mapped = {};
  for (const [key, idx] of Object.entries(s_fleet_delta_mapping)) {
    mapped[key] = row[idx] ?? null;
  }
  return mapped;
}

// Helper: map only LPN and LPS for fleet records
function mapFleet(row) {
  const mapped = {};
  for (const [key, idx] of Object.entries(fleetmapping)) {
    mapped[key] = row[idx] ?? null;
  }
  return mapped;
}

// Read CSV file
fs.readFile(csvFilePath, (err, data) => {
  if (err) throw err;

  parse(data, { trim: true, skip_empty_lines: true }, (err, rows) => {
    if (err) throw err;

    const infleet = [];
    const defleet = [];
    const update = [];
    const fleet = []; // only from infleet range
    const errorRecords = [];

    rows.forEach((row, index) => {
      const sNo = index + 1;

      if (isInRange(sNo, ranges.infleet)) {
        const rec = mapSFleetDelta(row);
        infleet.push(rec);
        fleet.push(mapFleet(row)); // only from infleet
      } else if (isInRange(sNo, ranges.defleet)) {
        defleet.push(mapSFleetDelta(row));
      } else if (isInRange(sNo, ranges.update)) {
        update.push(mapSFleetDelta(row));
      } else if (isInRange(sNo, ranges.error)) {
        const errorRecord = {};
        for (const [key, idx] of Object.entries(errorColumnMapping)) {
          errorRecord[key] = row[idx] ?? null;
        }
        errorRecords.push(errorRecord);
      }
    });

    const history = [...infleet, ...update];

    // Write JSON files
    fs.writeFileSync('D:\\FleetTest\\json\\infleet_records.json', JSON.stringify(infleet, null, 2));
    fs.writeFileSync('D:\\FleetTest\\json\\defleet_records.json', JSON.stringify(defleet, null, 2));
    fs.writeFileSync('D:\\FleetTest\\json\\update_records.json', JSON.stringify(update, null, 2));
    fs.writeFileSync('D:\\FleetTest\\json\\history_records.json', JSON.stringify(history, null, 2));
    fs.writeFileSync('D:\\FleetTest\\json\\error_records.json', JSON.stringify(errorRecords, null, 2));
    fs.writeFileSync('D:\\FleetTest\\json\\fleet_records.json', JSON.stringify(fleet, null, 2));

    console.log('JSON files generated:');
    console.log('infleet_records.json');
    console.log('defleet_records.json');
    console.log('update_records.json');
    console.log('history_records.json');
    console.log('error_records.json');
    console.log('fleet_records.json');
  });
});

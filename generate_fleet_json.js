const fs = require('fs');
const { parse } = require('csv-parse');

const csvFilePath = 'C:\\Users\\SAT-0066\\Downloads\\em-fleet-08-23-2025-17-31.csv';

// Mapping for s_fleet_delta table (infleet records)
const s_fleet_delta_mapping = {
  // brand: 0,
  // ody_vehicle_id_number: 1,
  license_plate_number: 2,
  license_plate_state: 3,
  year: 4,
  make: 5,
  model: 6,
  color: 7,
  vin: 8
  // vehicle_erac: 18
};

// Mapping for fleet records (only LPN and LPS)
const fleetmapping = {
  license_plate_number: 2,
  license_plate_state: 3,
};

// Row number ranges (only infleet kept)
const ranges = {
  infleet: { start: 1, end: 5310 }
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
    const fleet = []; // only from infleet range

    rows.forEach((row, index) => {
      const sNo = index + 1;

      if (isInRange(sNo, ranges.infleet)) {
        const rec = mapSFleetDelta(row);
        infleet.push(rec);
        fleet.push(mapFleet(row)); // only from infleet
      }
    });

    // Write JSON files
    fs.writeFileSync('D:\\FleetTest\\json\\infleet_records.json', JSON.stringify(infleet, null, 2));
  

    console.log('JSON files generated:');
    console.log('infleet_records.json');

  });
});

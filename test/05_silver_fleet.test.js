const fs = require('fs');
const path = require('path');
const { fetchValidFleetRecordsForSilverDelta } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');


jest.setTimeout(60_000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim());


function loadJson(fileName) {
  const filePath = path.join(__dirname, '..', 'json', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('[ SILVER FLEET TABLE TEST SUITES ]', () => {
  let silverDeltaBatchId;
  let s_fleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    silverDeltaBatchId = getBatchIds().silverDeltaBatchId;
    if (!silverDeltaBatchId) throw new Error('No silver delta batch ID found');

    s_fleetExpectedJson = loadJson('s_fleet_records.json');
    dbRecords = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId);
  });

  // Test 1: Compare record counts
  it('Record count in DB matches expected JSON count', () => {
    expect(dbRecords.length).toBe(s_fleetExpectedJson.length);
  });

  // Test 2: Validate all required columns exist in DB and JSON
  it('All required columns are present in DB and JSON records', () => {
    const requiredColumns = [
      'brand', 'ody_vehicle_id_number', 'license_plate_number',
      'license_plate_state', 'year', 'make', 'model', 'color',
      'vin', 'vehicle_erac'
    ];

    dbRecords.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });

    s_fleetExpectedJson.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });
  });

  // Test 3: Compare record values column by column
  it('DB records match expected JSON records column by column', () => {
    const unmatched = [];

    s_fleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.brand) === normalize(expected.brand) &&
        normalize(r.ody_vehicle_id_number) === normalize(expected.ody_vehicle_id_number) &&
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        (normalize(expected.year) === '' || normalize(r.year) === normalize(expected.year)) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin) &&
        normalize(r.vehicle_erac) === normalize(expected.vehicle_erac)
      );

      if (!match) {
        unmatched.push(expected);
      }
    });

    if (unmatched.length > 0) {
      console.error(' Unmatched expected records:');
      console.table(unmatched);
    }

    expect(unmatched.length).toBe(0);
  });

  // Test 4: Validate no invalid LPN/LPS records exist in s_fleet table
it('s_fleet should not contain invalid License Plate Numbers and License Plate States', async () => {
  const dbRecords = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId);

  const invalidRecords = dbRecords.filter(r => 
    !r.license_plate_number || !r.license_plate_state ||         
    r.license_plate_number !== r.license_plate_number.trim() ||  
    r.license_plate_state !== r.license_plate_state.trim() ||    
    r.license_plate_state.length !== 2 ||                        
    r.license_plate_number.length >= 12 ||                       
    !/^[A-Za-z0-9 -]*$/.test(r.license_plate_number) ||         
    !/^[A-Za-z]+$/.test(r.license_plate_state)                  
  );

  if (invalidRecords.length > 0) {
    console.error(' Found invalid LPN/LPS records:');
    console.table(invalidRecords);
  }

  expect(invalidRecords.length).toBe(0);
});
});

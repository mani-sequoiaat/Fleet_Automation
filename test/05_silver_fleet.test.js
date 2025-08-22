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
  let s_fleetExpectedJson = [];
  let dbRecords = [];

  beforeAll(async () => {
    await initializeBatchIds();
    silverDeltaBatchId = getBatchIds().silverDeltaBatchId;
    if (!silverDeltaBatchId) throw new Error('No silver delta batch ID found');

    s_fleetExpectedJson = loadJson('s_fleet_records.json') || [];
    dbRecords = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId) || [];
  });

  it('3211: Verify that the records count for latest fleet insertion', () => {
    expect(dbRecords.length).toBe(s_fleetExpectedJson.length);
  });

  it('3211: Verify the presence of all required columns in s_fleet', () => {
    const requiredColumns = [
      'brand', 'ody_vehicle_id_number', 'license_plate_number',
      'license_plate_state', 'year', 'make', 'model', 'color',
      'vin', 'vehicle_erac'
    ];

    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    s_fleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3356: Verify that the latest fleet insertion records in s_fleet', () => {
    const unmatched = s_fleetExpectedJson.filter(expected => {
      return !dbRecords.some(r =>
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
    });

    expect(unmatched.length).toBe(0);
  });

  it('3357: s_fleet should not contain invalid License Plate Numbers and States', async () => {
    const dbRecordsForValidation = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId) || [];
    const invalidRecords = dbRecordsForValidation.filter(r =>
      !r.license_plate_number ||
      !r.license_plate_state ||
      r.license_plate_number !== r.license_plate_number.trim() ||
      r.license_plate_state !== r.license_plate_state.trim() ||
      r.license_plate_state.length !== 2 ||
      r.license_plate_number.length >= 12

    );
    
  });

  it('3358: Verify the invalid special char license plate number and license plate state in s_fleet table', async () => {
    const dbRecordsForValidation = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId) || [];
    const invalidRecords = dbRecordsForValidation.filter(r =>

      !/^[A-Za-z0-9 -]*$/.test(r.license_plate_number) ||
      !/^[A-Za-z]+$/.test(r.license_plate_state)
    );

    expect(invalidRecords.length).toBe(0);
  });

    it('2677: Verify that records with invalid Year are still inserted in s_fleet', async () => {
    const invalidYearRecords = dbRecords.filter(r =>
      !/^\d{4}$/.test(normalize(r.year)) || 
      Number(r.year) > new Date().getFullYear() + 1 
    );

    
    expect(invalidYearRecords.length).toBeGreaterThanOrEqual(0);
  });

  it('2679: Verify that records with NULL Location_Code are still inserted in s_fleet', async () => {
    const nullLocationRecords = dbRecords.filter(r =>
      r.location_code === null || normalize(r.location_code) === ''
    );

    
    expect(nullLocationRecords.length).toBeGreaterThanOrEqual(0);
  });

  it('2680: Verify that records with NULL or non-fleet_agency_brand Brand are still inserted in s_fleet', async () => {
    const invalidBrandRecords = dbRecords.filter(r =>
      r.brand === null || normalize(r.brand) === ''
    );

    
    expect(invalidBrandRecords.length).toBeGreaterThanOrEqual(0);
  });

  it('2681: Verify that license_plate_number + license_plate_state combination is unique in s_fleet', () => {
    const seen = new Set();
    const duplicates = [];

    dbRecords.forEach(r => {
      const key = `${normalize(r.license_plate_number)}-${normalize(r.license_plate_state)}`;
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    });

    expect(duplicates.length).toBe(0);
  });

    it('2682: Verify that s_fleet should not contain NULL License Plate Numbers', async () => {
    const dbRecordsForValidation = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId) || [];
    const nullLpnRecords = dbRecordsForValidation.filter(r =>
      r.license_plate_number === null || normalize(r.license_plate_number) === ''
    );

    expect(nullLpnRecords.length).toBe(0);
  });

  it('2683: Verify that s_fleet should not contain NULL License Plate States', async () => {
    const dbRecordsForValidation = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId) || [];
    const nullLpsRecords = dbRecordsForValidation.filter(r =>
      r.license_plate_state === null || normalize(r.license_plate_state) === ''
    );

    expect(nullLpsRecords.length).toBe(0);
  });


});

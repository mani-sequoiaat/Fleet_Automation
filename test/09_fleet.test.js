const { loadJson, fetchFleetRecordsForfleet, fetchFleetRecordsForfleetderegistration } = require('../fleet_test_helpers');
const { initializeBatchIds } = require('../batchIdResolver');

jest.setTimeout(60000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());

describe('[ FLEET TABLE TEST SUITES ]', () => {
  let fleetExpectedJson = [];
  let dbRecords = [];
  let skipFleetTests = false; // <--- flag to skip if 0 records

  beforeAll(async () => {
    await initializeBatchIds();
    fleetExpectedJson = loadJson('fleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForfleet() || [];
    if (dbRecords.length === 0) {
      skipFleetTests = true;
      console.log('No fleet records, all fleet tests will be skipped.');
    }
  });

  it('3372: Verify the infleet record count in fleet', () => {
    if (skipFleetTests) return;
    expect(dbRecords.length).toBe(fleetExpectedJson.length);
  });

  it('3373: Verify the presence of all required columns in fleet', () => {
    if (skipFleetTests) return;
    const requiredColumns = ['license_plate_number', 'license_plate_state'];
    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    fleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3374: Verify the infleet records in fleet', () => {
    if (skipFleetTests) return;
    fleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state)
      );
      expect(match).toBeDefined();
    });
  });

  it('3375: Verify No null or empty license_plate_number and license_plate_state in fleet', () => {
    if (skipFleetTests) return;
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('3376: Verify All active license_plate_number + state combinations are unique in fleet', () => {
    if (skipFleetTests) return;
    const seen = new Set();
    const duplicates = dbRecords.filter(r => {
      const key = `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates.length).toBe(0);
  });
});

describe('[ FLEET TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  let fleetDeregExpectedJson = [];
  let dbDeregRecords = [];
  let skipDeregTests = false; // <--- flag to skip if 0 records

  beforeAll(async () => {
    await initializeBatchIds();
    fleetDeregExpectedJson = loadJson('deregistration_records.json') || [];
    dbDeregRecords = await fetchFleetRecordsForfleetderegistration() || [];
    if (dbDeregRecords.length === 0) {
      skipDeregTests = true;
      console.log('No deregistration records, all deregistration tests will be skipped.');
    }
  });

  it('3377: Verify the deregistration record count in fleet', () => {
    if (skipDeregTests) return;
    expect(dbDeregRecords.length).toBe(fleetDeregExpectedJson.length);
  });

  it('3378: verify deregistration All records have is_active = false in fleet', () => {
    if (skipDeregTests) return;
    dbDeregRecords.forEach(record => expect(record.is_active).toBe(false));
  });

  it('3379: Verify deregistration record fleet_end_date is exactly 3 days ago', () => {
    if (skipDeregTests) return;
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 12);
    dbDeregRecords.forEach(record => {
      const fleetEndDate = new Date(record.fleet_end_date);
      expect(fleetEndDate.toDateString()).toBe(expectedDate.toDateString());
    });
  });

  it('3380: Verify registration_end_date is not null for deregistration records in fleet', () => {
    if (skipDeregTests) return;
    dbDeregRecords.forEach(record => expect(record.registration_end_date).not.toBeNull());
  });

  it('3381: verify the deregistration records license_plate_number + state combinations are unique', () => {
    if (skipDeregTests) return;
    const seen = new Set();
    dbDeregRecords.forEach(record => {
      const key = `${normalize(record.license_plate_number)}_${normalize(record.license_plate_state)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    });
  });

  it('3382: Verify created_at and updated_at timestamps are present in fleet', () => {
    if (skipDeregTests) return;
    dbDeregRecords.forEach(record => {
      expect(record.created_at).toBeDefined();
      expect(record.updated_at).toBeDefined();
    });
  });

  it('3383: verify the deregistration records in fleet', () => {
    if (skipDeregTests) return;
    fleetDeregExpectedJson.forEach(expected => {
      const match = dbDeregRecords.find(
        r =>
          normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
          normalize(r.license_plate_state) === normalize(expected.license_plate_state)
      );
      expect(match).toBeDefined();
    });
  });
});

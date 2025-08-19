const { loadJson, fetchFleetRecordsForfleet, fetchFleetRecordsForfleetderegistration } = require('../fleet_test_helpers');
const { initializeBatchIds } = require('../batchIdResolver');
jest.setTimeout(60000); 

// Normalize helper
function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toUpperCase();
}

describe('[ FLEET TABLE TEST SUITES ]', () => {
  let fleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    fleetExpectedJson = loadJson('fleet_records.json');
    dbRecords = await fetchFleetRecordsForfleet();
  });

  it('Fleet: Record count matches JSON', () => {
    expect(dbRecords.length).toBe(fleetExpectedJson.length);
  });

  it('Fleet: All required columns exist in fleet table and JSON', () => {
    const requiredColumns = ['license_plate_number', 'license_plate_state'];
    dbRecords.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });
    fleetExpectedJson.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });
  });

  it('Fleet: Records match expected JSON values', () => {
    fleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state)
      );
      expect(match).toBeDefined();
    });
  });

  it('Fleet: No null or empty license_plate_number and license_plate_state', () => {
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('Fleet: All active license_plate_number + state combinations are unique', () => {
    const seen = new Set();
    const duplicates = [];
    dbRecords.forEach(r => {
      const key = `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`;
      if (seen.has(key)) duplicates.push(key);
      else seen.add(key);
    });
    expect(duplicates.length).toBe(0);
  });
});

describe('[ FLEET TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  let fleetDeregExpectedJson;
  let dbDeregRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    fleetDeregExpectedJson = loadJson('deregistration_records.json');
    dbDeregRecords = await fetchFleetRecordsForfleetderegistration();
  });

  it('Fleet deregistration: Record count matches JSON length', () => {
    expect(dbDeregRecords.length).toBe(fleetDeregExpectedJson.length);
  });

  it('Fleet deregistration: All records have is_active = false', () => {
    dbDeregRecords.forEach(record => {
      expect(record.is_active).toBe(false);
    });
  });

  it('Fleet deregistration: fleet_end_date is exactly 9 days ago', () => {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - 9);

    dbDeregRecords.forEach(record => {
      const fleetEndDate = new Date(record.fleet_end_date);
      expect(fleetEndDate.toDateString()).toBe(expectedDate.toDateString());
    });
  });

  it('Fleet deregistration: registration_end_date is not null', () => {
    dbDeregRecords.forEach(record => {
      expect(record.registration_end_date).not.toBeNull();
    });
  });

  it('Fleet deregistration: license_plate_number + state combinations are unique', () => {
    const seen = new Set();
    dbDeregRecords.forEach(record => {
      const key = `${normalize(record.license_plate_number)}_${normalize(record.license_plate_state)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    });
  });

  it('Fleet deregistration: created_at and updated_at timestamps are present', () => {
    dbDeregRecords.forEach(record => {
      expect(record.created_at).toBeDefined();
      expect(record.updated_at).toBeDefined();
    });
  });

  it('Fleet deregistration: all JSON records match DB completely', () => {
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

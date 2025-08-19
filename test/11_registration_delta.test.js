const { loadJson, fetchFleetRecordsForregistrationdelta } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

// Normalize helper
function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toUpperCase();
}

describe('[ REGISTRATION DELTA TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    infleetExpectedJson = loadJson('infleet_records.json');

    if (!infleetBatchId) throw new Error('No infleet batch ID found');
    dbRecords = await fetchFleetRecordsForregistrationdelta(infleetBatchId);
  });

  // Test 1: Record count matches JSON length
  it('Infleet: Record count matches JSON length', () => {
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  // Test 2: All JSON records exist in DB
  it('Infleet: All JSON records match DB', () => {
    infleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(
        r =>
          normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
          normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
          normalize(r.year) === normalize(expected.year) &&
          normalize(r.make) === normalize(expected.make) &&
          normalize(r.model) === normalize(expected.model) &&
          normalize(r.color) === normalize(expected.color)
      );
      expect(match).toBeDefined();
    });
  });

  // Test 3: No null or empty fields for essential columns
  it('Infleet: No null or empty license_plate_number, state, year, make, model, color', () => {
    const invalid = dbRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state || !r.year || !r.make || !r.model || !r.color
    );
    expect(invalid.length).toBe(0);
  });

  // Test 4: Unique license_plate_number + state combinations
  it('Infleet: license_plate_number + state combinations are unique', () => {
    const seen = new Set();
    const duplicates = [];
    dbRecords.forEach(r => {
      const key = `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`;
      if (seen.has(key)) duplicates.push(key);
      else seen.add(key);
    });
    expect(duplicates.length).toBe(0);
  })
  });



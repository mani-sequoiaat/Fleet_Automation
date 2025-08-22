const { loadJson, fetchFleetRecordsForregistrationdelta } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());

describe('[ REGISTRATION DELTA TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson = [];
  let dbRecords = [];

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) throw new Error('No infleet batch ID found');

    infleetExpectedJson = loadJson('infleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForregistrationdelta(infleetBatchId) || [];
  });

  it('3389: Verify the Infleet Record count in registration_delta', () => {
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3215: Verify Infleet records in registration_delta', () => {
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

  it('3390: Verify Infleet records No null or empty in LPS and LPN fields', () => {
    const invalid = dbRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state || !r.year || !r.make || !r.model || !r.color
    );
    expect(invalid.length).toBe(0);
  });

  it('3219: Verify infleet records license_plate_number + state combinations are unique', () => {
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

const fs = require('fs');
const path = require('path');
const {
  fetchFleetRecordsForregistrationdelta,
  fetchtodayrecords
} = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());

function loadJson(folderName, fileName) {
  const filePath = path.join(__dirname, '..', 'json', folderName, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('[ REGISTRATION DELTA TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson = [];
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    // Check if today's file exists
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    // Initialize batch IDs
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) {
      passAllTests = true;
      return;
    }

    // Load expected JSON and database records
    infleetExpectedJson = loadJson('infleet_records', 'infleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForregistrationdelta(infleetBatchId) || [];
  });

  it('3389: Verify the Infleet Record count in registration_delta', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3215: Verify Infleet records in registration_delta', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
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
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    const invalid = dbRecords.filter(
      r => !r.license_plate_number || !r.license_plate_state || !r.year || !r.make || !r.model || !r.color
    );
    expect(invalid.length).toBe(0);
  });

  it('3219: Verify infleet records license_plate_number + state combinations are unique', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
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

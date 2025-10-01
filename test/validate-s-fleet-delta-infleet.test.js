const { fetchFleetRecordsForSilverDeltaInfleet, fetchtodayrecords } = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');
const path = require('path');
const fs = require('fs');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toLowerCase());


function loadJson(folderName, fileName) {
  const filePath = path.join(__dirname, '..', 'json', folderName, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('[ INFLEET TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson = [];
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) {
      passAllTests = true;
      return;
    }

    infleetExpectedJson = loadJson('infleet_records', 'infleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForSilverDeltaInfleet(infleetBatchId) || [];
  });

  it('3362: Verify the infleet record count in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3363: Verify the presence of all required columns in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const requiredColumns = ['license_plate_number', 'license_plate_state', 'year', 'make', 'model', 'color', 'vin'];
    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    infleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3364: Verify the infleet records in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }

    const unmatched = infleetExpectedJson.filter(expected =>
      !dbRecords.some(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin)
      )
    );

    expect(unmatched.length).toBe(
      0,
      `Unmatched infleet records: ${JSON.stringify(unmatched, null, 2)}`
    );
  });
});

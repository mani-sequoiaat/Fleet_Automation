const { loadJson, fetchFleetRecordsForfleethistory } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toLowerCase();
}

describe('[ FLEET HISTORY TABLE TEST SUITES ]', () => {
  let latestFileId;
  let historyExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    latestFileId = getBatchIds().latestFileId;
    if (!latestFileId) throw new Error('No infleet batch ID found');

    historyExpectedJson = loadJson('history_records.json');
    dbRecords = await fetchFleetRecordsForfleethistory(latestFileId);
  });

  // Test 1: Record count matches
  it('fleet_history: Record count matches JSON', () => {
    expect(dbRecords.length).toBe(historyExpectedJson.length);
  });

  // Test 2: Required columns exist
  it('fleet_history: All required columns exist', () => {
    const requiredColumns = ['license_plate_number','license_plate_state','year','make','model','color','vin'];
    dbRecords.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });
    historyExpectedJson.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });
  });

  // Test 3: Values match expected JSON
  it('fleet_history: Records match expected JSON values', () => {
    historyExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin)
      );
      if (!match) console.error('No matching record found for:', expected);
      expect(match).toBeDefined();
    });
  });

  // Test 4: No null or empty license_plate_number/state
  it('fleet_history: No null or empty license_plate_number/state', () => {
    const invalid = dbRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state
    );
    expect(invalid.length).toBe(0);
  });

  // Test 5: Unique license_plate_number + state combinations
  it('fleet_history: license_plate_number + state combinations are unique', () => {
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

const { loadJson, fetchFleetRecordsForfleethistory } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toLowerCase());

describe('[ FLEET HISTORY TABLE TEST SUITES ]', () => {
  let latestFileId;
  let historyExpectedJson = [];
  let dbRecords = [];

  beforeAll(async () => {
    await initializeBatchIds();
    latestFileId = getBatchIds().latestFileId;
    if (!latestFileId) throw new Error('No latest file ID found for fleet history');

    historyExpectedJson = loadJson('history_records.json') || [];
    dbRecords = await fetchFleetRecordsForfleethistory(latestFileId) || [];
  });

  it('3384: Verify Fleet history Record count for latest insertion', () => {
    expect(dbRecords.length).toBe(historyExpectedJson.length);
  });

  it('3385: Verify all required columns exist in fleet history', () => {
    const requiredColumns = ['license_plate_number','license_plate_state','year','make','model','color','vin'];
    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    historyExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3386: Verify Fleet history Records match for latest insertion', () => {
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
      expect(match).toBeDefined();
    });
  });

  it('3387: Verify Fleet history records No null or empty license_plate_number/state', () => {
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('3388: Verify Fleet history records for license_plate_number + state combinations are unique', () => {
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

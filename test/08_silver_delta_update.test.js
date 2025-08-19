const { loadJson, fetchFleetRecordsForSilverDeltaupdate } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toLowerCase();
}

describe('[ UPDATE TABLE TEST SUITES ]', () => {
  let updateBatchId;
  let updateExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    updateBatchId = getBatchIds().updateBatchId;
    if (!updateBatchId) throw new Error('No update batch ID found');

    updateExpectedJson = loadJson('update_records.json') || [];
    dbRecords = await fetchFleetRecordsForSilverDeltaupdate(updateBatchId);
  });

  // Test 1: Compare record counts
  it('Record count in s_fleet_delta_update matches expected JSON', () => {
    expect(dbRecords.length).toBe(updateExpectedJson.length);
  });

  // Test 2: Validate required columns exist
  it('All required columns exist in s_fleet_delta_update and JSON records', () => {
    const requiredColumns = [
      'license_plate_number', 'license_plate_state', 'year', 'make',
      'model', 'color', 'vin'
    ];

    dbRecords.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });

    updateExpectedJson.forEach(r => {
      requiredColumns.forEach(col => expect(r).toHaveProperty(col));
    });
  });

  // Test 3: Compare record values column by column
  it('s_fleet_delta_update records match expected JSON values column by column', () => {
    const unmatched = [];

    updateExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin)
      );

      if (!match) unmatched.push(expected);
    });

    if (unmatched.length > 0) {
      console.error('❌ Unmatched expected records:');
      console.table(unmatched);
    }

    expect(unmatched.length).toBe(0);
  });
});

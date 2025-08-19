const { loadJson, fetchFleetRecordsForSilverDeltadefleet } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toLowerCase();
}

describe('[ DEFLEET TABLE TEST SUITES ]', () => {
  let defleetBatchId;
  let defleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    defleetBatchId = getBatchIds().defleetBatchId;
    if (!defleetBatchId) throw new Error('No defleet batch ID found');

    defleetExpectedJson = loadJson('defleet_records.json');
    dbRecords = await fetchFleetRecordsForSilverDeltadefleet(defleetBatchId);
  });

  // Test 1: Compare record counts
  it('Record count in s_fleet_delta_defleet matches expected JSON', () => {
    expect(dbRecords.length).toBe(defleetExpectedJson.length);
  });

  // Test 2: Validate required columns exist
  it('All required columns exist in s_fleet_delta_defleet and JSON records', () => {
    const requiredColumns = [
      'license_plate_number', 'license_plate_state', 'year', 'make',
      'model', 'color', 'vin'
    ];

    dbRecords.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });

    defleetExpectedJson.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });
  });

  // Test 3: Compare record values column by column
  it('s_fleet_delta_defleet records match expected JSON values column by column', () => {
    const unmatched = [];

    defleetExpectedJson.forEach(expected => {
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

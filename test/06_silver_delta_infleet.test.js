const { loadJson, fetchFleetRecordsForSilverDeltaInfleet } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);


function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toLowerCase();
}

describe('[ INFLEET TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) throw new Error('No infleet batch ID found');

    infleetExpectedJson = loadJson('infleet_records.json');
    dbRecords = await fetchFleetRecordsForSilverDeltaInfleet(infleetBatchId);
  });

  // Test 1: Compare record counts
  it('Record count in s_fleet_delta table matches expected JSON count', () => {
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  // Test 2: Validate all required columns exist in DB and JSON
  it('All required columns are present in s_fleet_delta and JSON records', () => {
    const requiredColumns = [
      'license_plate_number', 'license_plate_state', 'year', 'make',
      'model', 'color', 'vin'
    ];

    dbRecords.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });

    infleetExpectedJson.forEach(r => {
      requiredColumns.forEach(col => {
        expect(r).toHaveProperty(col);
      });
    });
  });

  // Test 3: Compare record values column by column
  it('s_fleet_delta records match expected JSON records column by column', () => {
    const unmatched = [];

    infleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin)
      );

      if (!match) {
        unmatched.push(expected);
      }
    });

    if (unmatched.length > 0) {
      console.error('❌ Unmatched expected records:');
      console.table(unmatched);
    }

    expect(unmatched.length).toBe(0);
  });
});

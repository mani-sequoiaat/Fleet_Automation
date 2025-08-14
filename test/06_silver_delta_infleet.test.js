const { loadJson, fetchFleetRecordsForSilverDeltaInfleet } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

// Helper to normalize strings (trim, lowercase) and handle null/undefined
function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toLowerCase();
}

describe('[ INFLEET TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson;

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    infleetExpectedJson = loadJson('infleet_records.json');
  });

  it('Infleet: Record count matches JSON length and records match', async () => {
    if (!infleetBatchId) throw new Error('No infleet batch ID found');

    const dbRecords = await fetchFleetRecordsForSilverDeltaInfleet(infleetBatchId);
    expect(dbRecords.length).toBe(infleetExpectedJson.length);

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
        console.error('No matching record found for:', expected);
      }
      expect(match).toBeDefined();
    });
  });
});

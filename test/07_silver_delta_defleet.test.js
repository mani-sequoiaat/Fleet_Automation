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

  beforeAll(async () => {
    await initializeBatchIds();
    defleetBatchId = getBatchIds().defleetBatchId;
    defleetExpectedJson = loadJson('defleet_records.json');
  });

  it('Defleet: Record count matches JSON length and records match', async () => {
    if (!defleetBatchId) throw new Error('No defleet batch ID found');

    const dbRecords = await fetchFleetRecordsForSilverDeltadefleet(defleetBatchId);
    expect(dbRecords.length).toBe(defleetExpectedJson.length);

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

      if (!match) {
        console.error('No matching record found for:', expected);
      }
      expect(match).toBeDefined();
    });
  });
});

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

  beforeAll(async () => {
    await initializeBatchIds();
    updateBatchId = getBatchIds().updateBatchId;
    updateExpectedJson = loadJson('update_records.json');
  });

  it('Update: Record count matches JSON length and records match', async () => {
    if (!updateBatchId) throw new Error('No update batch ID found');

    const dbRecords = await fetchFleetRecordsForSilverDeltaupdate(updateBatchId);
    expect(dbRecords.length).toBe(updateExpectedJson.length);

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

      if (!match) {
        console.error('No matching record found for:', expected);
      }
      expect(match).toBeDefined();
    });
  });
});

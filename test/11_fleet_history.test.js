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

  beforeAll(async () => {
    await initializeBatchIds();
    latestFileId = getBatchIds().latestFileId;
    historyExpectedJson = loadJson('history_records.json');
  });

  it('fleet_history: Record count matches JSON length and records match', async () => {
    if (!latestFileId) throw new Error('No infleet batch ID found');

    const dbRecords = await fetchFleetRecordsForfleethistory(latestFileId);
    expect(dbRecords.length).toBe(historyExpectedJson.length);

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

      if (!match) {
        console.error('No matching record found for:', expected);
      }
      expect(match).toBeDefined();
    });
  });
});

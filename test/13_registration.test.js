const { loadJson,   fetchFleetRecordsForregistration } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

describe('[ REGISTRATION TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson;

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    infleetExpectedJson = loadJson('infleet_records.json');
  });

  it('Registration table Infleet Record count matches JSON length and records match', async () => {
    if (!infleetBatchId) throw new Error('No infleet batch ID found');

    const dbRecords = await   fetchFleetRecordsForregistration(infleetBatchId);
    expect(dbRecords.length).toBe(infleetExpectedJson.length);

    infleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(
        r =>
          r.license_plate_number === expected.license_plate_number &&
          r.license_plate_state === expected.license_plate_state &&
          r.year === expected.year &&
          r.make === expected.make &&
          r.model === expected.model &&
          r.color === expected.color
      );
      expect(match).toBeDefined();
    });
  });
});

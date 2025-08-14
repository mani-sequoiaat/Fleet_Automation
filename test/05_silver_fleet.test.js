const { fetchValidFleetRecordsForSilverDelta } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(60_000); 

describe('[ SILVER FLEET TABLE TEST SUITES ]', () => {
  let silverDeltaBatchId;
  const expectedSilverCount = 4594;

  beforeAll(async () => {
    await initializeBatchIds();
    silverDeltaBatchId = getBatchIds().silverDeltaBatchId;
  });

  it('Valid fleet records in s_fleet table', async () => {
    if (!silverDeltaBatchId) {
      throw new Error('No silver to silver delta batch ID found');
    }

    const records = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatchId);

    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(expectedSilverCount);

    records.forEach(record => {
      expect(record).toHaveProperty('license_plate_number');
      expect(record).toHaveProperty('license_plate_state');
      expect(typeof record.license_plate_number).toBe('string');
      expect(typeof record.license_plate_state).toBe('string');
    });
  });
});

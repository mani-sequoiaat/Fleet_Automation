const { fetchFleetRecordsForbronze } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

describe('[ BRONZE FLEET TABLE TEST SUITES ]', () => {
  let bronzeBatchId;

  const expectedBronzeCount = 0;

  beforeAll(async () => {
    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;
  });

  it('Valid fleet records count in b_fleet table', async () => {
    if (!bronzeBatchId) throw new Error('No bronze batch ID found');

    const result = await fetchFleetRecordsForbronze(bronzeBatchId);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    const actualCount = parseInt(result[0].count, 10);
    expect(actualCount).toBe(expectedBronzeCount);
  });
});

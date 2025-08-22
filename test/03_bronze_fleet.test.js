jest.setTimeout(40000);

const { fetchFleetRecordsForbronze } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

describe('[ BRONZE FLEET TABLE TEST SUITES ]', () => {
  let bronzeBatchId;
  let dbRecords = [];

  beforeAll(async () => {
    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;
    if (!bronzeBatchId) throw new Error('No bronze batch ID found');

    dbRecords = await fetchFleetRecordsForbronze(bronzeBatchId) || [];
    if (!Array.isArray(dbRecords)) throw new Error('fetchFleetRecordsForbronze did not return an array');
  });

  it('1772: Verify b_fleet table empty if records moved to s_fleet table', () => {
    expect(dbRecords.length).toBe(0);
  });
});

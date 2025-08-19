const { fetchFleetRecordsForbronze } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

describe('[ BRONZE FLEET TABLE TEST SUITES ]', () => {
  let bronzeBatchId;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;

    if (!bronzeBatchId) throw new Error('No bronze batch ID found');

    dbRecords = await fetchFleetRecordsForbronze(bronzeBatchId) || [];
  });

  it('b_fleet table should be empty if records moved to s_fleet table', () => {
    if (dbRecords.length === 0) {
      console.log(' b_fleet table is empty: All records moved to s_fleet table');
    } else {
      console.error(` b_fleet table still has ${dbRecords.length} records: Process failed`);
      console.table(dbRecords); 
    }
    expect(dbRecords.length).toBe(0);
  });
});

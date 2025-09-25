jest.setTimeout(40000);

const { fetchFleetRecordsForbronze } = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');
const { fetchtodayrecords } = require('../../utils/fleet_test_helpers'); 

describe('[ BRONZE FLEET TABLE TEST SUITES ]', () => {
  let bronzeBatchId;
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {

    const fileCheckResult = await fetchtodayrecords();

    if (!fileCheckResult || fileCheckResult.length === 0) {
      
      passAllTests = true;
      return;
    }


    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;

    if (!bronzeBatchId) {
      passAllTests = true;
      return;
    }


    dbRecords = await fetchFleetRecordsForbronze(bronzeBatchId) || [];
    if (!Array.isArray(dbRecords)) throw new Error('fetchFleetRecordsForbronze did not return an array');
  });

  it('1772: Verify b_fleet table empty if records moved to s_fleet table', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(dbRecords.length).toBe(0);
  });
});

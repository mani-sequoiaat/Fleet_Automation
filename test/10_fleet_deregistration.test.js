const { loadJson, fetchFleetRecordsForfleetderegistration } = require('../fleet_test_helpers');
const { initializeBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);

describe('[ FLEET TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  
  let fleetExpectedJson;

  beforeAll(async () => {
    await initializeBatchIds();
   
    fleetExpectedJson = loadJson('deregistration_records.json');
  });

  it('fleet deregistration: Record count matches JSON length and records match', async () => {
 

    const dbRecords = await fetchFleetRecordsForfleetderegistration();
    expect(dbRecords.length).toBe(fleetExpectedJson.length);

    fleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(
        r =>
          r.license_plate_number === expected.license_plate_number &&
          r.license_plate_state === expected.license_plate_state
      );
      expect(match).toBeDefined();
    });
  });
});

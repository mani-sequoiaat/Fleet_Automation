const { loadJson, fetchFleetRecordsForSilverDeltaupdate } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toLowerCase());

describe('[ UPDATE TABLE TEST SUITES ]', () => {
  let updateBatchId;
  let updateExpectedJson = [];
  let dbRecords = [];

  beforeAll(async () => {
    await initializeBatchIds();
    updateBatchId = getBatchIds().updateBatchId;
    if (!updateBatchId) throw new Error('No update batch ID found');

    updateExpectedJson = loadJson('update_records.json') || [];
    dbRecords = await fetchFleetRecordsForSilverDeltaupdate(updateBatchId) || [];
  });

  it('3367: Verify the Update record count in s_fleet_delta', () => {
    expect(dbRecords.length).toBe(updateExpectedJson.length);
  });

  it('3363: Verify the presence of all required columns in s_fleet_delta', () => {
    const requiredColumns = [
      'license_plate_number', 'license_plate_state', 'year', 'make',
      'model', 'color', 'vin'
    ];

    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    updateExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3368: Verify the Update records in s_fleet_delta', () => {
    const unmatched = updateExpectedJson.filter(expected =>
      !dbRecords.some(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin)
      )
    );

    expect(unmatched.length).toBe(0);
  });
});

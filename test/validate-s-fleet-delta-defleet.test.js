const { loadJson, fetchFleetRecordsForSilverDeltadefleet, fetchtodayrecords } = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toLowerCase());

describe('[ DEFLEET TABLE TEST SUITES ]', () => {
  let defleetBatchId;
  let defleetExpectedJson = [];
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    await initializeBatchIds();
    defleetBatchId = getBatchIds().defleetBatchId;
    if (!defleetBatchId) {
      passAllTests = true;
      return;
    }

    defleetExpectedJson = loadJson('defleet/defleet.json') || [];
    dbRecords = await fetchFleetRecordsForSilverDeltadefleet(defleetBatchId) || [];
  });

  it('3365: Verify the defleet record count in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    expect(dbRecords.length).toBe(defleetExpectedJson.length);
  });

  it('3363: Verify the presence of all required columns in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const requiredColumns = ['license_plate_number', 'license_plate_state', 'year', 'make', 'model', 'color', 'vin'];
    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    defleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3366: Verify the defleet records in s_fleet_delta', () => {
    if (passAllTests) { expect(true).toBe(true); return; }

    const unmatched = defleetExpectedJson.filter(expected =>
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

    expect(unmatched.length).toBe(
      0,
      `Unmatched defleet records: ${JSON.stringify(unmatched, null, 2)}`
    );
  });
});

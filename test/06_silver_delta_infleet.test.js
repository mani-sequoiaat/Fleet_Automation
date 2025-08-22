const { 
  loadJson, 
  fetchFleetRecordsForSilverDeltaInfleet, 
  fetchFleetRecordsForSilveractionDeltaInfleet 
} = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val =>
  (val === null || val === undefined ? '' : String(val).trim().toLowerCase());

let infleetBatchId;
let infleetExpectedJson = [];

beforeAll(async () => {

  await initializeBatchIds();
  infleetBatchId = getBatchIds().infleetBatchId;

  if (!infleetBatchId) throw new Error('No infleet batch ID found');

  infleetExpectedJson = loadJson('infleet_records.json') || [];
});

describe('[ INFLEET TABLE TEST SUITES]', () => {
  let dbRecords = [];

  beforeAll(async () => {
    dbRecords = await fetchFleetRecordsForSilverDeltaInfleet(infleetBatchId) || [];
  });

  it('3362: Verify the infleet record count in s_fleet_delta', () => {
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3363: Verify the presence of all required columns in s_fleet_delta', () => {
    const requiredColumns = [
      'license_plate_number', 'license_plate_state', 'year', 'make',
      'model', 'color', 'vin'
    ];

    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    infleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3364: Verify the infleet records in s_fleet_delta', () => {
    const unmatched = infleetExpectedJson.filter(expected =>
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



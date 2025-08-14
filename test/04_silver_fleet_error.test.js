const { loadJson, fetchFleetRecordsForbronzeerror } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim());

describe('[ SILVER FLEET ERROR TABLE TEST SUITES ]', () => {
  let bronzeBatchId;
  let errorExpectedJson;

  beforeAll(async () => {
    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;
    errorExpectedJson = loadJson('error_records.json'); 
  });

  it('Error records in silver fleet error table', async () => {
    if (!bronzeBatchId) throw new Error('No error batch ID found');

    const dbRecords = await fetchFleetRecordsForbronzeerror(bronzeBatchId);
    expect(dbRecords.length).toBe(errorExpectedJson.length); 

    errorExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.brand) === normalize(expected.brand) &&
        normalize(r.ody_vehicle_id_number) === normalize(expected.ody_vehicle_id_number) &&
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
        normalize(r.year) === normalize(expected.year) &&
        normalize(r.make) === normalize(expected.make) &&
        normalize(r.model) === normalize(expected.model) &&
        normalize(r.color) === normalize(expected.color) &&
        normalize(r.vin) === normalize(expected.vin) &&
        normalize(r.location_group) === normalize(expected.location_group) &&
        normalize(r.location_code) === normalize(expected.location_code) &&
        normalize(r.location_name) === normalize(expected.location_name) &&
        normalize(r.address_1) === normalize(expected.address_1) &&
        normalize(r.address_2) === normalize(expected.address_2) &&
        normalize(r.city) === normalize(expected.city) &&
        normalize(r.state) === normalize(expected.state) &&
        normalize(r.zip) === normalize(expected.zip) &&
        normalize(r.phone_number) === normalize(expected.phone_number) &&
        normalize(r.vehicle_erac) === normalize(expected.vehicle_erac)
      );

      if (!match) {
        console.error(' No match found for expected error record:', expected);
      }

      expect(match).toBeDefined(); 
    });
  });
});

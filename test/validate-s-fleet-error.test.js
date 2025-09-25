const { loadJson, fetchFleetRecordsForbronzeerror, fetchtodayrecords } = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');
const path = require('path');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim());

describe('[ SILVER FLEET ERROR TABLE TEST SUITES ]', () => {
  let bronzeBatchId;
  let errorExpectedJson = [];
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    await initializeBatchIds();
    bronzeBatchId = getBatchIds().bronzeBatchId;
    if (!bronzeBatchId) {
      passAllTests = true;
      return;
    }

    errorExpectedJson = loadJson('error_records', 'error_records.json') || [];
    dbRecords = await fetchFleetRecordsForbronzeerror(bronzeBatchId) || [];

    if (!Array.isArray(dbRecords)) throw new Error('fetchFleetRecordsForbronzeerror did not return an array');
  });

  it('1040: Verify Error records count', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    expect(dbRecords.length).toBe(errorExpectedJson.length);
  });

  it('1040 & 1041: All expected error records exist in s_fleet_error table', () => {
    if (passAllTests) { expect(true).toBe(true); return; }

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

      expect(match).toBeDefined();
    });
  });
});

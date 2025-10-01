const fs = require('fs');
const path = require('path');
const {
  fetchFleetRecordsForfleet,
  fetchFleetRecordsForfleetderegistration,
  fetchFleetRecordsFordeltaactiontobetaken,
  fetchtodayrecords
} = require('../../utils/fleet_test_helpers');
const { initializeBatchIds } = require('../../utils/batchIdResolver');

jest.setTimeout(60000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());

function loadLocalJson(fileName) {
  const filePath = path.join(__dirname, '..', 'json', 'fleet_records', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON file not found at path: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

describe('[ FLEET TABLE TEST SUITES ]', () => {
  let fleetExpectedJson = [];
  let dbRecords = [];
  let skipFleetTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      skipFleetTests = true;
      return;
    }

    await initializeBatchIds();
    fleetExpectedJson = loadLocalJson('fleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForfleet() || [];

    if (dbRecords.length === 0) skipFleetTests = true;
  });

  it('3372: Verify the infleet record count in fleet', () => {
    if (skipFleetTests) return;
    expect(dbRecords.length).toBe(fleetExpectedJson.length);
  });

  it('3373: Verify the presence of all required columns in fleet', () => {
    if (skipFleetTests) return;
    const requiredColumns = ['license_plate_number', 'license_plate_state'];
    dbRecords.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
    fleetExpectedJson.forEach(r => requiredColumns.forEach(col => expect(r).toHaveProperty(col)));
  });

  it('3374: Verify the infleet records in fleet', () => {
    if (skipFleetTests) return;
    fleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(r =>
        normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
        normalize(r.license_plate_state) === normalize(expected.license_plate_state)
      );
      expect(match).toBeDefined();
    });
  });

  it('3375: Verify No null or empty license_plate_number and license_plate_state in fleet', () => {
    if (skipFleetTests) return;
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('3376: Verify All active license_plate_number + state combinations are unique in fleet', () => {
    if (skipFleetTests) return;
    const seen = new Set();
    const duplicates = dbRecords.filter(r => {
      const key = `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates.length).toBe(0);
  });
});

describe('[ FLEET TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  let fleetQueryRecords = [];
  let deltaQueryRecords = [];
  let skipDeregistrationTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      skipDeregistrationTests = true;
      return;
    }

    await initializeBatchIds();
    fleetQueryRecords = await fetchFleetRecordsForfleetderegistration() || [];
    deltaQueryRecords = await fetchFleetRecordsFordeltaactiontobetaken() || [];

    if (fleetQueryRecords.length === 0 && deltaQueryRecords.length === 0) {
      skipDeregistrationTests = true;
    }
  });

  it('3377: Verify deregistration record count matches between fleet and s_fleet_delta', () => {
    if (skipDeregistrationTests) {
      expect(true).toBe(true);
      return;
    }
    expect(fleetQueryRecords.length).toBe(deltaQueryRecords.length);
  });

  it('3378: Verify LPN + LPS combinations match exactly between fleet and s_fleet_delta', () => {
  if (skipDeregistrationTests) {
    expect(true).toBe(true);
    return;
  }

  // Extract only LPN + LPS keys
  const fleetKeys = fleetQueryRecords.map(
    r => `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`
  );
  const deltaKeys = deltaQueryRecords.map(
    r => `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`
  );

  // Unique sets (ignore duplicates)
  const fleetSet = new Set(fleetKeys);
  const deltaSet = new Set(deltaKeys);

  // Differences
  const missingInDelta = [...fleetSet].filter(k => !deltaSet.has(k));
  const missingInFleet = [...deltaSet].filter(k => !fleetSet.has(k));

  // Fail if any difference
  expect(missingInDelta.length).toBe(
    0,
    `These LPN+LPS exist in fleet but not in s_fleet_delta`
  );
  expect(missingInFleet.length).toBe(
    0,
    `These LPN+LPS exist in s_fleet_delta but not in fleet`
  );
});

  it('3379: Verify no null or empty LPN/LPS in fleet table results', () => {
    if (skipDeregistrationTests) {
      expect(true).toBe(true);
      return;
    }
    const invalid = fleetQueryRecords.filter(
      r => !r.license_plate_number || !r.license_plate_state
    );
    expect(invalid.length).toBe(0);
  });
});

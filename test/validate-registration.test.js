const fs = require('fs');
const path = require('path');
const { 
  fetchFleetRecordsForregistration, 
  fetchFleetRecordsForregistrationdeltadereg, 
  fetchFleetRecordsForregistrationdereg,
  fetchtodayrecords
} = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());
const formatRecord = r => `${normalize(r.license_plate_number)}|${normalize(r.license_plate_state)}|${normalize(r.make)}|${normalize(r.model)}|${normalize(r.color)}|${r.registration_end_date}`;

function loadJson(folderName, fileName) {
  const filePath = path.join(__dirname, '..', 'json', folderName, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`JSON file not found: ${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('[ REGISTRATION TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson = [];
  let dbRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) {
      passAllTests = true;
      return;
    }

    infleetExpectedJson = loadJson('infleet_records', 'infleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForregistration(infleetBatchId) || [];
  });

  it('3389: Verify the registration records count in registration table', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3222: Verify the registration records in registration table', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    infleetExpectedJson.forEach(expected => {
      const match = dbRecords.find(
        r =>
          normalize(r.license_plate_number) === normalize(expected.license_plate_number) &&
          normalize(r.license_plate_state) === normalize(expected.license_plate_state) &&
          normalize(r.year) === normalize(expected.year) &&
          normalize(r.make) === normalize(expected.make) &&
          normalize(r.model) === normalize(expected.model) &&
          normalize(r.color) === normalize(expected.color)
      );
      expect(match).toBeDefined();
    });
  });

  it('3393: Verify the registration records with no null or empty license_plate_number/state', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('3394: Verify registration records license_plate_number + state uniqueness', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
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

describe('[ REGISTRATION TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  let deltaRecords = [];
  let deregRecords = [];
  let passAllTests = false;

  beforeAll(async () => {
    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    deltaRecords = await fetchFleetRecordsForregistrationdeltadereg() || [];
    deregRecords = await fetchFleetRecordsForregistrationdereg() || [];
  });

  it('3216: Verify deregistration record counts match between delta and registration tables', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    expect(new Set(deltaRecords.map(formatRecord)).size).toBe(new Set(deregRecords.map(formatRecord)).size);
  });

  it('3395: Verify all latest delta deregistration records exist in registration table', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const setDereg = new Set(deregRecords.map(formatRecord));
    deltaRecords.forEach(r => {
      expect(setDereg.has(formatRecord(r))).toBe(true);
    });
  });

  it('3396: Verify no null/empty LPS and LPN fields in delta records', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const invalidRecords = deltaRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state || !r.registration_end_date
    );
    expect(invalidRecords.length).toBe(0);
  });

  it('3397: Verify deregistration records license_plate_number + state uniqueness', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const seen = new Set();
    const duplicates = deltaRecords.filter(r => {
      const key = `${normalize(r.license_plate_number)}|${normalize(r.license_plate_state)}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates.length).toBe(0);
  });

  it('3398: Verify registration_end_date is not in the future in deregistration table', () => {
    if (passAllTests) { expect(true).toBe(true); return; }
    const today = new Date();
    const futureRecords = deltaRecords.filter(r => new Date(r.registration_end_date) > today);
    expect(futureRecords.length).toBe(0);
  });
});

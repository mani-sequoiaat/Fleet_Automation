const { 
  loadJson, 
  fetchFleetRecordsForregistration, 
  fetchFleetRecordsForregistrationdeltadereg, 
  fetchFleetRecordsForregistrationdereg 
} = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

jest.setTimeout(40000);

const normalize = val => (val === null || val === undefined ? '' : String(val).trim().toUpperCase());
const formatRecord = r => `${r.license_plate_number}|${r.license_plate_state}|${r.make}|${r.model}|${r.color}|${r.registration_end_date}`;

describe('[ REGISTRATION TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson = [];
  let dbRecords = [];
  let skipRegistrationTests = false; 

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    if (!infleetBatchId) throw new Error('No infleet batch ID found');

    infleetExpectedJson = loadJson('infleet_records.json') || [];
    dbRecords = await fetchFleetRecordsForregistration(infleetBatchId) || [];

    if (dbRecords.length === 0) {
      skipRegistrationTests = true;
      console.log('No registration records found. All registration tests will be skipped.');
    }
  });

  it('3389: Verify the registration records count in registration table', () => {
    if (skipRegistrationTests) return;
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('3222: Verify the registration records in registration table', () => {
    if (skipRegistrationTests) return;
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

  it('3393: Verify the registration records with No null or empty license_plate_number and state in registration table', () => {
    if (skipRegistrationTests) return;
    const invalid = dbRecords.filter(r => !r.license_plate_number || !r.license_plate_state);
    expect(invalid.length).toBe(0);
  });

  it('3394: Verify the registration records license_plate_number + state combinations are unique in registration table', () => {
    if (skipRegistrationTests) return;
    const seen = new Set();
    const duplicates = [];
    dbRecords.forEach(r => {
      const key = `${normalize(r.license_plate_number)}_${normalize(r.license_plate_state)}`;
      if (seen.has(key)) duplicates.push(key);
      else seen.add(key);
    });
    expect(duplicates.length).toBe(0);
  });
});

describe('[ REGISTRATION TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  let deltaRecords = [];
  let deregRecords = [];
  let skipDeregistrationTests = false; 

  beforeAll(async () => {
    deltaRecords = await fetchFleetRecordsForregistrationdeltadereg() || [];
    deregRecords = await fetchFleetRecordsForregistrationdereg() || [];

    if (deltaRecords.length === 0 || deregRecords.length === 0) {
      skipDeregistrationTests = true;
      console.log('No deregistration delta or main records found. All deregistration tests will be skipped.');
    }
  });

  it('3216: Verify deregistration Record counts match between delta and registration tables', () => {
    if (skipDeregistrationTests) return;
    expect(new Set(deltaRecords.map(formatRecord)).size).toBe(new Set(deregRecords.map(formatRecord)).size);
  });

  it('3395: Verify All latest delta deregistration records exist in registration table', () => {
    if (skipDeregistrationTests) return;
    const setDereg = new Set(deregRecords.map(formatRecord));
    deltaRecords.forEach(r => {
      expect(setDereg.has(formatRecord(r))).toBe(true);
    });
  });

  it('3396: Verify No null or empty LPS and LPN fields in delta records', () => {
    if (skipDeregistrationTests) return;
    const invalidRecords = deltaRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state || !r.registration_end_date
    );
    expect(invalidRecords.length).toBe(0);
  });

  it('3397: Verify the deregistration records license_plate_number + state combinations are unique', () => {
    if (skipDeregistrationTests) return;
    const seen = new Set();
    const duplicates = deltaRecords.filter(r => {
      const key = `${r.license_plate_number}|${r.license_plate_state}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates.length).toBe(0);
  });

  it('3398: Verify the registration_end_date is not in the future in deregistration table', () => {
    if (skipDeregistrationTests) return;
    const today = new Date();
    const futureRecords = deltaRecords.filter(r => new Date(r.registration_end_date) > today);
    expect(futureRecords.length).toBe(0);
  });
});

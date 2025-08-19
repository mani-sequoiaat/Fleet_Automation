const { 
  loadJson, 
  fetchFleetRecordsForregistration, 
  fetchFleetRecordsForregistrationdeltadereg, 
  fetchFleetRecordsForregistrationdereg 
} = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');
jest.setTimeout(40000);


function normalize(val) {
  if (val === null || val === undefined) return '';
  return val.toString().trim().toUpperCase();
}


describe('[ REGISTRATION TABLE TEST SUITES ]', () => {
  let infleetBatchId;
  let infleetExpectedJson;
  let dbRecords;

  beforeAll(async () => {
    await initializeBatchIds();
    infleetBatchId = getBatchIds().infleetBatchId;
    infleetExpectedJson = loadJson('infleet_records.json');

    if (!infleetBatchId) throw new Error('No infleet batch ID found');
    dbRecords = await fetchFleetRecordsForregistration(infleetBatchId);

    if (!dbRecords.length) {
      console.warn('⚠️ No registration records found for today');
    } else {
      console.log(`✅ ${dbRecords.length} registration records found for today`);
    }
  });

  it('Infleet: Record count matches JSON length', () => {
    if (!dbRecords.length) return console.log('Skipped: No records today');
    expect(dbRecords.length).toBe(infleetExpectedJson.length);
  });

  it('Infleet: All JSON records match DB', () => {
    if (!dbRecords.length) return console.log('Skipped: No records today');

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

  it('Infleet: No null or empty license_plate_number and state', () => {
    if (!dbRecords.length) return console.log('Skipped: No records today');

    const invalid = dbRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state 
    );
    expect(invalid.length).toBe(0);
  });

  it('Infleet: license_plate_number + state combinations are unique', () => {
    if (!dbRecords.length) return console.log('Skipped: No records today');

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
  let deltaRecords;
  let deregRecords;
  const format = r =>
    `${r.license_plate_number}|${r.license_plate_state}|${r.make}|${r.model}|${r.color}|${r.registration_end_date}`;

  beforeAll(async () => {
    deltaRecords = await fetchFleetRecordsForregistrationdeltadereg();
    deregRecords = await fetchFleetRecordsForregistrationdereg();
  });

  it('Record counts match between delta and registration tables', () => {
    const setDelta = new Set(deltaRecords.map(format));
    const setDereg = new Set(deregRecords.map(format));
    expect(setDelta.size).toBe(setDereg.size);
  });

  it('All delta records exist in registration table', () => {
    const setDereg = new Set(deregRecords.map(format));
    deltaRecords.forEach(r => {
      const plate = format(r);
      expect(setDereg.has(plate)).toBe(true);
    });
  });

  it('No null or empty fields in delta records', () => {
    const invalidRecords = deltaRecords.filter(r =>
      !r.license_plate_number || !r.license_plate_state || !r.registration_end_date
    );
    expect(invalidRecords.length).toBe(0);
  });

  it('All license_plate_number + state combinations are unique', () => {
    const seen = new Set();
    const duplicates = [];
    deltaRecords.forEach(r => {
      const key = `${r.license_plate_number}|${r.license_plate_state}`;
      if (seen.has(key)) duplicates.push(key);
      else seen.add(key);
    });
    expect(duplicates.length).toBe(0);
  });

  it('registration_end_date is not in the future', () => {
    const today = new Date();
    const futureRecords = deltaRecords.filter(r => new Date(r.registration_end_date) > today);
    expect(futureRecords.length).toBe(0);
  });
});

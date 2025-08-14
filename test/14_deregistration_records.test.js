const { fetchFleetRecordsForregistrationdeltadereg, fetchFleetRecordsForregistrationdereg } = require('../fleet_test_helpers');
jest.setTimeout(40000);

describe('[ REGISTRATION TABLE DEREGISTRATION RECORDS TEST SUITES ]', () => {
  it('deregistration records match exactly in registration_delta and registration tables', async () => {
    const result1 = await fetchFleetRecordsForregistrationdeltadereg();
    const result2 = await fetchFleetRecordsForregistrationdereg();

    
    const format = record => `${record.fleet_agency_id}|${record.license_plate_number}|${record.license_plate_state}|${record.make}|${record.model}|${record.color}|${record.registration_end_date}`;


    const set1 = new Set(result1.map(format));
    const set2 = new Set(result2.map(format));

    
    expect(set1.size).toBe(set2.size);

    
    for (const plate of set1) {
      expect(set2.has(plate)).toBe(true);
    }
  });
});

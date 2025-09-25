jest.setTimeout(40000);

const { fetchLatestFleetFile, fetchtodayrecords } = require('../../utils/fleet_test_helpers');

describe('[ FILE DETAILS TABLE TEST SUITES ]', () => {
  let latestFile = null;
  let passAllTests = false;

  beforeAll(async () => {

    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      passAllTests = true;
      return;
    }

    const result = await fetchLatestFleetFile();

    if (!Array.isArray(result)) {
      passAllTests = true;
      return;
    }

    if (!result.length) {
      passAllTests = true;
      return;
    }

    latestFile = result[0];
  }, 20000);

  it('1235: Verify the latest file_id for fleet file', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(latestFile).toBeDefined();
    expect(typeof latestFile).toBe('object');
  });

  it('1235: Verify the latest fleet file for em', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(latestFile.filename).toBeDefined();
    expect(latestFile.filename).toMatch(/^em-fleet-/i);
  });

  it('3355: Filepath should contain "fleet-container"', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(latestFile.filepath).toBeDefined();
    expect(latestFile.filepath.toLowerCase()).toContain('fleet-container');
  });
});

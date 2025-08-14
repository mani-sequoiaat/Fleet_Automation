const { fetchLatestFleetFile } = require('../fleet_test_helpers');

describe('[ FILE DETAILS TABLE TEST SUITES ]', () => {
  it('The latest em-fleet file record from Audit.file_details', async () => {
    const result = await fetchLatestFleetFile();

    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      expect(result[0]).toHaveProperty('filename');
      expect(result[0].filename).toMatch(/^em-fleet-/i);

      const latestFileId = parseInt(result[0].id, 10);
      expect(latestFileId).toBeGreaterThan(0);
    } else {
      throw new Error('No em-fleet file found in file_details.');
    }
  }, 20000);
});

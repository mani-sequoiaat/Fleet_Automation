jest.setTimeout(40000);

const { fetchLatestFleetFile } = require('../fleet_test_helpers');

describe('[ FILE DETAILS TABLE TEST SUITES ]', () => {
  let latestFile = null;

  beforeAll(async () => {
    const result = await fetchLatestFleetFile();

    if (!Array.isArray(result)) {
      throw new Error('fetchLatestFleetFile did not return an array');
    }

    if (!result.length) {
      throw new Error('No em-fleet file found in file_details.');
    }

    latestFile = result[0];
    console.log('Latest em-fleet file fetched successfully.');
  }, 20000);

  it('1235: Verify the latest file_id for fleet file', () => {
    expect(latestFile).toBeDefined();
    expect(typeof latestFile).toBe('object');
  });

  it('1235: Verify the latest fleet file for em', () => {
    expect(latestFile.filename).toBeDefined();
    expect(latestFile.filename).toMatch(/^em-fleet-/i);
  });

  it('3355: Filepath should contain "fleet-container"', () => {
    expect(latestFile.filepath).toBeDefined();
    expect(latestFile.filepath.toLowerCase()).toContain('fleet-container');
  });
});

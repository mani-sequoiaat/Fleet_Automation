jest.setTimeout(40000);

const { fetchLatestFleetFile } = require('../fleet_test_helpers');

describe('[ FILE DETAILS TABLE TEST SUITES ]', () => {
  let latestFile = null;

  beforeAll(async () => {
    const result = await fetchLatestFleetFile();
    if (!Array.isArray(result)) throw new Error('fetchLatestFleetFile did not return an array');
    if (!result.length) throw new Error('No em-fleet file found in file_details.');
    latestFile = result[0];
  }, 20000);

  it('Should fetch an array of results', () => {
    expect(Array.isArray([latestFile])).toBe(true);
  });

  it('Should have a valid filename starting with "em-fleet-"', () => {
    expect(latestFile).toHaveProperty('filename');
    expect(latestFile.filename).toMatch(/^em-fleet-/i);
  });

  it('Filepath should contain "fleet-container"', () => {
    if (!latestFile.filepath || !latestFile.filepath.toLowerCase().includes('fleet-container')) {
      throw new Error(`❌ Filepath is invalid: ${latestFile.filepath}`);
    } else {
      console.log(`✅ Filepath is valid: ${latestFile.filepath}`);
    }
  });
});

jest.setTimeout(40000);

const { fetchBatchesByFileId } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

describe('[ BATCH TABLE TEST SUITES ]', () => {
  let latestFileId;
  let batches = [];

  beforeAll(async () => {
    await initializeBatchIds();
    latestFileId = getBatchIds().latestFileId;

    if (!latestFileId) throw new Error('No latest file ID found from batch table.');

    batches = await fetchBatchesByFileId(latestFileId);
    if (!Array.isArray(batches)) throw new Error('Failed to fetch batches for latest file.');
  });

  it('3206: Verify that the what are the batch are created for fleet', () => {
    expect(Array.isArray(batches)).toBe(true);
  });

  it('1235: Verify batches have the correct latest file_id', () => {
    batches.forEach(batch => {
      expect(batch.file_id).toBe(latestFileId);
    });
  });

  it('3126: Verify the All required batch types should exist for the latest file', () => {
    const requiredTypes = [
      'bronze to silver',
      'silver to silver delta',
      'silver delta to gold - infleet',
      'silver delta to gold - defleet',
      'silver delta to gold - update'
    ];

    requiredTypes.forEach(type => {
      const exists = batches.some(b => b.batch_type_name === type);
      expect(exists).toBe(true);
    });
  });

  it('3206: Verify There should be no duplicate batch types for the latest file', () => {
    const seen = new Set();
    const duplicates = batches
      .map(b => b.batch_type_name)
      .filter(name => seen.has(name) ? true : (seen.add(name), false));

    expect(duplicates.length).toBe(0);
  });
});

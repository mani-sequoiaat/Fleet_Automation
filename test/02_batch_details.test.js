jest.setTimeout(40000);

const { fetchBatchesByFileId } = require('../fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../batchIdResolver');

describe('[ BATCH TABLE TEST SUITES ]', () => {
  let latestFileId;

  beforeAll(async () => {
    await initializeBatchIds();
    latestFileId = getBatchIds().latestFileId;
  });

  it('The latest batches related to the latest file ID from Audit.batch table', async () => {
    if (!latestFileId) throw new Error('No latest file ID found from batch table.');

    const batches = await fetchBatchesByFileId(latestFileId);
    expect(Array.isArray(batches)).toBe(true);

    batches.forEach(batch => {
      expect(batch.file_id).toBe(latestFileId);
    });
  });
});

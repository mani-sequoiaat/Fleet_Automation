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

  it('Should return an array when fetching batches for the latest file', () => {
    expect(Array.isArray(batches)).toBe(true);
  });

  it('All fetched batches should have the correct latest file_id', () => {
    batches.forEach(batch => {
      expect(batch.file_id).toBe(latestFileId);
    });
  });

  it('All required batch types should exist for the latest file', () => {
    const requiredTypes = [
      'bronze to silver',
      'silver to silver delta',
      'silver delta to gold - infleet',
      'silver delta to gold - defleet',
      'silver delta to gold - update'
    ];

    requiredTypes.forEach(type => {
      const exists = batches.some(b => b.batch_type_name === type);
      if (!exists) console.warn(` Batch type missing: ${type}`);
      expect(exists).toBe(true);
    });
  });

  it('There should be no duplicate batch types for the latest file', () => {
    const seen = new Set();
    const duplicates = [];

    batches.forEach(b => {
      if (seen.has(b.batch_type_name)) duplicates.push(b.batch_type_name);
      else seen.add(b.batch_type_name);
    });

    if (duplicates.length) console.error(' Duplicate batch types found:', duplicates);
    expect(duplicates.length).toBe(0);
  });

});

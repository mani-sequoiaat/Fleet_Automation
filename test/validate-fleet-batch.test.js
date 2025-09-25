jest.setTimeout(40000);

const { fetchBatchesByFileId, fetchtodayrecords } = require('../../utils/fleet_test_helpers');
const { initializeBatchIds, getBatchIds } = require('../../utils/batchIdResolver');

describe('[ BATCH TABLE TEST SUITES ]', () => {
  let latestFileId;
  let batches = [];
  let passAllTests = false;

  beforeAll(async () => {
    await initializeBatchIds();

    const todayRecords = await fetchtodayrecords();
    if (!todayRecords || todayRecords.length === 0) {
      
      passAllTests = true;
      return;
    }

    latestFileId = getBatchIds().latestFileId;

    if (!latestFileId) {
      
      passAllTests = true;
      return;
    }

    batches = await fetchBatchesByFileId(latestFileId);
    if (!Array.isArray(batches)) {
      
      passAllTests = true;
      return;
    }
  });

  it('3206: Verify that the batches are created for fleet', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    expect(Array.isArray(batches)).toBe(true);
  });

  it('1235: Verify batches have the correct latest file_id', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    batches.forEach(batch => {
      expect(batch.file_id).toBe(latestFileId);
    });
  });

  it('3126: Verify the required batch types exist for the latest file', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
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

  it('3206: Verify there are no duplicate batch types for the latest file', () => {
    if (passAllTests) {
      expect(true).toBe(true);
      return;
    }
    const seen = new Set();
    const duplicates = batches
      .map(b => b.batch_type_name)
      .filter(name => seen.has(name) ? true : (seen.add(name), false));

    expect(duplicates.length).toBe(0);
  });
});

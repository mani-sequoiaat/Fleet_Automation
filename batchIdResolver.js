const { fetchLatestFleetFile, fetchBatchesByFileId } = require('./fleet_test_helpers');

let latestFileId = null;
let bronzeBatchId = null;
let silverDeltaBatchId = null;
let infleetBatchId = null;
let defleetBatchId = null;
let updateBatchId = null;

async function initializeBatchIds() {
  // Reset all IDs before fetching
  latestFileId = null;
  bronzeBatchId = null;
  silverDeltaBatchId = null;
  infleetBatchId = null;
  defleetBatchId = null;
  updateBatchId = null;

  // Fetch the latest fleet file
  const latestFileResult = await fetchLatestFleetFile();
  if (!latestFileResult || !latestFileResult.length) {
    throw new Error('No fleet file found in file_details.');
  }

  // Parse latest file ID safely
  latestFileId = parseInt(latestFileResult[0]?.id, 10);
  if (isNaN(latestFileId) || latestFileId <= 0) {
    throw new Error('Failed to initialize latestFileId');
  }

  // Fetch batches for the latest file
  const batches = await fetchBatchesByFileId(latestFileId) || [];

  // Map batch types to IDs safely
  bronzeBatchId = batches.find(b => b.batch_type_name === 'bronze to silver')?.id ?? null;
  silverDeltaBatchId = batches.find(b => b.batch_type_name === 'silver to silver delta')?.id ?? null;
  infleetBatchId = batches.find(b => b.batch_type_name === 'silver delta to gold - infleet')?.id ?? null;
  defleetBatchId = batches.find(b => b.batch_type_name === 'silver delta to gold - defleet')?.id ?? null;
  updateBatchId = batches.find(b => b.batch_type_name === 'silver delta to gold - update')?.id ?? null;

  
}

function getBatchIds() {
  return {
    latestFileId,
    bronzeBatchId,
    silverDeltaBatchId,
    infleetBatchId,
    defleetBatchId,
    updateBatchId
  };
}

module.exports = {
  initializeBatchIds,
  getBatchIds,
};

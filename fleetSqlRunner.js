const fs = require('fs');
const path = require('path');
const { createClient } = require('./dbClient'); // only this one

function readSQL(fileName) {
  return fs.readFileSync(path.join(__dirname, 'sql', fileName), 'utf-8');
}

// Generic function to run queries safely
async function fetchBatchRecords(sqlFile, batchId) {
  const client = await createClient(); // already connected
  try {
    const query = readSQL(sqlFile);
    const result = batchId ? await client.query(query, [batchId]) : await client.query(query);
    return result.rows;
  } finally {
    await client.end(); // disconnect after each query
  }
}


// Specific batch functions
async function fetchLatestFleetFile() {
  return fetchBatchRecords('01_latest_EM_fleet_file.sql');
}

async function fetchBatchesByFileId(fileId) {
  if (!fileId) throw new Error('File ID not provided');
  return fetchBatchRecords('02_batches_by_file_id.sql', fileId);
}

async function fetchFleetRecordsForbronze(batchId) { return fetchBatchRecords('03_b_fleet.sql', batchId); }
async function fetchFleetRecordsForbronzeerror(batchId) { return fetchBatchRecords('04_s_fleet_error.sql', batchId); }
async function fetchValidFleetRecordsForSilverDelta(batchId) { return fetchBatchRecords('05_s_fleet.sql', batchId); }
async function fetchFleetRecordsForSilverDeltaInfleet(batchId) { return fetchBatchRecords('06_s_fleetdelta_infleet.sql', batchId); }
async function fetchFleetRecordsForSilverDeltadefleet(batchId) { return fetchBatchRecords('07_s_fleetdelta_defleet.sql', batchId); }
async function fetchFleetRecordsForSilverDeltaupdate(batchId) { return fetchBatchRecords('08_s_fleetdelta_update.sql', batchId); }
async function fetchFleetRecordsForregistrationdelta(batchId) { return fetchBatchRecords('12_registration_delta.sql', batchId); }
async function fetchFleetRecordsForregistration(batchId) { return fetchBatchRecords('14_registration.sql', batchId); }

// Functions without batchId
async function fetchFleetRecordsForfleet() { return fetchBatchRecords('09_fleet.sql'); }
async function fetchFleetRecordsForfleetderegistration() { return fetchBatchRecords('10_fleet_deregistration.sql'); }
async function fetchFleetRecordsForfleethistory(fileId) { return fetchBatchRecords('11_fleet_history.sql', fileId); }
async function fetchFleetRecordsForregistrationdeltadereg() { return fetchBatchRecords('13_registration_delta_dereg.sql'); }
async function fetchFleetRecordsForregistrationdereg() { return fetchBatchRecords('15_registration_dereg.sql'); }

module.exports = {
  fetchLatestFleetFile,
  fetchBatchesByFileId,
  fetchFleetRecordsForbronze,
  fetchFleetRecordsForbronzeerror,
  fetchValidFleetRecordsForSilverDelta,
  fetchFleetRecordsForSilverDeltaInfleet,
  fetchFleetRecordsForSilverDeltadefleet,
  fetchFleetRecordsForSilverDeltaupdate,
  fetchFleetRecordsForfleet,
  fetchFleetRecordsForfleetderegistration,
  fetchFleetRecordsForfleethistory,
  fetchFleetRecordsForregistrationdelta,
  fetchFleetRecordsForregistrationdeltadereg,
  fetchFleetRecordsForregistration,
  fetchFleetRecordsForregistrationdereg
};

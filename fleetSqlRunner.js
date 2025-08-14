require('dotenv').config(); 

const { DefaultAzureCredential } = require('@azure/identity');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const credential = new DefaultAzureCredential();

// Load values from .env
const server = process.env.AZURE_PG_HOST;
const database = process.env.AZURE_PG_DATABASE;
const username = process.env.AZURE_PG_USERNAME;

function readSQL(fileName) {
  return fs.readFileSync(path.join(__dirname, 'sql', fileName), 'utf-8');
}

async function createClient() {
  const tokenResponse = await credential.getToken("https://ossrdbms-aad.database.windows.net");
  return new Client({
    host: server,
    database: database,
    user: username,
    password: tokenResponse.token,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });
}

async function fetchLatestFleetFile() {
  const client = await createClient();
  await client.connect();
  const query = readSQL('01_latest_EM_fleet_file.sql');
  const result = await client.query(query);
  await client.end();
  return result.rows;
}

async function fetchBatchesByFileId(fileId) {
  if (!fileId) throw new Error('File ID not provided');
  const client = await createClient();
  await client.connect();
  const query = readSQL('02_batches_by_file_id.sql');
  const result = await client.query(query, [fileId]);
  await client.end();
  return result.rows;
}

// Generic function for batch queries
async function fetchBatchRecords(sqlFile, batchId) {
  if (!batchId) return [];
  const client = await createClient();
  await client.connect();
  const query = readSQL(sqlFile);
  const result = await client.query(query, [batchId]);
  await client.end();
  return result.rows;
}

// Specific batch functions
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

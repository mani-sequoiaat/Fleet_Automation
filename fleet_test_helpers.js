const fs = require('fs');
const path = require('path');

function loadJson(fileName) {
  const filePath = path.join('D:/FleetTest/json', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const {
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

} = require('./fleetSqlRunner.js');

module.exports = {
  loadJson,
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

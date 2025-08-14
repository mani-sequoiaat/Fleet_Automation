const {
  fetchLatestFleetFile,
  fetchBatchesByFileId,
  fetchFleetRecordsForbronze,
  fetchValidFleetRecordsForSilverDelta,
  fetchFleetRecordsForSilverDeltaInfleet,
  fetchFleetRecordsForSilverDeltadefleet,
  fetchFleetRecordsForSilverDeltaupdate,
  fetchFleetRecordsForfleet,
  fetchFleetRecordsForfleethistory,
  fetchFleetRecordsForregistrationdelta,
  fetchFleetRecordsForregistrationdeltadereg,
  fetchFleetRecordsForregistration,
  fetchFleetRecordsForregistrationdereg 
} = require('./fleetSqlRunner.js');

(async () => {
  try {
    const latestFiles = await fetchLatestFleetFile();
    console.log('Latest Fleet Files:', latestFiles);

    if (latestFiles.length === 0) {
      console.warn('No em-fleet files found.');
      return;
    }

    const fileId = latestFiles[0].id;

    const batches = await fetchBatchesByFileId(fileId);
    console.log(`Batches for file ID ${fileId}:`, batches);

    const bronzeBatch = batches.find(b => b.batch_type_name === 'bronze to silver');
    if (!bronzeBatch) {
      console.warn("No 'bronze to silver' batch found.");
      return;
    }
    console.log(`Found 'bronze to silver' batch with ID: ${bronzeBatch.id}`);
    const bronzeRecords = await fetchFleetRecordsForbronze(bronzeBatch.id);
    console.log('\nFleet Records for bronze to silver Batch:\n', bronzeRecords);

    const silverDeltaBatch = batches.find(b => b.batch_type_name === 'silver to silver delta');
    if (!silverDeltaBatch) {
      console.warn("No 'silver to silver delta' batch found.");
      return;
    }
    console.log(`Found 'silver to silver delta' batch with ID: ${silverDeltaBatch.id}`);
    const validRecords = await fetchValidFleetRecordsForSilverDelta(silverDeltaBatch.id);
    console.log('\nValid Fleet Records for Silver Delta Batch:\n', validRecords);

    const infleetBatch = batches.find(b => b.batch_type_name === 'silver delta to gold - infleet');
    if (!infleetBatch) {
      console.warn("No 'silver delta to gold - infleet' batch found.");
      return;
    }
    console.log(`Found 'silver delta to gold - infleet' batch with ID: ${infleetBatch.id}`);
    const infleetRecords = await fetchFleetRecordsForSilverDeltaInfleet(infleetBatch.id);
    console.log('\nFleet Records for Silver Delta to Gold - Infleet:\n', infleetRecords);

    const defleetBatch = batches.find(b => b.batch_type_name === 'silver delta to gold - defleet');
    if (!defleetBatch) {
      console.warn("No 'silver delta to gold - defleet' batch found.");
      return;
    }
    console.log(`Found 'silver delta to gold - defleet' batch with ID: ${defleetBatch.id}`);
    const defleetRecords = await fetchFleetRecordsForSilverDeltadefleet(defleetBatch.id);
    console.log('\nFleet Records for Silver Delta to Gold - Defleet:\n', defleetRecords);

    const updateBatch = batches.find(b => b.batch_type_name === 'silver delta to gold - update');
    if (!updateBatch) {
      console.warn("No 'silver delta to gold - update' batch found.");
      return;
    }
    console.log(`Found 'silver delta to gold - update' batch with ID: ${updateBatch.id}`);
    const updateRecords = await fetchFleetRecordsForSilverDeltaupdate(updateBatch.id);
    console.log('\nFleet Records for Silver Delta to Gold - Update:\n', updateRecords);

    // ✅ Fetch from final fleet table
    const fleetRecords = await fetchFleetRecordsForfleet();
    console.log('\nFinal Fleet Records:\n', fleetRecords);

    // ✅ Fetch from fleet history table using fileId
    const fleetHistoryRecords = await fetchFleetRecordsForfleethistory(fileId);
    console.log('\nFleet History Records for File ID:\n', fleetHistoryRecords);

    // ✅ Fetch from registration_delta (using updateBatch ID)
    const registrationDeltaRecords = await fetchFleetRecordsForregistrationdelta(infleetBatch.id);
    console.log('\nRegistration Delta Records:\n', registrationDeltaRecords);

    // ✅ Fetch from registration_delta_dereg
    const registrationDeltaDeregRecords = await fetchFleetRecordsForregistrationdeltadereg();
    console.log('\nRegistration Delta De-Registration Records:\n', registrationDeltaDeregRecords);

    // ✅ Fetch from registration (using updateBatch ID)
    const registrationRecords = await fetchFleetRecordsForregistration(infleetBatch.id);
    console.log('\nRegistration Records:\n', registrationRecords);

    // ✅ Fetch from registration_dereg
    const registrationDeregRecords = await fetchFleetRecordsForregistrationdereg();
    console.log('\nRegistration De-Registration Records:\n', registrationDeregRecords);

  } catch (err) {
    console.error('❌ Error occurred:', err.message);
  }
})();

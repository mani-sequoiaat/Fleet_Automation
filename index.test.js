

// Suppress console.log unless it's an error
beforeAll(() => {
  const originalLog = console.log;
  console.log = (...args) => {
    if (args.some(a => typeof a === 'string' && a.toLowerCase().includes('error'))) {
      originalLog.apply(console, args);
    }
  };
});


require('./test/01_file_details.test');
require('./test/02_batch_details.test');
require('./test/03_bronze_fleet.test');
require('./test/04_silver_fleet_error.test');
require('./test/05_silver_fleet.test');
require('./test/06_silver_delta_infleet.test');
require('./test/07_silver_delta_defleet.test');
require('./test/08_silver_delta_update.test');
require('./test/09_fleet.test');
require('./test/10_fleet_history.test');
require('./test/11_registration_delta.test');
require('./test/12_registration.test');

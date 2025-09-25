// const { closeClient } = require('./dbClient');

// // Suppress console.log unless it's an error
// beforeAll(() => {
//   const originalLog = console.log;
//   console.log = (...args) => {
//     if (args.some(a => typeof a === 'string' && a.toLowerCase().includes('error'))) {
//       originalLog.apply(console, args);
//     }
//   };
// });

// afterAll(async () => {
//   await closeClient(); // close connection once at end
// });

// // Import all test files
// require('./test/validate-fleet-file-details.test');
// require('./test/validate-fleet-batch.test');
// require('./test/validate-b-fleet.test');
// require('./test/validate-s-fleet-error.test');
// require('./test/validate-s-fleet.test');
// require('./test/validate-s-fleet-delta-infleet.test');
// require('./test/validate-s-fleet-delta-defleet.test');
// require('./test/validate-s-fleet-delta-update.test');
// require('./test/validate-fleet.test');
// require('./test/validate-fleet-history.test');
// require('./test/validate-registration-delta.test');
// require('./test/validate-registration.test');

Fleet_Automation
Automated end-to-end testing framework for validating fleet data ingestion, transformation, and registration processes in Azure Data Platform.
This project covers:

Data Flow Validation – Verifies ingestion from SFTP to Blob to Bronze/Silver tables.

SQL-Based Checks – Ensures transformation rules, error handling, and data integrity across tables (b_fleet, s_fleet, s_fleet_error, fleet, registration_delta, registration).

Process Coverage – Includes In-Fleet, De-Fleet, and Update scenarios, along with deregistration and historical records.

Automation Stack – Uses Jest for JavaScript-based test automation with direct SQL queries for backend validation.

Reusable Test Suites – Structured test cases for each processing stage with clear pass/fail criteria.

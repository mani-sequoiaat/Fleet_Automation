require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { Client } = require('pg');

const credential = new DefaultAzureCredential();

const server = process.env.AZURE_PG_HOST;
const database = process.env.AZURE_PG_DATABASE;
const username = process.env.AZURE_PG_USERNAME;

async function createClient() {
  const tokenResponse = await credential.getToken(
    "https://ossrdbms-aad.database.windows.net"
  );
  const client = new Client({
    host: server,
    database: database,
    user: username,
    password: tokenResponse.token,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

module.exports = { createClient };

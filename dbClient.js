require('dotenv').config({ debug: false });
const { DefaultAzureCredential } = require('@azure/identity');
const { Client } = require('pg');

const credential = new DefaultAzureCredential();

const server = process.env.AZURE_PG_HOST;
const database = process.env.AZURE_PG_DATABASE;
const username = process.env.AZURE_PG_USERNAME;

let sharedClient = null;

async function getClient({ databaseName }) {
  if (sharedClient) return sharedClient;

  const tokenResponse = await credential.getToken("https://ossrdbms-aad.database.windows.net");

  sharedClient = new Client({
    host: server,
    database: databaseName,
    user: username,
    password: tokenResponse.token,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  await sharedClient.connect();
  return sharedClient;
}

async function closeClient() {
  if (sharedClient) {
    await sharedClient.end();
    sharedClient = null;
  }
}

module.exports = { getClient, closeClient };

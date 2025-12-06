import { Client } from "pg";

function validateEnv() {
  const required = [
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DB",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Variável de ambiente ausente: ${key}`);
    }
  }
}

function createClient() {
  validateEnv();

  const host = process.env.POSTGRES_HOST;
  const isNeon = host.includes("neon.tech");

  return new Client({
    host,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: isNeon ? { require: true, rejectUnauthorized: false } : false,
  });
}

async function query(queryObject) {
  const client = createClient();

  console.log("Conectando ao Postgres:", {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    ssl: process.env.POSTGRES_HOST.includes("neon.tech")
      ? "Neon SSL"
      : "Local (sem SSL)",
  });

  try {
    await client.connect();
    return await client.query(queryObject);
  } catch (error) {
    console.error("Erro no banco:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function getNewClient() {
  const client = createClient();
  await client.connect();
  return client;
}

export default { query, getNewClient };

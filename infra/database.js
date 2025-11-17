import { Client } from "pg";

const isProduction = process.env.NODE_ENV === "production";

function createClient() {
  const isNeon = process.env.POSTGRES_HOST.includes("neon.tech");

  return new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT), // ✔️ corrigido
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: isNeon
      ? { require: true, rejectUnauthorized: false } // ✔️ Neon exige
      : false, // ✔️ local
  });
}

async function query(queryObject) {
  const client = createClient();

  console.log("Credenciais do postgres:", {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: isProduction ? "SSL ON (by NODE_ENV)" : "SSL OFF (NODE_ENV)",
    sslReal: process.env.POSTGRES_HOST.includes("neon.tech")
      ? "SSL FORÇADO POR NEON"
      : "SEM SSL",
  });

  try {
    await client.connect();
    return await client.query(queryObject);
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
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

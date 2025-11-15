import { Client } from "pg";

const isProduction = process.env.NODE_ENV === "production";

function createClient() {
  return new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: isProduction
      ? { require: true, rejectUnauthorized: false } // ✔️ Neon exige SSL
      : false, // ✔️ local/tests: sem SSL
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
    ssl: isProduction ? "SSL ON" : "SSL OFF",
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function getNewClient() {
  const client = createClient();
  await client.connect(); // ✔️ conecta aqui
  return client;
}

export default { query, getNewClient };

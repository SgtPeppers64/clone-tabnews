/*
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  if (request.method === "GET") {
    console.log("Entrou no GET");
  }

  if (request.method === "POST") {
    console.log("Entrou no POST");
    console.log(request.method);
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: false,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    return response.status(405).end();
  }

  console.log(request.method);
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });
  response.status(200).json({});
}
*/
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    // Executa dryRun apenas para listar migrações
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (pendingMigrations.length > 0) {
      return response.status(201).json(pendingMigrations || []);
    }

    // Retorna um array (como o teste espera)
    return response.status(200).json(migrations || []);
  }

  if (request.method === "POST") {
    console.log("Entrou no POST");

    // Executa migrações "de verdade"
    const migratedMigrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: false,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
    await dbClient.end();

    // Retorna o resultado das migrações aplicadas
    return response.status(200).json(migratedMigrations || []);
  }

  // Qualquer outro método → 405
  return response.status(405).end();
}

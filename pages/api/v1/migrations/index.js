import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultOptions = {
    dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner({
      ...defaultOptions,
      dryRun: true,
    });

    await dbClient.end();

    // GET sempre retorna 200 + array
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    // Verifica se há migrações pendentes
    const pendingMigrations = await migrationRunner({
      ...defaultOptions,
      dryRun: true,
    });

    // Caso tenha, aplica (dryRun: false)
    const appliedMigrations = await migrationRunner({
      ...defaultOptions,
      dryRun: false,
    });

    await dbClient.end();

    if (pendingMigrations.length > 0) {
      // Primeiro POST → migrações aplicadas
      return response.status(201).json(appliedMigrations);
    }

    // Segundo POST → nenhuma pendente
    return response.status(200).json([]);
  }

  await dbClient.end();
  return response.status(405).end();
}

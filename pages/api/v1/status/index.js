import database from "infra/database.js";

async function status(request, response) {
  const updateAt = new Date().toISOString();
  const databaseVersionResult = await database.query("SELECT version();");
  const databaseVersionValue = databaseVersionResult.rows[0].version;
  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue = await response.status(200).json({
    update_at: updateAt,
    dependencies: {
      version: databaseVersionValue,
      max_connections: parseInt(databaseMaxConnectionsValue),
      opened_connections: databaseOpenedConnectionsValue,
    },
  });

  const databaseName = process.env.POSTGRES_DB;
  console.log("Banco de dados selecionado: ${databaseName}");

  const databaseOpenedConnectionsResult = await database.query(
    "SELECT count(*)::int FROM pg_stat_activity WHERE datname = '" +
      databaseName +
      "';",
    //"SELECT count(*)::int FROM pg_stat_activity WHERE datname = 'local_db´
  );

  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;
}

export default status;

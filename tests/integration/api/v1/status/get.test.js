test("GET to /api/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.update_at).toBeDefined();

  new Date(responseBody.update_at).toISOString();

  expect(responseBody.dependencies.database.version).toEqual("16.0");
  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);

  test.only("Teste de SQL Injection", async () => {
    await fetch("https://localhost:3000/api/v1/status?databaseName=local_db");
  });
});

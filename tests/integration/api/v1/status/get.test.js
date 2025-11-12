test("GET to /api/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.update_at).toBeDefined();
  new Date(responseBody.update_at).toISOString();

  expect(responseBody.dependencies.version).toMatch(/16\./);
  expect(responseBody.dependencies.max_connections).toEqual(901);
  expect(responseBody.dependencies.opened_connections).toEqual(1);
});

// Teste separado, fora do outro
test("Teste de SQL Injection", async () => {
  await fetch("http://localhost:3000/api/v1/status?databaseName=local_db");
});

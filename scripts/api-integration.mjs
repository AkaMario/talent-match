// Prueba de API contra PostgreSQL real con un emisor JWT efímero de prueba.
// No prueba Keycloak ni sustituye el smoke test del despliegue completo.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
const { privateKey, publicKey } = await generateKeyPair("RS256");
const jwk = {
  ...(await exportJWK(publicKey)),
  kid: "integration-test",
  alg: "RS256",
  use: "sig",
};
const jwks = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ keys: [jwk] }));
});
await new Promise((r) => jwks.listen(0, "127.0.0.1", r));
process.env.KEYCLOAK_JWKS = `http://127.0.0.1:${jwks.address().port}/certs`;
process.env.KEYCLOAK_ISSUER = "http://integration.test/realms/talentmatch";
process.env.DATABASE_URL ||=
  "postgres://talentmatch@127.0.0.1:55432/talentmatch";
process.env.OLLAMA_URL = "http://127.0.0.1:1";
const { default: appModule } = await import("../apps/api/dist/app.js");
const app = await appModule.createApp();
await app.listen(0, "127.0.0.1");
const base = await app.getUrl();
const { Pool } = await import("pg");
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const studentId = "11111111-1111-4111-8111-111111111111",
  companyId = "22222222-2222-4222-8222-222222222222",
  otherId = "33333333-3333-4333-8333-333333333333";
async function token(id, role, options = {}) {
  return new SignJWT({
    realm_access: { roles: [role] },
    name: "Test",
    email: "test@example.local",
  })
    .setProtectedHeader({ alg: "RS256", kid: "integration-test" })
    .setIssuer(options.issuer || process.env.KEYCLOAK_ISSUER)
    .setSubject(id)
    .setAudience(options.audience || "talentmatch-api")
    .setIssuedAt()
    .setExpirationTime(options.expiration || "5m")
    .sign(privateKey);
}
async function call(path, auth, options = {}, status = 200) {
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  const data = await response.json();
  assert.equal(response.status, status, `${path}: ${JSON.stringify(data)}`);
  return data;
}
let createdId;
try {
  const student = await token(studentId, "student"),
    company = await token(companyId, "company"),
    other = await token(otherId, "company");
  await call("/health");
  await call("/me", null, {}, 401);
  await call("/me", student + "x", {}, 401);
  await call(
    "/me",
    await token(studentId, "student", { audience: "different-api" }),
    {},
    401,
  );
  await call(
    "/me",
    await token(studentId, "student", { issuer: "http://wrong-issuer" }),
    {},
    401,
  );
  await call(
    "/me",
    await token(studentId, "student", { expiration: "-1m" }),
    {},
    401,
  );
  await call("/me", await token(studentId, "admin"), {}, 403);
  assert.equal((await call("/me", student)).role, "student");
  await call("/me", other);
  console.log(
    "✓ JWT: firma, emisor, audiencia, expiración, rol y ausencia de token",
  );
  const profile = await call("/me", student);
  const body = Object.fromEntries(
    [
      "name",
      "career",
      "semester",
      "bio",
      "skills",
      "projects",
      "certifications",
    ].map((k) => [k, profile[k]]),
  );
  await call("/me", student, {
    method: "PUT",
    body: JSON.stringify({
      ...body,
      skills: [" Python ", "SQL", "python", "PowerBI"],
    }),
  });
  assert.deepEqual((await call("/me", student)).skills, [
    "Python",
    "SQL",
    "PowerBI",
  ]);
  const opportunities = await call("/opportunities", student);
  assert.equal(opportunities.find((o) => o.id.endsWith("aaa1")).score, 75);
  await call(
    "/me",
    student,
    { method: "PUT", body: JSON.stringify({ ...body, role: "company" }) },
    400,
  );
  await call(
    "/me",
    student,
    { method: "PUT", body: JSON.stringify({ ...body, semester: 50 }) },
    400,
  );
  await call("/me", student, { method: "PUT", body: JSON.stringify(body) });
  console.log(
    "✓ Actualización de perfil, normalización, cálculo real y validación",
  );
  const vacancy = {
    title: "Práctica aislada",
    description:
      "Práctica para validar autorización y persistencia en la prueba integral.",
    area: "Datos",
    modality: "Remoto",
    location: "Colombia",
    skills: ["SQL", "Power BI"],
  };
  await call(
    "/opportunities",
    student,
    { method: "POST", body: JSON.stringify(vacancy) },
    403,
  );
  const created = await call(
    "/opportunities",
    company,
    { method: "POST", body: JSON.stringify(vacancy) },
    201,
  );
  createdId = created.id;
  assert.equal((await call("/opportunities", other)).length, 0);
  await call(
    `/opportunities/${created.id}/toggle`,
    other,
    { method: "POST" },
    404,
  );
  await call(
    `/opportunities/${created.id}/toggle`,
    company,
    { method: "POST" },
    201,
  );
  assert.ok(
    !(await call("/opportunities", student)).some((o) => o.id === created.id),
  );
  await call(
    "/applications",
    student,
    {
      method: "POST",
      body: JSON.stringify({ opportunityId: created.id, documentId: otherId }),
    },
    400,
  );
  await call(
    `/opportunities/${created.id}/toggle`,
    company,
    { method: "POST" },
    201,
  );
  const [{ id: docId }] = (
    await db.query(
      "INSERT INTO documents(owner_id,name,object_key,kind,size) VALUES($1,'integration.pdf','integration-test-only','cv',50) RETURNING id",
      [studentId],
    )
  ).rows;
  const [{ id: otherDoc }] = (
    await db.query(
      "INSERT INTO documents(owner_id,name,object_key,kind,size) VALUES($1,'other.pdf','integration-other-only','cv',50) RETURNING id",
      [otherId],
    )
  ).rows;
  await call(
    "/applications",
    student,
    {
      method: "POST",
      body: JSON.stringify({ opportunityId: created.id, documentId: otherDoc }),
    },
    400,
  );
  const application = await call(
    "/applications",
    student,
    {
      method: "POST",
      body: JSON.stringify({ opportunityId: created.id, documentId: docId }),
    },
    201,
  );
  await call(
    "/applications",
    student,
    {
      method: "POST",
      body: JSON.stringify({ opportunityId: created.id, documentId: docId }),
    },
    409,
  );
  assert.equal((await call("/applications", other)).length, 0);
  await call(
    `/applications/${application.id}/status`,
    other,
    { method: "PUT", body: JSON.stringify({ status: "Aceptada" }) },
    404,
  );
  await call(
    `/applications/${application.id}/status`,
    student,
    { method: "PUT", body: JSON.stringify({ status: "Aceptada" }) },
    403,
  );
  await call(`/applications/${application.id}/status`, company, {
    method: "PUT",
    body: JSON.stringify({ status: "Entrevista" }),
  });
  assert.equal(
    (await call("/applications", student)).find((a) => a.id === application.id)
      .status,
    "Entrevista",
  );
  await call(`/documents/${docId}/download`, other, {}, 404);
  console.log(
    "✓ Aislamiento entre empresas, convocatoria cerrada, CV propio, duplicados y estados",
  );
  const data = new FormData();
  data.append("kind", "cv");
  data.append(
    "file",
    new Blob(["fake pdf"], { type: "application/pdf" }),
    "fake.pdf",
  );
  await call("/documents", student, { method: "POST", body: data }, 400);
  const result = await call(
    `/opportunities/${created.id}/plan`,
    student,
    { method: "POST" },
    201,
  );
  assert.equal(result.source, "fallback");
  assert.ok(result.plan.length > 0);
  console.log(
    "✓ Rechazo de PDF inválido y continuidad cuando Ollama no está disponible",
  );
  console.log("Pruebas API + PostgreSQL completadas.");
} finally {
  if (createdId) {
    await db.query("DELETE FROM applications WHERE opportunity_id=$1", [
      createdId,
    ]);
    await db.query("DELETE FROM opportunities WHERE id=$1", [createdId]);
  }
  await db.query(
    "DELETE FROM documents WHERE object_key IN ('integration-test-only','integration-other-only')",
  );
  await db.query("DELETE FROM profiles WHERE id=$1", [otherId]);
  await db.end();
  await app.close();
  await new Promise((r) => jwks.close(r));
}

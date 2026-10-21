import assert from "node:assert/strict";
import { demoPdf } from "./create-demo-cv.mjs";
const base = process.env.APP_URL || "http://localhost:5173";
async function token(username) {
  const r = await fetch(
    "http://localhost:8080/realms/talentmatch/protocol/openid-connect/token",
    {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "talentmatch-web",
        username,
        password: "Demo2026!",
      }),
    },
  );
  const data = await r.json();
  assert.equal(r.status, 200, JSON.stringify(data));
  return data.access_token;
}
async function call(path, token, options = {}, status = 200) {
  const r = await fetch(`${base}/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await r.json();
  assert.equal(r.status, status, `${path}: ${JSON.stringify(data)}`);
  return data;
}
const student = await token("estudiante"),
  company = await token("empresa");
await call("/health");
await call("/me", null, {}, 401);
await call("/me", "invalid", {}, 401);
const profile = await call("/me", student);
assert.equal(profile.role, "student");
assert.equal((await call("/me", company)).role, "company");
console.log("✓ Keycloak, firma JWT, audiencia y roles");
const profileBody = Object.fromEntries(
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
try {
  const edited = await call("/me", student, {
    method: "PUT",
    body: JSON.stringify({
      ...profileBody,
      bio: "Perfil de demostración actualizado por prueba integral.",
    }),
  });
  assert.match(edited.bio, /prueba integral/);
  assert.equal((await call("/me", student)).bio, edited.bio);
  await call(
    "/me",
    student,
    { method: "PUT", body: JSON.stringify({ ...profileBody, semester: 99 }) },
    400,
  );
  await call(
    "/me",
    student,
    {
      method: "PUT",
      body: JSON.stringify({ ...profileBody, role: "company" }),
    },
    400,
  );
} finally {
  await call("/me", student, {
    method: "PUT",
    body: JSON.stringify(profileBody),
  });
}
console.log(
  "✓ Perfil persistente, validación y protección contra elevación de rol",
);
const vacancy = {
  title: "Practicante de inteligencia de negocios",
  description:
    "Apoya la construcción de consultas y reportes para nuestro equipo de datos.",
  area: "Datos",
  modality: "Remoto",
  location: "Colombia",
  skills: ["Python", "SQL", "Power BI"],
};
await call(
  "/opportunities",
  student,
  { method: "POST", body: JSON.stringify(vacancy) },
  403,
);
let vacancies = await call("/opportunities", company);
let op = vacancies.find((o) => o.title === vacancy.title);
if (!op)
  op = await call(
    "/opportunities",
    company,
    { method: "POST", body: JSON.stringify(vacancy) },
    201,
  );
if (!op.active)
  await call(
    `/opportunities/${op.id}/toggle`,
    company,
    { method: "POST" },
    201,
  );
const listed = await call("/opportunities", student);
assert.ok(listed.find((o) => o.id === op.id));
assert.ok(listed.every((o, i) => i === 0 || listed[i - 1].score >= o.score));
await call(`/opportunities/${op.id}/toggle`, student, { method: "POST" }, 403);
await call(
  "/opportunities/not-a-uuid/toggle",
  company,
  { method: "POST" },
  400,
);
console.log("✓ Publicación real, listado ordenado y permisos de empresa");
let docs = await call("/documents", student);
let cv = docs.find((d) => d.name === "CV-Mariana-Torres.pdf");
if (!cv) {
  const data = new FormData();
  data.append("kind", "cv");
  data.append(
    "file",
    new Blob([demoPdf()], { type: "application/pdf" }),
    "CV-Mariana-Torres.pdf",
  );
  cv = await call("/documents", student, { method: "POST", body: data }, 201);
}
const invalid = new FormData();
invalid.append("kind", "cv");
invalid.append(
  "file",
  new Blob(["not pdf"], { type: "application/pdf" }),
  "fake.pdf",
);
await call("/documents", student, { method: "POST", body: invalid }, 400);
const before = await fetch(`${base}/api/documents/${cv.id}/download`, {
  headers: { Authorization: `Bearer ${company}` },
});
const apps = await call("/applications", student);
const existing = apps.find((a) => a.opportunity_id === op.id);
// La empresa no tiene acceso al documento hasta que el estudiante lo comparta.
if (!existing) assert.equal(before.status, 404);
const downloaded = await fetch(`${base}/api/documents/${cv.id}/download`, {
  headers: { Authorization: `Bearer ${student}` },
});
assert.equal(downloaded.status, 200);
assert.ok(
  Buffer.from(await downloaded.arrayBuffer())
    .subarray(0, 5)
    .equals(Buffer.from("%PDF-")),
);
console.log(
  "✓ PDF privado almacenado y recuperado desde MinIO; rechazo de archivos inválidos",
);
const apply = {
  method: "POST",
  body: JSON.stringify({ opportunityId: op.id, documentId: cv.id }),
};
let application =
  existing || (await call("/applications", student, apply, 201));
await call("/applications", student, apply, 409);
await call("/applications", company, apply, 403);
const candidates = await call("/applications", company);
assert.ok(candidates.find((a) => a.id === application.id));
await call(
  `/applications/${application.id}/status`,
  student,
  { method: "PUT", body: JSON.stringify({ status: "Aceptada" }) },
  403,
);
await call(`/applications/${application.id}/status`, company, {
  method: "PUT",
  body: JSON.stringify({ status: "En revisión" }),
});
assert.equal(
  (await call("/applications", student)).find((a) => a.id === application.id)
    .status,
  "En revisión",
);
const shared = await fetch(`${base}/api/documents/${cv.id}/download`, {
  headers: { Authorization: `Bearer ${company}` },
});
assert.equal(shared.status, 200);
console.log(
  "✓ Postulación, duplicados, autorización de CV compartido y seguimiento de estado",
);
await call(`/opportunities/${op.id}/toggle`, company, { method: "POST" }, 201);
assert.ok(!(await call("/opportunities", student)).some((o) => o.id === op.id));
await call(`/opportunities/${op.id}/plan`, student, { method: "POST" }, 404);
await call(`/opportunities/${op.id}/toggle`, company, { method: "POST" }, 201);
console.log("✓ Cierre y reapertura de convocatorias");
if (!process.env.SKIP_AI) {
  const result = await call(
    `/opportunities/${op.id}/plan`,
    student,
    { method: "POST" },
    201,
  );
  assert.equal(
    result.source,
    "ollama",
    `Se esperaba IA real: ${JSON.stringify(result)}`,
  );
  assert.ok(result.plan.length > 0);
  console.log("✓ Plan real de Ollama:", JSON.stringify(result.plan));
}
console.log("Todas las pruebas integrales completadas.");

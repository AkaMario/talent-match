import { test } from "node:test";
import assert from "node:assert/strict";
import { match, cleanSkills, validatePlan } from "../src/matching";
test("matching explains the documented Python + SQL / Power BI gap", () => {
  assert.deepEqual(match(["Python", "SQL"], ["Python", "SQL", "Power BI"]), {
    score: 67,
    matched: ["Python", "SQL"],
    missing: ["Power BI"],
  });
});
test("normalizes accents and aliases without inflating duplicate requirements", () => {
  assert.deepEqual(
    match(
      ["POWERBI", "postgres", "Trabajo en equipo"],
      ["Power BI", "PostgreSQL", "powerbi", "Trábajo en equipo"],
    ),
    {
      score: 100,
      matched: ["Power BI", "PostgreSQL", "Trábajo en equipo"],
      missing: [],
    },
  );
  assert.deepEqual(cleanSkills(["  ", "SQL", "sql"]), ["SQL"]);
  assert.equal(match([], []).score, 0);
});
test("rejects hallucinated, duplicate and empty model recommendations", () => {
  assert.throws(() =>
    validatePlan(
      [{ skill: "Rust", action: "Practica construyendo un proyecto." }],
      ["SQL"],
    ),
  );
  assert.throws(() =>
    validatePlan(
      [
        { skill: "SQL", action: "Construye una consulta." },
        { skill: "sql", action: "Construye otra consulta." },
      ],
      ["SQL"],
    ),
  );
  assert.throws(() => validatePlan([], ["SQL"]));
  assert.deepEqual(
    validatePlan(
      [{ skill: "sql", action: "Construye consultas con JOIN." }],
      ["SQL"],
    ),
    [{ skill: "SQL", action: "Construye consultas con JOIN." }],
  );
});

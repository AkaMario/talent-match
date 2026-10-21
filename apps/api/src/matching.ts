const aliases: Record<string, string> = {
  nodejs: "node.js",
  "node js": "node.js",
  postgres: "postgresql",
  powerbi: "power bi",
  "rest api": "apis rest",
  "rest apis": "apis rest",
  "api rest": "apis rest",
  js: "javascript",
  ts: "typescript",
  teamwork: "trabajo en equipo",
};
export function normalize(value: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return aliases[cleaned] || cleaned;
}
export function cleanSkills(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((v) => v.trim())
    .filter((v) => {
      const n = normalize(v);
      if (!n || seen.has(n)) return false;
      seen.add(n);
      return true;
    });
}
export function match(profileSkills: string[], requiredSkills: string[]) {
  const owned = new Set(profileSkills.map(normalize));
  const required = cleanSkills(requiredSkills);
  const matched = required.filter((s) => owned.has(normalize(s)));
  const missing = required.filter((s) => !owned.has(normalize(s)));
  return {
    score: required.length
      ? Math.round((matched.length / required.length) * 100)
      : 0,
    matched,
    missing,
  };
}
export function fallbackPlan(missing: string[]) {
  return missing
    .slice(0, 6)
    .map((skill) => ({
      skill,
      action: `Practica ${skill} con un proyecto pequeño, documenta el resultado y añade la evidencia a tu perfil.`,
    }));
}
export function validatePlan(value: unknown, missing: string[]) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 6)
    throw new Error("Invalid AI response");
  const allowed = new Map(missing.map((s) => [normalize(s), s]));
  const seen = new Set<string>();
  return value.map((item) => {
    if (
      !item ||
      typeof item.skill !== "string" ||
      typeof item.action !== "string" ||
      item.action.trim().length < 10 ||
      item.action.length > 700
    )
      throw new Error("Invalid AI response");
    const key = normalize(item.skill);
    const skill = allowed.get(key);
    if (!skill || seen.has(key)) throw new Error("Invalid AI skill");
    seen.add(key);
    return { skill, action: item.action.trim() };
  });
}

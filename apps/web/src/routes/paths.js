export const PORTALS = {
  student: { root: "estudiante", applications: "postulaciones" },
  company: { root: "empresa", applications: "candidatos" },
};

export function getPortalPaths(role) {
  const portal = PORTALS[role];
  if (!portal) throw new Error("Rol de portal no válido.");
  const base = `/${portal.root}`;
  return {
    home: base,
    opportunities: `${base}/practicas`,
    profile: `${base}/perfil`,
    applications: `${base}/${portal.applications}`,
  };
}

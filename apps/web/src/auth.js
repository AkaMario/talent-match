import Keycloak from "keycloak-js";
export const auth = new Keycloak({
  url: "http://localhost:8080",
  realm: "talentmatch",
  clientId: "talentmatch-web",
});
auth.onAuthSuccess = () => sessionStorage.setItem("talentmatch-session", "1");
auth.onAuthLogout = () => sessionStorage.removeItem("talentmatch-session");
export const ready = auth.init({
  ...(sessionStorage.getItem("talentmatch-session") ? { onLoad: "check-sso" } : {}),
  pkceMethod: "S256",
  checkLoginIframe: false,
});
export async function request(path, options = {}) {
  try {
    await auth.updateToken(40);
  } catch {
    throw new Error("La sesión expiró. Cierra sesión e ingresa nuevamente.");
  }
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${auth.token}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(". ")
        : data.message || "No se pudo completar la operación.",
    );
  }
  return response.json();
}
export async function download(id, name) {
  try {
    await auth.updateToken(40);
  } catch {
    throw new Error("La sesión expiró. Cierra sesión e ingresa nuevamente.");
  }
  const response = await fetch(`/api/documents/${id}/download`, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  if (!response.ok) throw new Error("No se pudo descargar el documento.");
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

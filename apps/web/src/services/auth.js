import Keycloak from "keycloak-js";
export const auth = new Keycloak({
  url: "http://localhost:8080",
  realm: "talentmatch",
  clientId: "talentmatch-web",
});
auth.onAuthSuccess = () => sessionStorage.setItem("talentmatch-session", "1");
auth.onAuthLogout = () => sessionStorage.removeItem("talentmatch-session");
export const ready = auth.init({
  ...(sessionStorage.getItem("talentmatch-session")
    ? { onLoad: "check-sso" }
    : {}),
  pkceMethod: "S256",
  checkLoginIframe: false,
});

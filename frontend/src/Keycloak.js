import Keycloak from "keycloak-js";

let keycloakInstance = null;
let initPromise = null;

const keycloak = new Keycloak({
  url: "http://localhost:8180",
  realm: "shopwise-realm",
  clientId: "shopwise-client",
});

// Initialize keycloak only once
if (!keycloak.authenticated) {
  initPromise = keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
  });
}

export { initPromise };
export default keycloak;

import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180",
  realm: "shopwise-realm",
  clientId: "shopwise-client",
});

export default keycloak;
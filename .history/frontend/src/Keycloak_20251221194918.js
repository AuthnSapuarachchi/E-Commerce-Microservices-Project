import Keycloak from "keycloak-js";

let keycloakInstance = null;

const getKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: "http://localhost:8180",
      realm: "shopwise-realm",
      clientId: "shopwise-client",
    });
  }
  return keycloakInstance;
};

export default getKeycloak();

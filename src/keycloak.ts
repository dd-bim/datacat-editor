import Keycloak from 'keycloak-js';

const keycloak = Keycloak({
    url: process.env.REACT_APP_AUTH_URL,
    realm: process.env.REACT_APP_AUTH_REALM ?? "",
    clientId: process.env.REACT_APP_AUTH_CLIENT_ID ?? "",
});

export default keycloak;

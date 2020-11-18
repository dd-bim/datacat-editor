import {useKeycloak} from "@react-keycloak/web";

export const useGraphiQLFetcher = () => {
    const {keycloak} = useKeycloak();
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (keycloak.token) {
        headers = { 'Authorization': `Bearer ${keycloak.token}`, ...headers };
    }
    return (params: any) => fetch(process.env.REACT_APP_API as string, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
    }).then(response => response.json());
}

export default useGraphiQLFetcher;

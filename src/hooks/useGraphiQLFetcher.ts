import useAuthContext from "./useAuthContext";

const useGraphiQLFetcher = () => {
    const {token} = useAuthContext();
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers = { 'Authorization': `Bearer ${token}`, ...headers };
    }
    return (params: any) => fetch(import.meta.env.VITE_API_URL || '/api/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
    }).then(response => response.json());
}

export default useGraphiQLFetcher;

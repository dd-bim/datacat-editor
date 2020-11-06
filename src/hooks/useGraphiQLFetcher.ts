import useAuthContext from "./useAuthContext";

export const useGraphiQLFetcher = () => {
    const {token} = useAuthContext();
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers = { 'Authorization': `Bearer ${token}`, ...headers };
    }
    return (params: any) => fetch(process.env.REACT_APP_API as string, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
    }).then(response => response.json());
}

export default useGraphiQLFetcher;

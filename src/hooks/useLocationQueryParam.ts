import {useLocation} from "react-router-dom";

export default function useLocationQueryParam(key: string, initialValue?: any) {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    if (params.has(key)) {
        return params.get(key);
    }
    return initialValue;
}

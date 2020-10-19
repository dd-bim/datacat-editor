import {useContext} from "react";
import {AuthContext} from "../providers/AuthProvider";

const WRITE_ROLE = 'USER';

export default function useAuthContext() {
    return useContext(AuthContext);
}

export function useWriteAccess() {
    const {hasRole} = useAuthContext();
    return hasRole(WRITE_ROLE);
}

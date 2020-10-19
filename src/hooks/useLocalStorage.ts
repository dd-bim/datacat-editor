import {Dispatch, useState} from "react";

export default function useLocalStorage<S>(key: string, initialState: S): [S, Dispatch<S>] {
    // State to store our id
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<S>(() => {
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);

            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialState;
        } catch (error) {
            // If error also return initialState
            console.warn(error);
            return initialState;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new id to localStorage.
    const setValue = (value: S) => {
        try {
            // Allow id to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value() : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.warn(error);
        }
    };
    return [storedValue, setValue];
}

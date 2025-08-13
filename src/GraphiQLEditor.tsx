import {GraphiQL} from "graphiql";
import "graphiql/graphiql.css";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";
import { useEffect } from "react";

if (typeof window !== "undefined") {
    window.MonacoEnvironment = {
        getWorker: function () {
            // Erstelle einen leeren Worker aus einem leeren Blob
            const blob = new Blob([""], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            return new Worker(url);
        }
    };
}

export default function GraphiQLEditor() {
    const graphiqlFetcher = useGraphiQLFetcher();
    
    useEffect(() => {
        // Force window resize to make GraphiQL adjust to its container
        const resizeEvent = window.setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        
        return () => {
            clearTimeout(resizeEvent);
        };
    }, []);
    
    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <GraphiQL 
                fetcher={graphiqlFetcher}
                defaultEditorToolsVisibility={true}
                isHeadersEditorEnabled={true}
                shouldPersistHeaders={true}
            />
        </div>
    );
}
import React from "react";
import { GraphiQL } from "graphiql";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";

// Import GraphiQL CSS directly
import "graphiql/style.css";

// Configure Monaco Environment before any Monaco imports
if (typeof window !== 'undefined') {
    (window as any).MonacoEnvironment = {
        getWorker: function () {
            // Create a simple inline worker that does minimal work
            const workerBlob = new Blob([
                `
                self.postMessage = self.postMessage || function() {};
                self.addEventListener('message', function(e) {
                    // Simple echo worker - just respond to keep Monaco happy
                    self.postMessage({ id: e.data.id, result: null });
                });
                `
            ], { type: 'application/javascript' });
            
            return new Worker(URL.createObjectURL(workerBlob));
        }
    };
}

export default function GraphiQLEditor() {
    const fetcher = useGraphiQLFetcher();
    
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <GraphiQL fetcher={fetcher} />
        </div>
    );
}
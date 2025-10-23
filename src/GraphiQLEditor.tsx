import React from "react";
import { GraphiQL } from "graphiql";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";

// Import GraphiQL CSS
import "graphiql/style.css";

/**
 * GraphiQL Editor with Monaco support
 * GraphiQL 5.x uses Monaco by default when available
 */
export default function GraphiQLEditor() {
    const fetcher = useGraphiQLFetcher();
    
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <GraphiQL 
                fetcher={fetcher}
                // Let GraphiQL use Monaco (configured in index.tsx)
            />
        </div>
    );
}

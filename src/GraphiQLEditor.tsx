import React from "react";
import { GraphiQL } from "graphiql";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";

// Import GraphiQL CSS
import "graphiql/style.css";

/**
 * GraphiQL Editor with CodeMirror only
 * Monaco and monaco-graphql have been completely removed
 */
export default function GraphiQLEditor() {
    const fetcher = useGraphiQLFetcher();
    
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <GraphiQL fetcher={fetcher} />
        </div>
    );
}

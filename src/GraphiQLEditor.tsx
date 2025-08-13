import React from "react";
import { GraphiQL } from "graphiql";
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";

// Import GraphiQL CSS directly
import "graphiql/style.css";

export default function GraphiQLEditor() {
    const fetcher = useGraphiQLFetcher();
    
    return (
        <div style={{ height: "100%", width: "100%" }}>
            <GraphiQL fetcher={fetcher} />
        </div>
    );
}
import {GraphiQL} from "graphiql";
import "graphiql/graphiql.css"; // Import the CSS for proper styling
import useGraphiQLFetcher from "./hooks/useGraphiQLFetcher";
import { useEffect, useState } from "react";

// Updated styles to balance panel widths
const graphiqlStyles = `
/* Reset styling */
html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: auto; /* Changed to auto to allow scrolling when needed */
}

/* Main container */
.graphiql-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Minimum height */
  min-height: 600px; /* Ensure a minimum height to prevent excessive squishing */
  width: 100%;
}

/* Header */
.header-title {
  padding: 6px 0;
  text-align: center;
  font-size: 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

/* Main content area */
.graphiql-main {
  flex: 1;
  min-height: 0;
  position: relative;
  padding-bottom: 40px; /* Added padding to ensure space for bottom elements */
}

/* GraphiQL container */
.graphiql-container {
  height: 100% !important;
  width: 100% !important;
}

/* Balance panel widths when Document Explorer is open */
.graphiql-container .graphiql-editor {
  min-width: 33% !important;
  max-width: none !important;
  flex: 1 !important;
}

.graphiql-container .result-window {
  min-width: 33% !important;
  max-width: none !important;
  flex: 1 !important;
}

/* Limit Document Explorer width */
.graphiql-container .docExplorerWrap {
  min-width: 220px !important;
  width: 25% !important;
  max-width: 30% !important;
}

/* Adjust tabs to not shrink too much */
.graphiql-container .graphiql-tab-title {
  min-width: 60px;
}

/* Make sure the session layout is proper */
.graphiql-container .graphiql-session {
  display: flex !important;
}

/* Footer */
.footer-info {
  position: fixed; /* Changed to fixed to ensure it's always visible */
  bottom: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 6px 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 11px;
  z-index: 999;
}

/* Make core GraphiQL components fill available space */
.graphiql-container .graphiql-sessions,
.graphiql-container .graphiql-session {
  height: 100% !important;
}

/* Ensure GraphiQL bottom controls are visible */
.graphiql-container .graphiql-session-footer {
  margin-bottom: 40px; /* Add margin to ensure controls aren't cut off */
}

/* Hide GraphiQL's built-in footer if it exists */
.graphiql-container .graphiql-doc-explorer-back,
.graphiql-container .graphiql-doc-explorer-reset {
  display: none !important;
}

/* Hide any built-in contact/feedback elements that might appear */
.graphiql-container .feedback-link,
.graphiql-container .contact-link,
.graphiql-container .graphiql-footer {
  display: none !important;
}

/* Small screens */
@media (max-width: 768px), (max-height: 600px) {
  .header-title {
    padding: 4px 0;
    font-size: 14px;
  }
  
  .footer-info {
    padding: 4px 6px;
    font-size: 10px;
  }
}
`;

export default function GraphiQLEditor() {
    const graphiqlFetcher = useGraphiQLFetcher();
    const [appVersion] = useState(import.meta.env.VITE_APP_VERSION || "1.0 beta");
    
    useEffect(() => {
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.textContent = graphiqlStyles;
        document.head.appendChild(styleEl);
        
        // Force window resize to make GraphiQL adjust to its container
        const resizeEvent = window.setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        
        // Cleanup when component unmounts
        return () => {
            document.head.removeChild(styleEl);
            clearTimeout(resizeEvent);
        };
    }, []);
    
    return (
        <div className="graphiql-wrapper">
            <div className="header-title">GraphiQL Editor</div>
            <div className="graphiql-main">
                <GraphiQL 
                    fetcher={graphiqlFetcher}
                    defaultEditorToolsVisibility={true}
                    isHeadersEditorEnabled={true}
                    shouldPersistHeaders={true}
                    dangerouslyAssumeSchemaIsValid={true}
                    defaultTabs={[{query: "", variables: "", headers: ""}]}
                    aria-label="GraphiQL IDE"
                    // Disable any built-in feedback or contact functionality
                    showPersistHeadersSettings={false}
                />
            </div>
            <div className="footer-info">
                <div style={{ marginBottom: '3px' }}>
                    <a href="#" style={{ marginRight: '12px', textDecoration: 'none', color: '#666' }}>Fragen & Kontakt</a>
                    <a href="#" style={{ textDecoration: 'none', color: '#666' }}>Problem melden</a>
                </div>
                <div style={{ color: '#888' }}>datacat editor {appVersion}</div>
            </div>
        </div>
    );
}

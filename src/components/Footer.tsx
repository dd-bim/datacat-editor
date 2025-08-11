import React from "react";
import { T } from "@tolgee/react";

// Floating Footer Styles wie im GraphiQLEditor
const footerStyles: React.CSSProperties = {
  position: "fixed",
  bottom: 8,
  right: 8,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: "6px 10px",
  borderRadius: "4px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  fontSize: "11px",
  zIndex: 999,
  minWidth: 220,
  maxWidth: 350,
};

const linkStyles: React.CSSProperties = {
  marginRight: "12px",
  textDecoration: "none",
  color: "#666",
  fontSize: "inherit",
};

export default function Footer() {
  return (
    <div style={footerStyles}>
      <div style={{ marginBottom: "3px" }}>
        <a
          href="https://www.htw-dresden.de/hochschule/fakultaeten/geoinformation/ueber-uns/personen/professoren/prof-dr-ing-christian-clemen"
          target="_blank"
          rel="noopener"
          style={linkStyles}
        >
          <T keyName="footer.contact">Fragen & Kontakt</T>
        </a>
        <a
          href="https://github.com/dd-bim/datacat/issues"
          target="_blank"
          rel="noopener"
          style={{ ...linkStyles, marginRight: 0 }}
        >
          <T keyName="footer.report_issue">Problem melden</T>
        </a>
      </div>
      <div style={{ color: "#888" }}>
        datacat editor {import.meta.env.VITE_APP_VERSION}
      </div>
    </div>
  );
}

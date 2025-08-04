type IDSRequirement = {
  type: "classification" | "attribute" | "property";
  value?: string[] | string;
  modelId?: string;
  valueNames?: string[] | string;
  modelName?: string;
  // Für property:
  propertySet?: string;
  baseName?: string;
  baseNames?: string[]; // Für Enumeration von Merkmalen
  valueList?: string[];
  valueMap?: { [propertyId: string]: string[] }; // Für individuelle Werte pro Merkmal
  dataType?: string;
  uri?: string;
  cardinality?: string;
};

type IDSSpec = {
  id: number;
  name: string;
  applicabilityType: "type";
  ifcVersions: string[]; // Updated to array
  requirements: IDSRequirement[];
  ifcClasses?: string[]; // Updated to array
  ifcClass?: string; // Keep for backward compatibility
};

type IDSInfo = {
  title: string;
  author: string;
  version: string;
  date: string;
};

function esc(s: string) {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlClassification(req: IDSRequirement) {
  // req.valueNames: string[] | string
  // req.modelName: string
  let xml = `        <ids:classification>\n`;
  
  // Value (enumeration list) - nur wenn valueNames vorhanden
  if (Array.isArray(req.valueNames) && req.valueNames.length > 0) {
    xml += `          <ids:value>\n            <xs:restriction base="xs:string">\n`;
    req.valueNames.forEach((val) => {
      xml += `              <xs:enumeration value="${esc(val)}" />\n`;
    });
    xml += `            </xs:restriction>\n          </ids:value>\n`;
  }
  
  // System (pattern) - immer wenn modelName vorhanden
  if (req.modelName) {
    xml += `          <ids:system>\n            <xs:restriction base="xs:string">\n`;
    xml += `              <xs:pattern value="${esc(req.modelName)}" />\n`;
    xml += `            </xs:restriction>\n          </ids:system>\n`;
  }
  
  xml += `        </ids:classification>`;
  return xml;
}

function xmlAttribute(req: IDSRequirement) {
  // req.valueNames: string[] | string
  // req.modelName: string
  let xml = `        <ids:attribute>\n`;
  xml += `          <ids:name>\n            <ids:simpleValue>Name</ids:simpleValue>\n          </ids:name>\n`;
  if (Array.isArray(req.valueNames) && req.valueNames.length > 0) {
    xml += `          <ids:value>\n            <xs:restriction base="xs:string">\n`;
    req.valueNames.forEach((val) => {
      xml += `              <xs:enumeration value="${esc(val)}" />\n`;
    });
    xml += `            </xs:restriction>\n          </ids:value>\n`;
  } else if (typeof req.valueNames === "string" && req.valueNames) {
    xml += `          <ids:value>\n            <xs:restriction base="xs:string">\n`;
    xml += `              <xs:pattern value="${esc(req.valueNames)}" />\n`;
    xml += `            </xs:restriction>\n          </ids:value>\n`;
  }
  xml += `        </ids:attribute>`;
  return xml;
}

function xmlProperty(req: IDSRequirement) {
  // req.propertySet, req.baseName oder req.baseNames, req.valueList, req.dataType, req.uri, req.cardinality
  let xml = `        <ids:property`;
  if (req.dataType) xml += ` dataType="${esc(req.dataType)}"`;
  if (req.uri) xml += ` uri="${esc(req.uri)}"`;
  if (req.cardinality) xml += ` cardinality="${esc(req.cardinality)}"`;
  xml += `>\n`;

  // PropertySet
  if (req.propertySet) {
    xml += `          <ids:propertySet>\n            <ids:simpleValue>${esc(req.propertySet)}</ids:simpleValue>\n          </ids:propertySet>\n`;
  }
  
  // baseName - kann ein einzelner Name oder eine Liste für Enumeration sein
  if ((req as any).baseNames && Array.isArray((req as any).baseNames) && (req as any).baseNames.length > 1) {
    // Mehrere Merkmale als Enumeration
    xml += `          <ids:baseName>\n            <xs:restriction base="xs:string">\n`;
    (req as any).baseNames.forEach((name: string) => {
      xml += `              <xs:enumeration value="${esc(name)}" />\n`;
    });
    xml += `            </xs:restriction>\n          </ids:baseName>\n`;
  } else if ((req as any).baseNames && Array.isArray((req as any).baseNames) && (req as any).baseNames.length === 1) {
    // Ein einzelnes Merkmal
    xml += `          <ids:baseName>\n            <ids:simpleValue>${esc((req as any).baseNames[0])}</ids:simpleValue>\n          </ids:baseName>\n`;
  } else if (req.baseName) {
    // Fallback für alte Struktur
    xml += `          <ids:baseName>\n            <ids:simpleValue>${esc(req.baseName)}</ids:simpleValue>\n          </ids:baseName>\n`;
  }
  
  // value (optional, als xs:restriction)
  if (req.valueList && req.valueList.length > 0) {
    xml += `          <ids:value>\n            <xs:restriction base="xs:string">\n`;
    req.valueList.forEach((val) => {
      xml += `              <xs:enumeration value="${esc(val)}" />\n`;
    });
    xml += `            </xs:restriction>\n          </ids:value>\n`;
  }
  xml += `        </ids:property>`;
  return xml;
}

// Neue Funktion für Properties mit individuellen Werten pro Merkmal
function xmlPropertyWithIndividualValues(req: IDSRequirement, propertyName: string, values: string[]) {
  let xml = `        <ids:property`;
  if (req.dataType) xml += ` dataType="${esc(req.dataType)}"`;
  if (req.uri) xml += ` uri="${esc(req.uri)}"`;
  if (req.cardinality) xml += ` cardinality="${esc(req.cardinality)}"`;
  xml += `>\n`;

  // PropertySet
  if (req.propertySet) {
    xml += `          <ids:propertySet>\n            <ids:simpleValue>${esc(req.propertySet)}</ids:simpleValue>\n          </ids:propertySet>\n`;
  }
  
  // Einzelnes Merkmal
  xml += `          <ids:baseName>\n            <ids:simpleValue>${esc(propertyName)}</ids:simpleValue>\n          </ids:baseName>\n`;
  
  // Individuelle Werte für dieses Merkmal
  if (values && values.length > 0) {
    xml += `          <ids:value>\n            <xs:restriction base="xs:string">\n`;
    values.forEach((val) => {
      xml += `              <xs:enumeration value="${esc(val)}" />\n`;
    });
    xml += `            </xs:restriction>\n          </ids:value>\n`;
  }
  
  xml += `        </ids:property>`;
  return xml;
}

export function convertToIDSXml(
  specs: IDSSpec[],
  info: IDSInfo
): string {
  const esc = (s: string) =>
    (s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<ids:ids xmlns:xs="http://www.w3.org/2001/XMLSchema"`,
    `         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `         xsi:schemaLocation="http://standards.buildingsmart.org/IDS http://standards.buildingsmart.org/IDS/1.0/ids.xsd"`,
    `         xmlns:ids="http://standards.buildingsmart.org/IDS">`,
    `  <ids:info>`,
    `    <ids:title>${esc(info.title || "Untitled")}</ids:title>`,
    `    <ids:version>${esc(info.version || "1.0")}</ids:version>`,
    `    <ids:author>${esc(info.author || "anonymous")}</ids:author>`,
    `    <ids:date>${esc(info.date || new Date().toISOString().split("T")[0])}</ids:date>`,
    `  </ids:info>`,
    `  <ids:specifications>`,
  ];

  specs.forEach((spec, i) => {
    // Verwende sequenzielle Identifier mit "S" Prefix: S1, S2, S3, ...
    const specId = esc(`S${i + 1}`);
    // Handle both array and single version formats for backward compatibility
    const ifcVersionArray = spec.ifcVersions && spec.ifcVersions.length > 0 
      ? spec.ifcVersions 
      : (spec as any).ifcVersion 
        ? [(spec as any).ifcVersion] 
        : ["IFC4"];
    const ifcVersion = esc(ifcVersionArray.join(" "));
    const name = esc(spec.name || `Spec ${i + 1}`);
    
    // Determine IFC classes to use in applicability
    let applicabilityClasses: string[] = [];
    
    if (spec.requirements.some(r => r.type === "attribute")) {
      // For classification applicability, always use IFCCLASSIFICATION
      applicabilityClasses = ["IFCCLASSIFICATION"];
    } else {
      // For type applicability, use selected IFC classes or fallback
      applicabilityClasses = spec.ifcClasses && spec.ifcClasses.length > 0
        ? spec.ifcClasses
        : spec.ifcClass
        ? [spec.ifcClass]
        : ["IfcRoot"];
    }

    lines.push(`    <ids:specification name="${name}" identifier="${specId}" ifcVersion="${ifcVersion}">`);
    lines.push(`      <ids:applicability maxOccurs="unbounded">`);
    
    // Create a single entity with enumeration for multiple IFC classes
    lines.push(`        <ids:entity>`);
    if (applicabilityClasses.length === 1) {
      // Single class: use simpleValue
      lines.push(`          <ids:name><ids:simpleValue>${esc(applicabilityClasses[0])}</ids:simpleValue></ids:name>`);
    } else {
      // Multiple classes: use enumeration
      lines.push(`          <ids:name>`);
      lines.push(`            <xs:restriction base="xs:string">`);
      applicabilityClasses.forEach((ifcClass) => {
        lines.push(`              <xs:enumeration value="${esc(ifcClass)}" />`);
      });
      lines.push(`            </xs:restriction>`);
      lines.push(`          </ids:name>`);
    }
    lines.push(`        </ids:entity>`);
    
    lines.push(`      </ids:applicability>`);
    lines.push(`      <ids:requirements>`);

    spec.requirements.forEach((req) => {
      if (req.type === "classification") {
        lines.push(`        <ids:classification>`);
        // Werte
        if (Array.isArray(req.valueNames) && req.valueNames.length > 0) {
          lines.push(`          <ids:value>`);
          lines.push(`            <xs:restriction base="xs:string">`);
          req.valueNames.forEach((val) => {
            lines.push(`              <xs:enumeration value="${esc(val)}" />`);
          });
          lines.push(`            </xs:restriction>`);
          lines.push(`          </ids:value>`);
        }
        // System (Fachmodellname)
        if (req.modelName) {
          lines.push(`          <ids:system>`);
          lines.push(`            <xs:restriction base="xs:string">`);
          lines.push(`              <xs:pattern value="${esc(req.modelName)}" />`);
          lines.push(`            </xs:restriction>`);
          lines.push(`          </ids:system>`);
        }
        lines.push(`        </ids:classification>`);
      } else if (req.type === "attribute") {
        lines.push(`        <ids:attribute>`);
        lines.push(`          <ids:name><ids:simpleValue>Name</ids:simpleValue></ids:name>`);
        if (Array.isArray(req.valueNames) && req.valueNames.length > 0) {
          lines.push(`          <ids:value>`);
          lines.push(`            <xs:restriction base="xs:string">`);
          req.valueNames.forEach((val) => {
            lines.push(`              <xs:enumeration value="${esc(val)}" />`);
          });
          lines.push(`            </xs:restriction>`);
          lines.push(`          </ids:value>`);
        } else if (typeof req.valueNames === "string" && req.valueNames) {
          lines.push(`          <ids:value>`);
          lines.push(`            <xs:restriction base="xs:string">`);
          lines.push(`              <xs:pattern value="${esc(req.valueNames)}" />`);
          lines.push(`            </xs:restriction>`);
          lines.push(`          </ids:value>`);
        }
        lines.push(`        </ids:attribute>`);
      } else if (req.type === "property") {
        // Intelligente Property-Behandlung: 
        // Wenn individuelle Werte pro Merkmal definiert sind, separate Properties erstellen
        const hasValueMap = req.valueMap && Object.keys(req.valueMap).some(key => req.valueMap![key] && req.valueMap![key].length > 0);
        
        if (hasValueMap && req.baseNames && Array.isArray(req.baseNames)) {
          // Aufspaltung: Separate Property für jedes Merkmal mit individuellen Werten
          const propertiesWithValues: string[] = [];
          const propertiesWithoutValues: string[] = [];
          
          req.baseNames.forEach((baseName: string) => {
            const hasValues = req.valueMap && req.valueMap[baseName] && req.valueMap[baseName].length > 0;
            if (hasValues) {
              propertiesWithValues.push(baseName);
            } else {
              propertiesWithoutValues.push(baseName);
            }
          });
          
          // Properties mit individuellen Werten - jeweils separate <ids:property>
          propertiesWithValues.forEach((baseName: string) => {
            const values = req.valueMap![baseName] || [];
            lines.push(xmlPropertyWithIndividualValues(req, baseName, values));
          });
          
          // Properties ohne Werte - als eine Enumeration wenn mehrere, sonst einzeln
          if (propertiesWithoutValues.length > 0) {
            if (propertiesWithoutValues.length === 1) {
              // Einzelnes Property ohne Werte
              const singleReq = { ...req, baseName: propertiesWithoutValues[0], baseNames: undefined, valueList: undefined };
              lines.push(xmlProperty(singleReq));
            } else {
              // Mehrere Properties ohne Werte als Enumeration
              const enumerationReq = { ...req, baseNames: propertiesWithoutValues, valueList: undefined };
              lines.push(xmlProperty(enumerationReq));
            }
          }
        } else {
          // Standard-Behandlung ohne individuelle Werte
          lines.push(xmlProperty(req));
        }
      }
    });

    lines.push(`      </ids:requirements>`);
    lines.push(`    </ids:specification>`);
  });

  lines.push(`  </ids:specifications>`);
  lines.push(`</ids:ids>`);

  return lines.join("\n");
}


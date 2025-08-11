// Browser-compatible IDS XSD validation
// This validator works entirely in the browser without Node.js dependencies

export const validateWithXSDLibrary = async (
  xmlString: string,
  xsdString: string
): Promise<{ valid: boolean; errors?: string[] }> => {
  try {
    // Use browser-native DOMParser for XML validation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    // Check for XML parsing errors
    const parseErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) {
      return {
        valid: false,
        errors: ['XML parsing error: ' + parseErrors[0].textContent]
      };
    }

    // Perform comprehensive manual validation against IDS schema
    return validateAgainstIDSSchema(xmlDoc, xsdString);
    
  } catch (error: any) {
    return {
      valid: false,
      errors: ['Validation error: ' + (error?.message || String(error))]
    };
  }
};

async function validateAgainstIDSSchema(
  xmlDoc: Document,
  xsdString: string
): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];
  
  // Parse XSD for reference (basic structure validation)
  const parser = new DOMParser();
  const xsdDoc = parser.parseFromString(xsdString, 'application/xml');
  
  // Check for XSD parsing errors
  const xsdParseErrors = xsdDoc.getElementsByTagName('parsererror');
  if (xsdParseErrors.length > 0) {
    return {
      valid: false,
      errors: ['XSD schema parsing error']
    };
  }

  // Validate root element (check for both "ids" and "ids:ids")
  const root = xmlDoc.documentElement;
  if (!root || (root.tagName !== 'ids' && root.tagName !== 'ids:ids')) {
    errors.push('Root element must be "ids" or "ids:ids"');
  }

  // Validate namespace
  const xmlns = root.getAttribute('xmlns:ids') || root.getAttribute('xmlns');
  if (!xmlns || !xmlns.includes('buildingsmart.org/IDS')) {
    errors.push('Missing or invalid IDS namespace');
  }

  // Validate required child elements (check for both namespaced and non-namespaced)
  const info = root.getElementsByTagName('info')[0] || root.getElementsByTagName('ids:info')[0];
  if (!info) {
    errors.push('Missing required "info" element');
  } else {
    errors.push(...validateInfoSection(info));
  }

  const specifications = root.getElementsByTagName('specifications')[0] || root.getElementsByTagName('ids:specifications')[0];
  if (!specifications) {
    errors.push('Missing required "specifications" element');
  } else {
    errors.push(...validateSpecificationsSection(specifications));
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

function validateInfoSection(infoElement: Element): string[] {
  const errors: string[] = [];
  
  // Check required elements in info section (support both namespaced and non-namespaced)
  const requiredInfoElements = ['title', 'copyright', 'version', 'description', 'author', 'date', 'purpose', 'milestone'];
  
  for (const required of requiredInfoElements) {
    const elements = infoElement.getElementsByTagName(required);
    const namespacedElements = infoElement.getElementsByTagName(`ids:${required}`);
    
    if (elements.length === 0 && namespacedElements.length === 0) {
      // Only require title, version, author, date - these are actually required by IDS spec
      if (['title', 'version', 'author', 'date'].includes(required)) {
        errors.push(`Missing required element "${required}" in info section`);
      }
    }
  }

  return errors;
}

function validateSpecificationsSection(specificationsElement: Element): string[] {
  const errors: string[] = [];
  
  const specifications = specificationsElement.getElementsByTagName('specification');
  const namespacedSpecifications = specificationsElement.getElementsByTagName('ids:specification');
  const allSpecs = [...Array.from(specifications), ...Array.from(namespacedSpecifications)];
  
  if (allSpecs.length === 0) {
    errors.push('At least one specification is required');
    return errors;
  }

  // Validate each specification
  for (let i = 0; i < allSpecs.length; i++) {
    const spec = allSpecs[i];
    const specName = spec.getAttribute('name') || `Specification ${i + 1}`;
    
    // Check required attributes
    if (!spec.getAttribute('name')) {
      errors.push(`Specification ${i + 1}: Missing required "name" attribute`);
    }
    
    if (!spec.getAttribute('ifcVersion')) {
      errors.push(`${specName}: Missing required "ifcVersion" attribute`);
    }

    // Validate applicability (support both namespaced and non-namespaced)
    const applicabilityElements = [
      ...Array.from(spec.getElementsByTagName('applicability')),
      ...Array.from(spec.getElementsByTagName('ids:applicability'))
    ];
    
    if (applicabilityElements.length === 0) {
      errors.push(`${specName}: Missing required "applicability" element`);
    } else {
      errors.push(...validateApplicability(applicabilityElements[0], specName));
    }

    // Validate requirements (support both namespaced and non-namespaced)
    const requirementsElements = [
      ...Array.from(spec.getElementsByTagName('requirements')),
      ...Array.from(spec.getElementsByTagName('ids:requirements'))
    ];
    
    if (requirementsElements.length === 0) {
      errors.push(`${specName}: Missing required "requirements" element`);
    } else {
      errors.push(...validateRequirements(requirementsElements[0], specName));
    }
  }

  return errors;
}

function validateApplicability(applicabilityElement: Element, specName: string): string[] {
  const errors: string[] = [];
  
  // Should have at least one child element (entity, classification, etc.)
  const children = Array.from(applicabilityElement.children);
  if (children.length === 0) {
    errors.push(`${specName}: Applicability must have at least one child element`);
  }

  // Validate each child element (support both namespaced and non-namespaced)
  for (const child of children) {
    const tagName = child.tagName.toLowerCase().replace('ids:', '');
    
    if (tagName === 'entity') {
      // Validate entity element
      const name = child.getElementsByTagName('name')[0] || child.getElementsByTagName('ids:name')[0];
      if (!name) {
        errors.push(`${specName}: Entity element missing required "name" child`);
      }
    } else if (tagName === 'classification') {
      // Validate classification element
      const system = child.getElementsByTagName('system')[0] || child.getElementsByTagName('ids:system')[0];
      if (!system) {
        errors.push(`${specName}: Classification element missing required "system" child`);
      }
    }
  }

  return errors;
}

function validateRequirements(requirementsElement: Element, specName: string): string[] {
  const errors: string[] = [];
  
  const children = Array.from(requirementsElement.children);
  if (children.length === 0) {
    errors.push(`${specName}: Requirements must have at least one child element`);
  }

  // Validate each requirement (support both namespaced and non-namespaced)
  for (const child of children) {
    const tagName = child.tagName.toLowerCase().replace('ids:', '');
    
    if (tagName === 'property') {
      // Validate property requirement
      const propertySet = child.getElementsByTagName('propertySet')[0] || child.getElementsByTagName('ids:propertySet')[0];
      const baseName = child.getElementsByTagName('baseName')[0] || child.getElementsByTagName('ids:baseName')[0];
      
      if (!propertySet) {
        errors.push(`${specName}: Property requirement missing required "propertySet" element`);
      }
      
      if (!baseName) {
        errors.push(`${specName}: Property requirement missing required "baseName" element`);
      }
    } else if (tagName === 'classification') {
      // Validate classification requirement
      const system = child.getElementsByTagName('system')[0] || child.getElementsByTagName('ids:system')[0];
      
      if (!system) {
        errors.push(`${specName}: Classification requirement missing required "system" element`);
      }
    } else if (tagName === 'attribute') {
      // Validate attribute requirement
      const name = child.getElementsByTagName('name')[0] || child.getElementsByTagName('ids:name')[0];
      
      if (!name) {
        errors.push(`${specName}: Attribute requirement missing required "name" element`);
      }
    }
  }

  return errors;
}

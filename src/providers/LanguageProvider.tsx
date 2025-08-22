import React, { ReactNode, useEffect } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { tolgee } from "./tolgee";

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  useEffect(() => {
    // Tolgee Error Handler hinzufügen um Warnings zu unterdrücken
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = (...args) => {
      // Tolgee-spezifische Warnings filtern
      if (args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('Tolgee: Failed to fetch record') || 
         arg.includes('RecordFetchError'))
      )) {
        return; // Warning unterdrücken
      }
      originalConsoleWarn(...args);
    };
    
    console.error = (...args) => {
      // Tolgee-spezifische Errors filtern
      if (args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('RecordFetchError') || 
         arg.includes('Tolgee: Failed to fetch record'))
      )) {
        return; // Error unterdrücken
      }
      originalConsoleError(...args);
    };
    
    return () => {
      // Cleanup: Original console functions wiederherstellen
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);
  
  return <TolgeeProvider tolgee={tolgee}>{children}</TolgeeProvider>;
};

export default LanguageProvider;

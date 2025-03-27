import React, { ReactNode } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { tolgee } from "./tolgee";

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  return <TolgeeProvider tolgee={tolgee}>{children}</TolgeeProvider>;
};

export default LanguageProvider;

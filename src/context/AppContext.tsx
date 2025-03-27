import React, { createContext, useState, useCallback, ReactNode } from 'react';

interface AppContextType {
  refreshCounter: number;
  refreshApp: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshApp = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        refreshCounter,
        refreshApp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

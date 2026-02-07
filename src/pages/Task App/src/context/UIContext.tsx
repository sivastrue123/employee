import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UIContextType {
  isAgentOpen: boolean;
  openAgent: () => void;
  closeAgent: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isAgentOpen, setAgentOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        isAgentOpen,
        openAgent: () => setAgentOpen(true),
        closeAgent: () => setAgentOpen(false),
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};


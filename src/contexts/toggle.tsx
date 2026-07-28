'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAllToggles } from '@/lib/api';

export type ToggleState = Record<string, boolean>;

interface ToggleContextValue {
  toggles: ToggleState;
  ready: boolean;
  refreshToggles: () => Promise<void>;
}

const ToggleContext = createContext<ToggleContextValue | undefined>(undefined);

export function ToggleProvider({ children }: { children: React.ReactNode }) {
  const [toggles, setToggles] = useState<ToggleState>({});
  const [ready, setReady] = useState(false);

  const refreshToggles = async () => {
    try {
      console.log('[ToggleProvider] Fetching toggles...');
      const response = await getAllToggles();
      console.log('[ToggleProvider] Response:', response);
      if (response && response.success) {
        const tData = response.data || {};
        const normalized: ToggleState = {};
        Object.keys(tData).forEach((key) => {
          normalized[key] = tData[key]?.enabled ?? false;
        });
        console.log('[ToggleProvider] Normalized toggles:', normalized);
        setToggles(normalized);
      }
    } catch (error) {
      console.error('[ToggleProvider] refresh toggles failed', error);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    refreshToggles();
  }, []);

  return (
    <ToggleContext.Provider value={{ toggles, ready, refreshToggles }}>
      {children}
    </ToggleContext.Provider>
  );
}

export function useToggles() {
  const context = useContext(ToggleContext);
  if (!context) {
    throw new Error('useToggles must be used within ToggleProvider');
  }
  return context;
}

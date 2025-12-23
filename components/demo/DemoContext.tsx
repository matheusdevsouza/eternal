'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  unlockedFeatures: Set<string>;
  unlockFeature: (feature: string) => void;
  previewCard: string | null;
  setPreviewCard: (cardId: string | null) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  unlockedFeatures: new Set(['photos']),
  unlockFeature: () => {},
  previewCard: null,
  setPreviewCard: () => {},
  isAnimating: false,
  setIsAnimating: () => {}
});

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [unlockedFeatures, setUnlockedFeatures] = useState<Set<string>>(new Set(['photos']));
  const [previewCard, setPreviewCard] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const unlockFeature = (feature: string) => {
    setUnlockedFeatures(prev => new Set(Array.from(prev).concat(feature)));
  };

  return (
    <DemoContext.Provider value={{ 
      unlockedFeatures, 
      unlockFeature,
      previewCard,
      setPreviewCard,
      isAnimating,
      setIsAnimating
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);






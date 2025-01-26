import React, { createContext, useState, ReactNode } from 'react';

// تعریف نوع داده برای context
interface BadgeContextType {
  badgeCount: number;
  incrementBadge: () => void;
  decrementBadge: () => void;
  badgeCount2: number;
  incrementBadge2: () => void;
  decrementBadge2: () => void;
}

// ایجاد context
export const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

// تعریف Provider
export const BadgeProvider: React.FC<{ children: any }> = ({ children }) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [badgeCount2, setBadgeCount2] = useState(0);

  const incrementBadge = () => setBadgeCount((prev) => prev + 1);
  const decrementBadge = () => setBadgeCount((prev) => (prev > 0 ? prev - 1 : 0));
  const incrementBadge2 = () => setBadgeCount2((prev) => prev + 1);
  const decrementBadge2 = () => setBadgeCount2((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <BadgeContext.Provider value={{ badgeCount, incrementBadge, decrementBadge,badgeCount2, incrementBadge2, decrementBadge2 }}>
      {children}
    </BadgeContext.Provider>
  );
};


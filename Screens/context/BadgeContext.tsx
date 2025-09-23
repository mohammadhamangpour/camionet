import React, { createContext, useContext, useEffect, useState } from "react";
import { BadgeManager } from "./BadgeManager";

const badgeManager = new BadgeManager();

const BadgeContext = createContext<BadgeManager | null>(null);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badgeCount, setBadgeCount] = useState(badgeManager.getCount());
  const [badgeNotifCount, setBadgeNotifCount] = useState(badgeManager.getNotifCount());


  useEffect(() => {
    const unsubscribe = badgeManager.subscribe(setBadgeCount);
    const unsubscribe2 = badgeManager.notifSubscribe(setBadgeNotifCount);


    return () => {
      unsubscribe()
      unsubscribe2();
    }
  }, []);

  return (
    <BadgeContext.Provider value={badgeManager}>
      {children}
    </BadgeContext.Provider>
  );
};

// Custom hook for using the badge context
export const useBadge = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("useBadge must be used within a BadgeProvider");
  }
  return context;
};
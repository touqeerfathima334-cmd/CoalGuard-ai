import React, { createContext, useCallback, useContext, useState } from "react";
import { api } from "../services/api.js";

const DataContext = createContext(null);

/**
 * Lightweight shared cache so pages stay in sync after mutations
 * (e.g. creating an inspection updates mines + alerts everywhere).
 */
export function DataProvider({ children }) {
  const [mines, setMines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshMines = useCallback(async () => {
    const data = await api.getMines();
    setMines(data);
    return data;
  }, []);

  const refreshAlerts = useCallback(async () => {
    const data = await api.getAlerts();
    setAlerts(data);
    return data;
  }, []);

  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <DataContext.Provider
      value={{ mines, alerts, refreshMines, refreshAlerts, refreshKey, bump }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

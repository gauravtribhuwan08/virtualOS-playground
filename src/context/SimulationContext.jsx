import React, { createContext, useState, useContext } from 'react';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x speed
  const [isAutoRun, setIsAutoRun] = useState(true);

  return (
    <SimulationContext.Provider value={{ simulationSpeed, setSimulationSpeed, isAutoRun, setIsAutoRun }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}

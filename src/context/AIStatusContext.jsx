import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { OllamaService } from '../services/ollama';

const AIStatusContext = createContext(null);

export const AIStatusProvider = ({ children }) => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);

  const refresh = useCallback(async () => {
    setStatus('checking');
    const result = await OllamaService.testConnection();
    if (result.success) {
      setStatus('connected');
      setModels(result.models || []);
      setError(null);
    } else {
      setStatus('offline');
      setModels([]);
      setError(result.error || 'Unable to reach the Ollama service.');
    }
    setLastChecked(Date.now());
    return result;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      error,
      models,
      lastChecked,
      refresh,
      endpoint: OllamaService.getEndpoint(),
      model: OllamaService.getModel(),
      isLocal: OllamaService.isLocalEndpoint(),
    }),
    [status, error, models, lastChecked, refresh]
  );

  return <AIStatusContext.Provider value={value}>{children}</AIStatusContext.Provider>;
};

export const useAIStatus = () => {
  const context = useContext(AIStatusContext);
  if (!context) {
    throw new Error('useAIStatus must be used within an AIStatusProvider');
  }
  return context;
};

import { useState, useEffect, useCallback } from 'react';
import importLogo from '../util/importLogo';

const useLogo = logoPath => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!logoPath) {
    return { logo, loading };
  }

  const fetchLogo = useCallback(async () => {
    setLoading(true);
    try {
      const importedLogo = await importLogo(logoPath);
      setLogo(importedLogo ? importedLogo.default : null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading logo:', error);
    } finally {
      setLoading(false);
    }
  }, [logoPath]);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  return { logo, loading };
};

export { useLogo };

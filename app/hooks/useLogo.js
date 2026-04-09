import { useState, useEffect, useCallback } from 'react';

const useLogo = logoPath => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!logoPath) {
    return { logo, loading };
  }

  const fetchLogo = useCallback(async () => {
    setLoading(true);
    try {
      const importedLogo = await import(
        /* webpackChunkName: "main" */ `../configurations/images/${logoPath}`
      );
      setLogo(importedLogo.default);
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

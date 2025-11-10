'use client';

import { useCallback } from 'react';
import { analytics } from './index';

export const useAnalytics = () => {
  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.capture(event, properties);
  }, []);

  const identify = useCallback((distinctId: string, properties?: Record<string, any>) => {
    analytics.identify(distinctId, properties);
  }, []);

  const reset = useCallback(() => {
    analytics.reset();
  }, []);

  return {
    capture,
    identify,
    reset,
    // Expose the full analytics instance for advanced usage
    analytics
  };
};
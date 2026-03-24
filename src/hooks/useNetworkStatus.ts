import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Data Revalidation step: When connection is restored, automatically trigger a re-fetch 
      // of critical data (like Student Lists and Test Results) by refreshing the route
      router.refresh(); 
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  return { isOnline };
}

import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also handle appinstalled event to hide the button if installed outside our UI
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPromptEvent(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    await installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPromptEvent(null);
    }
  };

  return { isInstallable, handleInstallClick };
}

import React, { useEffect, useRef, useState } from 'react';

import { useAnnouncer } from './AriaLiveAnnouncer.hooks';
interface AriaLiveAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearDelay?: number;
}

export const AriaLiveAnnouncer: React.FC<AriaLiveAnnouncerProps> = ({
  message,
  priority = 'polite',
  clearDelay = 1000,
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message && message !== currentMessage) {
      setCurrentMessage(message);

      // Clear the message after delay to allow it to be announced again
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('');
      }, clearDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, currentMessage, clearDelay]);

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  );
};

// Hook for easy announcement

export default AriaLiveAnnouncer;
import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Cards page redirect
 * Redirects to TCG expansions as cards functionality was consolidated there
 */
export default function CardsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to TCG expansions page
    router.replace('/tcgexpansions');
  }, [router]);
  
  return null;
}
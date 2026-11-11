import { useState, useEffect } from 'react';
import { menuService } from './menuService';
import type { MenuItem } from '../../types';

export function useMenu(restaurantId: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    menuService.getMenu(restaurantId)
      .then(data => { if (mounted) setMenuItems(data); })
      .catch(err => { if (mounted) setError(err instanceof Error ? err.message : 'Failed to load menu.'); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [restaurantId]);

  return { menuItems, isLoading, error };
}

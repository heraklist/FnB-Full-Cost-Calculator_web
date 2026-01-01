import { useMemo } from 'react';

const VIRTUAL_THRESHOLD = 50; // Use virtual scrolling when > 50 items

interface UseVirtualScrollingOptions {
  threshold?: number;
}

export function useVirtualScrolling(
  itemCount: number,
  options: UseVirtualScrollingOptions = {}
) {
  const { threshold = VIRTUAL_THRESHOLD } = options;
  
  const shouldVirtualize = useMemo(() => {
    return itemCount > threshold;
  }, [itemCount, threshold]);
  
  return {
    shouldVirtualize,
    threshold,
    itemCount,
  };
}

export default useVirtualScrolling;

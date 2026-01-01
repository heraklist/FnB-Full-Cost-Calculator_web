import { useRef, ReactNode, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columnCount: number;
  rowHeight: number;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  columnCount,
  rowHeight,
  gap = 16,
  className = '',
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows
  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += columnCount) {
      result.push(items.slice(i, i + columnCount));
    }
    return result;
  }, [items, columnCount]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan: 2,
  });

  const virtualRows = virtualizer.getVirtualItems();

  if (items.length === 0) {
    return (
      <div className={`virtual-grid-empty ${className}`}>
        <p>Δεν υπάρχουν δεδομένα</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`virtual-grid-container h-full overflow-auto ${className}`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size - gap}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: `${gap}px`,
            }}
          >
            {rows[virtualRow.index].map((item, colIndex) => (
              <div key={colIndex}>
                {renderItem(item, virtualRow.index * columnCount + colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualGrid;

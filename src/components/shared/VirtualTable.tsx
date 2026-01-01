import { useRef, ReactNode, CSSProperties } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  render: (item: T, index: number) => ReactNode;
  headerStyle?: CSSProperties;
  cellStyle?: CSSProperties;
}

interface VirtualTableProps<T> {
  items: T[];
  columns: Column<T>[];
  rowHeight?: number;
  headerHeight?: number;
  overscan?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight = 48,
  headerHeight = 48,
  overscan = 10,
  className = '',
  onRowClick,
  rowClassName,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div className={`virtual-table ${className}`}>
      {/* Header */}
      <div 
        className="virtual-table-header"
        style={{ height: headerHeight }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className={`virtual-table-header-cell ${col.width ? '' : 'flex-1'}`}
            style={{
              width: col.width,
              ...col.headerStyle,
            }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="virtual-table-body"
        style={{
          height: `calc(100% - ${headerHeight}px)`,
          overflow: 'auto',
        }}
      >
        {items.length === 0 ? (
          <div className="virtual-table-empty">
            Δεν υπάρχουν δεδομένα
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const item = items[virtualRow.index];
              const customClass = rowClassName?.(item, virtualRow.index) || '';
              
              return (
                <div
                  key={virtualRow.key}
                  className={`virtual-table-row ${customClass}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onClick={() => onRowClick?.(item, virtualRow.index)}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="virtual-table-cell"
                      style={{
                        width: col.width,
                        flex: col.width ? 'none' : 1,
                        ...col.cellStyle,
                      }}
                    >
                      {col.render(item, virtualRow.index)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualTable;

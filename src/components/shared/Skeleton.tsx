

import '../../styles/skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: string;
  className?: string;
}

export function Skeleton({ width, height, variant = '', className = '' }: SkeletonProps) {
  const style = { width, height };
  return <div className={`skeleton ${variant} ${className}`.trim()} style={style} />;
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card mb-4" />
      ))}
    </>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 mb-2">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className="skeleton skeleton-text flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
}

export function SkeletonText({ lines = 3 }: SkeletonTextProps) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text mb-2" style={{ width: `${90 - i * 7}%` }} />
      ))}
    </div>
  );
}

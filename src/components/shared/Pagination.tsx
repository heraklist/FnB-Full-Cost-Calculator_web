import { memo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  rangeDisplay: string;
  isFirstPage: boolean;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showPageSize?: boolean;
  showRange?: boolean;
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  rangeDisplay,
  isFirstPage,
  isLastPage,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  showRange = true,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at edges
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, maxVisible);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
      }
      
      // Add ellipsis before
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1 && !showRange) {
    return null;
  }

  return (
    <div className="pagination">
      {/* Range display */}
      {showRange && (
        <span className="pagination-range">{rangeDisplay}</span>
      )}
      
      {/* Page size selector */}
      {showPageSize && (
        <div className="pagination-size">
          <label htmlFor="pageSize">Ανά σελίδα:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-2 rounded border border-divider bg-surface text-primary-900 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Navigation buttons */}
      {totalPages > 1 && (
        <div className="pagination-nav">
          {/* First page */}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            title="Πρώτη σελίδα"
          >
            ⏮️
          </button>
          
          {/* Previous page */}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            title="Προηγούμενη"
          >
            ◀️
          </button>
          
          {/* Page numbers */}
          <div className="pagination-pages">
            {getPageNumbers().map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Next page */}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            title="Επόμενη"
          >
            ▶️
          </button>
          
          {/* Last page */}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            title="Τελευταία σελίδα"
          >
            ⏭️
          </button>
        </div>
      )}
    </div>
  );
});

export default Pagination;

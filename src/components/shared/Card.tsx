import React from 'react';

interface CardBadge {
  text: string;
  color?: string;
}

interface CardProps {
  title: string;
  subtitle?: string;
  badge?: CardBadge;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'danger' | 'ghost';
  }[];
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  badge,
  actions = [],
  children,
  onClick,
  className = '',
  highlight = false,
}: CardProps & { highlight?: boolean }) {
  return (
    <div
      className={`card ${highlight ? 'highlight-card' : ''} ${className}`.trim()}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h4 className="m-0 text-lg font-semibold text-primary-900">{title}</h4>
        {badge && (
          <span
            className="inline-block px-3 py-1 rounded-xl text-xs font-bold"
            style={{
              background: badge.color || 'var(--color-primary)',
              color: 'var(--color-on-primary, #fff)',
            }}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mb-3 text-sm text-muted-700">{subtitle}</p>
      )}

      {/* Card body */}
      {children && <div className="card-body">{children}</div>}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-t-divider">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={e => {
                e.stopPropagation();
                action.onClick();
              }}
              title={action.label}
              className={`btn-icon btn-${action.variant || 'default'} animate-tap`}
              tabIndex={0}
              type="button"
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

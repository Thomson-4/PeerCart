import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable empty / error state block.
 *
 * Props:
 *   icon        – lucide icon component (required)
 *   title       – bold heading (required)
 *   description – secondary text
 *   action      – { label, to } for a Link, or { label, onClick } for a button
 *   error       – string: shows red error variant instead
 *   onRetry     – shows a Retry button when provided (error state)
 *   className   – extra classes on the outer wrapper
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  error,
  onRetry,
  className = '',
}) {
  if (error) {
    return (
      <div className={`bento-panel flex flex-col items-center justify-center py-14 gap-4 text-center ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
        <div>
          <p className="font-bold text-text-primary">{error}</p>
          {description && (
            <p className="text-sm text-text-secondary mt-1.5 max-w-xs mx-auto">{description}</p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-color text-sm font-bold text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bento-panel flex flex-col items-center justify-center py-14 gap-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border-color flex items-center justify-center">
        <Icon size={30} className="text-text-secondary/40" />
      </div>
      <div>
        <p className="font-bold text-text-primary text-lg">{title}</p>
        {description && (
          <p className="text-sm text-text-secondary mt-1.5 max-w-xs mx-auto leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        action.to ? (
          <Link
            to={action.to}
            className="flex items-center gap-1.5 px-5 py-2.5 cta-gradient text-white text-sm font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-accent/20"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="flex items-center gap-1.5 px-5 py-2.5 cta-gradient text-white text-sm font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-accent/20"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

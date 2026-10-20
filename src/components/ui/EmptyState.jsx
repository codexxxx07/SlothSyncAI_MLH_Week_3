import { cx } from '../../utils/cx';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'neutral',
  compact = false,
  className,
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center px-6 text-center',
      compact ? 'py-9' : 'py-14',
      className
    )}
  >
    <div
      className={cx(
        'mb-4 grid h-14 w-14 place-items-center rounded-2xl border',
        tone === 'accent'
          ? 'border-accent-line bg-accent-soft text-accent-text'
          : 'border-line bg-surface-2 text-ink-3'
      )}
      aria-hidden="true"
    >
      <Icon size={24} strokeWidth={1.75} />
    </div>
    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
    {description ? (
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-2">{description}</p>
    ) : null}
    {action || secondaryAction ? (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {action}
        {secondaryAction}
      </div>
    ) : null}
  </div>
);

export default EmptyState;

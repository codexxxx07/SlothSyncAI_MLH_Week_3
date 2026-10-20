import { cx } from '../../utils/cx';

const Switch = ({ checked, onChange, label, description, id, disabled = false }) => (
  <div className="flex items-start justify-between gap-5">
    <div className="min-w-0">
      <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink">
        {label}
      </label>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>
      ) : null}
    </div>
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative mt-0.5 h-6 w-11 shrink-0 rounded-pill border transition-colors duration-150',
        checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-3',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <span
        className={cx(
          'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all duration-150',
          checked ? 'left-[23px]' : 'left-[3px]'
        )}
        aria-hidden="true"
      />
    </button>
  </div>
);

export default Switch;

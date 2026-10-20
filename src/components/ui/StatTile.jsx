import { cx } from '../../utils/cx';

const StatTile = ({ icon: Icon, label, value, hint, className }) => (
  <div className={cx('card px-5 py-4', className)}>
    <div className="flex items-center gap-2 text-ink-3">
      {Icon ? <Icon size={14} strokeWidth={2} aria-hidden="true" /> : null}
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase">{label}</span>
    </div>
    <p className="mt-2 text-[25px] leading-none font-bold tabular-nums text-ink">{value}</p>
    {hint ? <p className="mt-1.5 text-xs leading-snug text-ink-3">{hint}</p> : null}
  </div>
);

export default StatTile;

import { cx } from '../../utils/cx';

const Badge = ({ tone = 'neutral', icon: Icon, children, className, title }) => (
  <span className={cx('badge', `badge-${tone}`, className)} title={title}>
    {Icon ? <Icon size={12} aria-hidden="true" /> : null}
    {children}
  </span>
);

export default Badge;

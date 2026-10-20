import { cx } from '../../utils/cx';
import Spinner from './Spinner';

const ICON_SIZE = { sm: 15, md: 16, lg: 18 };

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconAfter: IconAfter,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) => {
  const iconSize = ICON_SIZE[size] || 16;
  return (
    <button
      type={type}
      className={cx('btn', `btn-${variant}`, `btn-${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} />
      ) : Icon ? (
        <Icon size={iconSize} aria-hidden="true" />
      ) : null}
      {children != null && children !== '' ? <span>{children}</span> : null}
      {IconAfter ? <IconAfter size={iconSize} aria-hidden="true" /> : null}
    </button>
  );
};

export const IconButton = ({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  loading = false,
  disabled,
  ...rest
}) => (
  <button
    type="button"
    className={cx(
      'btn',
      `btn-${variant}`,
      'icon-btn',
      size === 'sm' && 'icon-btn-sm',
      size === 'sm' && 'btn-sm',
      className
    )}
    aria-label={label}
    title={label}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {loading ? (
      <Spinner size={size === 'sm' ? 15 : 17} />
    ) : (
      <Icon size={size === 'sm' ? 16 : 18} aria-hidden="true" />
    )}
  </button>
);

export { Spinner };
export default Button;

import { cx } from '../../utils/cx';

export const Card = ({ className, children, ...rest }) => (
  <section className={cx('card', className)} {...rest}>
    {children}
  </section>
);

export const CardHeader = ({ icon: Icon, title, description, actions, className }) => (
  <div className={cx('flex flex-wrap items-start justify-between gap-3 px-6 pt-5 pb-4', className)}>
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-ctl-sm border border-accent-line bg-accent-soft text-accent-text"
            aria-hidden="true"
          >
            <Icon size={15} />
          </span>
        ) : null}
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      </div>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-2">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

export const CardBody = ({ className, children }) => (
  <div className={cx('px-6 pt-4', className)}>{children}</div>
);

export const CardFooter = ({ className, children }) => (
  <div
    className={cx(
      'mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4',
      className
    )}
  >
    {children}
  </div>
);

export default Card;

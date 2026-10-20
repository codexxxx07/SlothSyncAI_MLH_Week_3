import { cx } from '../../utils/cx';

const PageHeader = ({ title, description, actions }) => (
  <header className="animate-enter mb-7 flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0">
      <h1 className="text-[26px] leading-tight font-bold tracking-[-0.015em] text-ink">
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-2">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);

export const SectionHeading = ({ children, className }) => (
  <h2 className={cx('text-[15px] font-semibold text-ink', className)}>{children}</h2>
);

export default PageHeader;

import { cx } from '../../utils/cx';

export const SlothMark = ({ size = 30, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label="SlothSync AI"
  >
    <rect width="64" height="64" rx="15" fill="#2f855a" />
    <circle cx="15.5" cy="21" r="7.5" fill="#f4f0e7" />
    <circle cx="48.5" cy="21" r="7.5" fill="#f4f0e7" />
    <ellipse cx="32" cy="35" rx="20.5" ry="18.5" fill="#f4f0e7" />
    <ellipse cx="24" cy="33" rx="7" ry="8.5" fill="#ded7c7" transform="rotate(-14 24 33)" />
    <ellipse cx="40" cy="33" rx="7" ry="8.5" fill="#ded7c7" transform="rotate(14 40 33)" />
    <circle cx="24.5" cy="34" r="2.7" fill="#25231e" />
    <circle cx="39.5" cy="34" r="2.7" fill="#25231e" />
    <ellipse cx="32" cy="43" rx="3.6" ry="2.7" fill="#25231e" />
    <path
      d="M27.6 47.2c1.6 2 7.2 2 8.8 0"
      fill="none"
      stroke="#25231e"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const Logo = ({ size = 30, showText = true, className }) => (
  <span className={cx('flex items-center gap-3', className)}>
    <SlothMark size={size} className="shrink-0" />
    {showText ? (
      <span className="sidebar-hide min-w-0">
        <span className="block text-[15px] leading-tight font-bold text-ink">
          SlothSync <span className="text-accent-text">AI</span>
        </span>
        <span className="mt-0.5 block text-[11px] leading-tight text-ink-3">
          You relax. We handle the mess.
        </span>
      </span>
    ) : null}
  </span>
);

export default Logo;

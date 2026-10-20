import { File } from 'lucide-react';
import { cx } from '../../utils/cx';
import { categoryIcon, fileExtensionLabel } from '../../utils/categoryMeta';

const SIZES = {
  sm: 'h-7 w-7 rounded-ctl-sm',
  md: 'h-9 w-9 rounded-ctl',
  lg: 'h-11 w-11 rounded-ctl',
};

const ICON_SIZES = { sm: 14, md: 16, lg: 19 };

const FileIcon = ({ category, extension, size = 'md', className }) => {
  const Icon = category ? categoryIcon(category) : File;
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center border border-line bg-surface-2 text-ink-2',
        SIZES[size],
        className
      )}
      title={extension ? fileExtensionLabel(extension) : undefined}
      aria-hidden="true"
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={1.9} />
    </span>
  );
};

export default FileIcon;

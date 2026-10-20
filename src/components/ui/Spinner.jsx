import { Loader2 } from 'lucide-react';
import { cx } from '../../utils/cx';

const Spinner = ({ size = 16, className }) => (
  <Loader2 size={size} className={cx('shrink-0 animate-spin', className)} aria-hidden="true" />
);

export default Spinner;

import { cx } from '../../utils/cx';

const Truncated = ({ text, title, className, as: Tag = 'span' }) => (
  <Tag className={cx('block truncate', className)} title={title ?? text}>
    {text}
  </Tag>
);

export default Truncated;

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cx } from '../../utils/cx';

const Stepper = ({ steps, className, label = 'Organize workflow' }) => (
  <nav aria-label={label} className={cx('steps mb-6', className)}>
    {steps.map((step, index) => {
      const stateClass = step.status === 'current' ? 'is-current' : step.status === 'done' ? 'is-done' : '';
      const content = (
        <>
          <span className="step-dot" aria-hidden="true">
            {step.status === 'done' ? <Check size={13} strokeWidth={3} /> : index + 1}
          </span>
          <span>{step.label}</span>
        </>
      );

      return (
        <Fragment key={step.key}>
          {index > 0 ? <span className="step-connector" aria-hidden="true" /> : null}
          {step.to ? (
            <Link
              to={step.to}
              className={cx('step', stateClass)}
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              {content}
            </Link>
          ) : (
            <span
              className={cx('step', stateClass)}
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              {content}
            </span>
          )}
        </Fragment>
      );
    })}
  </nav>
);

export default Stepper;

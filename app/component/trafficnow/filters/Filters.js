import React from 'react';
import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ValidityPeriodFilter from './ValidityPeriodFilter';
import { useFilterContext } from './FiltersContext';
import { useBreakpoint } from '../../../util/withBreakpoint';

const Filters = ({ onApplyClick, onResetClick }) => {
  const { selectedFilters, resetFilters, DEFAULT_FILTERS } = useFilterContext();
  const breakpoint = useBreakpoint();

  const mobile = breakpoint !== 'large';

  const filterComponents = [
    {
      id: 'validityPeriod',
      Component: ValidityPeriodFilter,
    },
  ];

  const handleResetClick = () => {
    resetFilters();
    if (onResetClick) {
      onResetClick();
    }
  };

  return (
    <form
      className={cx('traffic-now__content__filters', {
        'traffic-now__content__filters-mobile': mobile,
      })}
    >
      {filterComponents.map(({ id, Component }) => (
        <Component key={id} filterId={id} />
      ))}
      {onApplyClick && (
        <Button
          type="button"
          size="medium"
          fullWidth
          variant="blue"
          value="Näytä tulokset"
          onClick={onApplyClick}
        />
      )}
      <Button
        type="button"
        size={mobile ? 'medium' : 'small'}
        disabled={
          JSON.stringify(selectedFilters) === JSON.stringify(DEFAULT_FILTERS)
        }
        fullWidth={mobile}
        variant="white"
        value="Tyhjennä valinnat"
        onClick={handleResetClick}
      />
    </form>
  );
};

Filters.propTypes = {
  onApplyClick: PropTypes.func,
  onResetClick: PropTypes.func,
};
Filters.defaultProps = {
  onApplyClick: undefined,
  onResetClick: undefined,
};

export default Filters;

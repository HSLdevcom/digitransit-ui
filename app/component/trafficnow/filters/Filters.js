import React from 'react';
import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ValidityPeriodFilter from './ValidityPeriodFilter';
import { useFilterContext } from './FiltersContext';
import { useBreakpoint } from '../../../util/withBreakpoint';
import VehicleModesFilter from './VehicleModesFilter';
import EntitySearch from './EntitySearch';
import ToggleableFilters from './ToggleableFilters';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

const Separator = () => <div className="separator horizontal" />;

const Filters = ({ onApplyClick, onResetClick }) => {
  const { selectedFilters, resetFilters, DEFAULT_FILTERS } = useFilterContext();
  const breakpoint = useBreakpoint();
  const intl = useTranslationsContext();

  const mobile = breakpoint !== 'large';

  const components = [
    {
      id: 'entity',
      Component: EntitySearch,
    },
    {
      id: 'vehicleModes',
      Component: VehicleModesFilter,
    },
    {
      id: 'separator-1',
      Component: Separator,
    },
    {
      id: 'validityPeriod',
      Component: ValidityPeriodFilter,
    },
    {
      id: 'separator-2',
      Component: Separator,
    },
    {
      id: 'toggles',
      Component: ToggleableFilters,
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
      {components.map(({ id, Component }) => (
        <Component key={id} filterId={id} />
      ))}
      {onApplyClick && (
        <Button
          type="button"
          size="medium"
          fullWidth
          variant="blue"
          value={intl.formatMessage({ id: 'traffic-now_filters_view-results' })}
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
        value={intl.formatMessage({ id: 'clear-button-label' })}
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

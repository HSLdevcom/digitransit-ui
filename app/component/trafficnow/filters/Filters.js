import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@hsl-fi/layout-primitives';
import PropTypes from 'prop-types';
import ValidityPeriodFilter from './ValidityPeriodFilter';
import { useFilterContext } from './FiltersContext';
import { useBreakpoint } from '../../../util/withBreakpoint';
import VehicleModesFilter from './VehicleModesFilter';
import EntitySearch from './EntitySearch';
import ToggleableFilters from './ToggleableFilters';
import OperatorSelect from './OperatorSelect';

const Separator = () => <div className="separator horizontal" />;

const Filters = ({ onApplyClick = undefined, onResetClick = () => {} }) => {
  const { selectedFilters, resetFilters, DEFAULT_FILTERS } = useFilterContext();
  const breakpoint = useBreakpoint();
  const intl = useIntl();

  const mobile = breakpoint !== 'large';

  const components = [
    {
      id: 'feed',
      Component: OperatorSelect,
    },
    {
      id: 'entity',
      Component: EntitySearch,
    },
    {
      id: 'vehicleModes',
      Component: VehicleModesFilter,
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

  const buttons = (
    <>
      {onApplyClick && (
        <Button size="m" variant="primary" onClick={onApplyClick}>
          {intl.formatMessage({
            id: 'traffic-now_filters_view-results',
          })}
        </Button>
      )}
      <Button
        size="m"
        variant="secondary"
        onClick={handleResetClick}
        disabled={
          JSON.stringify(selectedFilters) === JSON.stringify(DEFAULT_FILTERS)
        }
      >
        {intl.formatMessage({ id: 'clear-button-label' })}
      </Button>
    </>
  );

  return mobile ? (
    <div>
      <form className="traffic-now__filters traffic-now__filters-mobile">
        {components.map(({ id, Component }) => (
          <Component key={id} filterId={id} />
        ))}
      </form>
      <div className="traffic-now__filters-form-buttons">{buttons}</div>
    </div>
  ) : (
    <form className="traffic-now__filters">
      {components.map(({ id, Component }) => (
        <Component key={id} filterId={id} />
      ))}
      {buttons}
    </form>
  );
};

Filters.propTypes = {
  onApplyClick: PropTypes.func,
  onResetClick: PropTypes.func,
};

export default Filters;

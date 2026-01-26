import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';
import { useFilterContext } from './FiltersContext';
import { useFavourites } from '../../../hooks/FavouriteContext';

const TOGGLEABLE_FILTERS = [
  {
    id: 'favourites',
    label: 'Vain suosikit',
    fn: favourites => new Set(favourites.map(f => f.gtfsId)),
  },
  { id: 'cancellations', label: 'Vain peruutukset', fn: () => true },
];

const ToggleableFilters = () => {
  const { selectedFilters, setFilter, removeFilter } = useFilterContext();
  const favourites = useFavourites();

  const handleToggle = ({ id, fn }) => {
    if (selectedFilters[id]) {
      removeFilter(id);
    } else {
      setFilter(id, fn(favourites));
    }
  };

  return (
    <fieldset>
      {TOGGLEABLE_FILTERS.map(f => (
        <div
          key={f.id}
          className={cx(
            'traffic-now_filters-toggle--container',
            `traffic-now_filters-toggle--${f.id}`,
          )}
        >
          <label htmlFor={f.id}>
            <Toggle
              id={f.id}
              toggled={!!selectedFilters[f.id]}
              onToggle={() => handleToggle(f)}
            />
            <FormattedMessage id={f.id} defaultMessage={f.label} />
          </label>
        </div>
      ))}
    </fieldset>
  );
};

export default ToggleableFilters;

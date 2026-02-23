import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';
import { useFilterContext } from './FiltersContext';
import { useFavourites } from '../../../hooks/FavouriteContext';

const TOGGLEABLE_FILTERS = [
  {
    id: 'cancellations',
    label: 'traffic-now_filters_toggles--cancellations-only',
    fn: () => true,
  },
  {
    id: 'favourites',
    label: 'traffic-now_filters_toggles--favourites-only',
    fn: favourites => new Set(favourites.map(f => f.gtfsId)),
  },
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
    <fieldset className="traffic-now__content__filters__toggle--container">
      {TOGGLEABLE_FILTERS.map(f => (
        <div
          key={f.id}
          className={`traffic-now__content__filters__toggle--${f.id}`}
        >
          <label htmlFor={f.id}>
            <Toggle
              id={f.id}
              toggled={!!selectedFilters[f.id]}
              onToggle={() => handleToggle(f)}
            />
            <FormattedMessage id={f.label}>
              {msg => <span className="input-label bold">{msg}</span>}
            </FormattedMessage>
          </label>
        </div>
      ))}
    </fieldset>
  );
};

export default ToggleableFilters;

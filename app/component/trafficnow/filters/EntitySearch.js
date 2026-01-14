import React from 'react';
import { FormattedMessage } from 'react-intl';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import PropTypes from 'prop-types';
import { withSearchContext } from '../../WithSearchContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useFilterContext } from './FiltersContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

const searchSources = ['Favourite', 'History', 'Datasource'];

const EntitySearch = ({ filterId }) => {
  const {
    getAutoSuggestIcons,
    colors: { iconColors },
    iconModeSet,
  } = useConfigContext();
  const { selectedFilters, setFilter, removeFilter } = useFilterContext();
  const intl = useTranslationsContext();

  const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

  const selectHandler = ({ address, gtfsId }) => {
    setFilter(filterId, {
      gtfsId,
      address,
    });
  };

  return (
    <fieldset>
      <FormattedMessage
        tagName="legend"
        id="traffic-now_filters_entity-search"
        defaultMessage="Search for individual route or stop"
      />
      <DTAutoSuggestWithSearchContext
        appElement="#app"
        icon="search"
        id="traffic-now_filters_entity-search--input"
        className="traffic-now_filters_entity-search--input"
        placeholder={intl.formatMessage({
          id: 'traffic-now_filters_entity-search--placeholder',
          defaultMessage: 'Route, stop or station',
        })}
        geocodingSize={40}
        sources={searchSources}
        value={selectedFilters[filterId]?.address}
        targets={['Stops', 'Stations', 'Routes']}
        selectHandler={selectHandler} // prop for context handler
        getAutoSuggestIcons={getAutoSuggestIcons}
        modeIconColors={iconColors}
        modeSet={iconModeSet}
        onClear={() => removeFilter(filterId)}
      />
    </fieldset>
  );
};

EntitySearch.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default EntitySearch;

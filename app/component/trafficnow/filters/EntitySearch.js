import React from 'react';
import { FormattedMessage } from 'react-intl';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import PropTypes from 'prop-types';
import { withSearchContext } from '../../WithSearchContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useFilterContext } from './FiltersContext';

const searchSources = ['Favourite', 'History', 'Datasource'];

const EntitySearch = ({ filterId }) => {
  const {
    getAutoSuggestIcons,
    colors: { iconColors },
    iconModeSet,
  } = useConfigContext();
  const { selectedFilters, setFilter } = useFilterContext();

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
        defaultMessage="Hae yksittäistä linjaa tai pysäkkiä"
      />
      <DTAutoSuggestWithSearchContext
        appElement="#app"
        icon="search"
        id="traffic-now_filters_entity-search--input"
        className="traffic-now_filters_entity-search--input"
        placeholder="Linja, pysäkki tai asema"
        geocodingSize={40}
        sources={searchSources}
        value={selectedFilters[filterId]?.address}
        targets={['Stops', 'Stations', 'Routes']}
        selectHandler={selectHandler} // prop for context handler
        getAutoSuggestIcons={getAutoSuggestIcons}
        modeIconColors={iconColors}
        modeSet={iconModeSet}
      />
    </fieldset>
  );
};

EntitySearch.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default EntitySearch;

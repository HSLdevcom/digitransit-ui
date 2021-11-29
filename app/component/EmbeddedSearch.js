import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react';
import { matchShape } from 'found';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import { intlShape } from 'react-intl';
import { getRefPoint } from '../util/apiUtils';
import withSearchContext from './WithSearchContext';
import Icon from './Icon';
import {
  getPathWithEndpointObjects,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';

const LocationSearch = withSearchContext(DTAutosuggestPanel);

const EmbeddedSearch = (props, context) => {
  // eslint-disable-next-line no-unused-vars
  const { query } = props.match.location;
  const { config, intl } = context;
  const { colors, fontWeights } = config;

  const [origin, setOrigin] = useState({});
  const [destination, setDestination] = useState({});

  const color = colors.primary;
  const hoverColor = colors.hover;
  const appElement = 'embedded-root';
  const lang = 'fi';

  const locationSearchTargets = [
    'Locations',
    'CurrentPosition',
    'FutureRoutes',
    'Stops',
  ];
  const sources = ['Datasource'];
  const refPoint = getRefPoint(origin, destination, {});

  const onSelectLocation = (item, id) => {
    if (id === 'origin') {
      setOrigin(item);
    } else {
      setDestination(item);
    }
  };

  const locationSearchProps = {
    appElement: '#app',
    origin,
    destination,
    lang,
    sources,
    color,
    hoverColor,
    refPoint,
    searchPanelText: intl.formatMessage({
      id: 'find-route',
      defaultMessage: 'Find a route',
    }),
    originPlaceHolder: 'search-origin-index',
    destinationPlaceHolder: 'search-destination-index',
    selectHandler: onSelectLocation,
    onGeolocationStart: onSelectLocation,
    // fromMap: this.props.fromMap,
    fontWeights,
    modeIconColors: config.colors.iconColors,
    modeSet: config.searchIconModeSet,
  };

  const executeSearch = () => {
    const pathName = getPathWithEndpointObjects(
      origin,
      destination,
      PREFIX_ITINERARY_SUMMARY,
    );
    if (window.self !== window.top) {
      window.parent.location.href = pathName;
    } else {
      window.location.href = pathName;
    }
  };

  return (
    <div className="embedded-seach-container" id={appElement}>
      <CtrlPanel
        instance="HSL"
        language={lang}
        origin={origin}
        position="left"
        fontWeights={fontWeights}
      >
        <span className="sr-only">
          {intl.formatMessage({
            id: 'search-fields.sr-instructions',
            defaultMessage:
              'The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search',
          })}
        </span>
        <LocationSearch
          targets={locationSearchTargets}
          {...locationSearchProps}
        />
        <div className="embedded-search-button-container">
          <Icon img={config.logo} color={config.colors.primary} />
          <button
            className="search-button"
            type="button"
            onClick={() => executeSearch(origin, destination)}
          >
            {intl.formatMessage({
              id: 'search-route',
              defaultMessage: 'Search a route',
            })}
          </button>
        </div>
      </CtrlPanel>
    </div>
  );
};

EmbeddedSearch.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

EmbeddedSearch.propTypes = {
  match: matchShape.isRequired,
};

export default EmbeddedSearch;

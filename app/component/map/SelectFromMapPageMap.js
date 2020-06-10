import React from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import MapWithTracking from './MapWithTracking';
import withBreakpoint from '../../util/withBreakpoint';

import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import { dtLocationShape } from '../../util/shapes';
import PreferencesStore from '../../store/PreferencesStore';

function SelectFromMapPageMap({
  match,
  router,
  breakpoint,
  origin,
  destination,
  language,
}) {
  let map;
  if (breakpoint === 'large') {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops
        showScaleBar
        origin={origin}
        destination={destination}
      />
    );
  } else {
    const originFromMap =
      match && match.location
        ? match.location.pathname.indexOf('SelectFromMap') === 1
        : false;
    const destinationFromMap =
      match && match.location
        ? match.location.pathname.indexOf('SelectFromMap') > 1
        : false;

    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops={!(originFromMap || destinationFromMap)}
        showScaleBar={!!(originFromMap || destinationFromMap)}
        origin={origin}
        destination={destination}
        originFromMap={originFromMap}
        destinationFromMap={destinationFromMap}
        match={match}
        router={router}
        language={language}
      />
    );
  }

  return map;
}

SelectFromMapPageMap.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  language: PropTypes.string.isRequired,
};

SelectFromMapPageMap.defaultProps = {
  origin: {},
  destination: {},
};

const SelectFromMapPageMapWithBreakpoint = withBreakpoint(SelectFromMapPageMap);

const SelectFromMapPageMapWithStores = connectToStores(
  SelectFromMapPageMapWithBreakpoint,
  [OriginStore, DestinationStore, PreferencesStore],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const language = getStore(PreferencesStore).getLanguage();
    return {
      origin,
      destination,
      language,
    };
  },
);

export {
  SelectFromMapPageMapWithStores as default,
  SelectFromMapPageMapWithBreakpoint as Component,
};

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

function StopsNearYouMap({
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
        setInitialZoom={17}
        origin={origin}
        destination={destination}
        setInitialMapTracking
        disableLocationPopup
      />
    );
  } else {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops={false}
        showScaleBar
        origin={origin}
        setInitialZoom={17}
        destination={destination}
        originFromMap={origin}
        destinationFromMap={destination}
        match={match}
        router={router}
        language={language}
        setInitialMapTracking
      />
    );
  }

  return map;
}

StopsNearYouMap.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  language: PropTypes.string.isRequired,
};

StopsNearYouMap.defaultProps = {
  origin: {},
  destination: {},
};

const StopsNearYouMapWithBreakpoint = withBreakpoint(StopsNearYouMap);

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouMapWithBreakpoint,
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
  StopsNearYouMapWithStores as default,
  StopsNearYouMapWithBreakpoint as Component,
};

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
import BackButton from '../BackButton';

function StopsNearYouMap({ breakpoint, origin, destination }, { config }) {
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
      <>
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          color={config.colors.primary}
        />
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
      </>
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

StopsNearYouMap.contextTypes = {
  config: PropTypes.object,
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

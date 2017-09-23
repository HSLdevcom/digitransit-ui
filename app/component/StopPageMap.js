import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import some from 'lodash/some';

import Map from './map/Map';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import Icon from './Icon';

const getFullscreenTogglePath = (fullscreenMap, params) =>
  `/${params.stopId ? 'pysakit' : 'terminaalit'}/${params.stopId
    ? params.stopId
    : params.terminalId}${fullscreenMap ? '' : '/kartta'}`;

const toggleFullscreenMap = (fullscreenMap, params, router) => {
  if (fullscreenMap) {
    router.goBack();
    return;
  }
  router.push(getFullscreenTogglePath(fullscreenMap, params));
};

const fullscreenMapOverlay = (fullscreenMap, params, router) =>
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => {
        toggleFullscreenMap(fullscreenMap, params, router);
      }}
    />
  );

const fullscreenMapToggle = (fullscreenMap, params, router) => (
  <div
    className="fullscreen-toggle"
    key="fullscreen-toggle"
    onClick={() => {
      toggleFullscreenMap(fullscreenMap, params, router);
    }}
  >
    <Icon img="icon-icon_maximize" className="cursor-pointer" />
  </div>
);

const StopPageMap = ({ stop, routes, params }, { breakpoint, router }) => {
  if (!stop) {
    return false;
  }

  const fullscreenMap = some(routes, 'fullscreenMap');
  const leafletObjs = [];
  const children = [];

  if (breakpoint === 'large') {
    leafletObjs.push(
      <SelectedStopPopup lat={stop.lat} lon={stop.lon} key="SelectedStopPopup">
        <SelectedStopPopupContent stop={stop} />
      </SelectedStopPopup>,
    );
  } else {
    children.push(fullscreenMapOverlay(fullscreenMap, params, router));
    children.push(fullscreenMapToggle(fullscreenMap, params, router));
  }

  const showScale = fullscreenMap || breakpoint === 'large';

  return (
    <Map
      className="full"
      lat={stop.lat}
      lon={stop.lon}
      zoom={!params.stopId || stop.platformCode ? 18 : 16}
      showStops
      hilightedStops={[params.stopId]}
      leafletObjs={leafletObjs}
      showScaleBar={showScale}
    >
      {children}
    </Map>
  );
};

StopPageMap.contextTypes = {
  breakpoint: PropTypes.string.isRequired,
  router: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
};

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }).isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.string,
    }).isRequired,
  ).isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
  ]).isRequired,
};

export default Relay.createContainer(StopPageMap, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        lat
        lon
        platformCode
        name
        code
        desc
      }
    `,
  },
});

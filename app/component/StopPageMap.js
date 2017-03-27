import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';

import Map from './map/Map';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import Icon from './Icon';

const getFullscreenTogglePath = (fullscreenMap, params) =>
  `/${
    params.stopId ? 'pysakit' : 'terminaalit'
  }/${
    params.stopId ? params.stopId : params.terminalId
  }${fullscreenMap ? '' : '/kartta'}`;

const toggleFullscreenMap = (fullscreenMap, params, router) => {
  if (fullscreenMap) {
    router.goBack();
    return;
  }
  router.push(getFullscreenTogglePath(fullscreenMap, params));
};

const fullscreenMapOverlay = (fullscreenMap, params, router) => (
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => { toggleFullscreenMap(fullscreenMap, params, router); }}
    />
  )
);

const fullscreenMapToggle = (fullscreenMap, params, router) => (
  <div className="fullscreen-toggle" onClick={() => { toggleFullscreenMap(fullscreenMap, params, router); }}>
    <Icon img="icon-icon_maximize" className="cursor-pointer" />
  </div>
);

const StopPageMap = ({ stop, routes, params }, { breakpoint, router }) => {
  if (!stop) return false;

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
      zoom={!(params.stopId) || stop.platformCode ? 18 : 16}
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
  breakpoint: React.PropTypes.string.isRequired,
  router: React.PropTypes.shape({
    replace: React.PropTypes.func.isRequired,
    push: React.PropTypes.func.isRequired,
  }).isRequired,
};

StopPageMap.propTypes = {
  stop: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    platformCode: React.PropTypes.string,
  }).isRequired,
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    fullscreenMap: React.PropTypes.string,
  }).isRequired).isRequired,
  params: React.PropTypes.oneOfType([
    React.PropTypes.shape({ stopId: React.PropTypes.string.isRequired }).isRequired,
    React.PropTypes.shape({ terminalId: React.PropTypes.string.isRequired }).isRequired,
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

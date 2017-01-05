import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
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


const fullscreenMapOverlay = (fullscreenMap, params, router) => (
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => router.replace(getFullscreenTogglePath(fullscreenMap, params))}
    />
  )
);

const fullscreenMapToggle = (fullscreenMap, params) => (
  <Link to={getFullscreenTogglePath(fullscreenMap, params)} key="toggle">
    <div className="fullscreen-toggle">
      <Icon img="icon-icon_maximize" className="cursor-pointer" />
    </div>
  </Link>
);

const StopPageMap = ({ stop, routes, params }, { breakpoint, router }) => {
  const fullscreenMap = some(routes, 'fullscreenMap');
  const leafletObjs = [];
  const children = [];

  if (breakpoint === 'large') {
    leafletObjs.push(
      <SelectedStopPopup lat={stop.lat} lon={stop.lon}>
        <SelectedStopPopupContent stop={stop} />
      </SelectedStopPopup>,
    );
  } else {
    children.push(fullscreenMapOverlay(fullscreenMap, params, router));
    children.push(fullscreenMapToggle(fullscreenMap, params));
  }

  const showScale = fullscreenMap || breakpoint === 'large';

  return (
    <Map
      className="full"
      lat={stop.lat}
      lon={stop.lon}
      zoom={!(params.stopId) || stop.platformCode ? 18 : 16}
      key={`map-${showScale}`} // forces update when prop fullScreenMap changes
      showStops
      hilightedStops={[params.stopId]}
      disableZoom={!fullscreenMap}
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
  }).isRequired,
};

StopPageMap.propTypes = {
  stop: React.PropTypes.object.isRequired,
  routes: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
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

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Relay from 'react-relay/classic';
import some from 'lodash/some';
import { routerShape } from 'react-router';
import MapContainer from './map/MapContainer';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';

const getFullscreenTogglePath = (fullscreenMap, params) =>
  `/${params.stopId ? PREFIX_STOPS : PREFIX_TERMINALS}/${
    params.stopId ? params.stopId : params.terminalId
  }${fullscreenMap ? '' : '/kartta'}`;

const toggleFullscreenMap = (fullscreenMap, params, router) => {
  addAnalyticsEvent({
    action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
    category: 'Map',
    name: 'StopPage',
  });
  if (fullscreenMap) {
    router.goBack();
    return;
  }
  router.push(getFullscreenTogglePath(fullscreenMap, params));
};

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
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
    className={cx('fullscreen-toggle', 'stopPage', {
      expanded: fullscreenMap,
    })}
    key="fullscreen-toggle"
    onClick={() => {
      toggleFullscreenMap(fullscreenMap, params, router);
    }}
  >
    {fullscreenMap ? (
      <Icon img="icon-icon_minimize" className="cursor-pointer" />
    ) : (
      <Icon img="icon-icon_maximize" className="cursor-pointer" />
    )}
  </div>
);
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

const StopPageMap = (
  { stop, routes, params, breakpoint },
  { router, config },
) => {
  if (!stop) {
    return false;
  }

  const fullscreenMap = some(routes, 'fullscreenMap');
  const leafletObjs = [];
  const children = [];
  if (config.showVehiclesOnStopPage) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon ignoreMode />,
    );
  }

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
    <MapContainer
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
    </MapContainer>
  );
};

StopPageMap.contextTypes = {
  router: routerShape.isRequired,
  config: PropTypes.object.isRequired,
};

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.string,
    }).isRequired,
  ).isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
  ]).isRequired,
  breakpoint: PropTypes.string.isRequired,
};

StopPageMap.defaultProps = {
  stop: undefined,
};

const containerComponent = Relay.createContainer(withBreakpoint(StopPageMap), {
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

export { containerComponent as default, StopPageMap as Component };

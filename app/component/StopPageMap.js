import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { createFragmentContainer, graphql } from 'react-relay';
import some from 'lodash/some';
import { matchShape, routerShape } from 'found';
import MapContainer from './map/MapContainer';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const getFullscreenTogglePath = (fullscreenMap, params) =>
  `/${params.stopId ? 'pysakit' : 'terminaalit'}/${
    params.stopId ? params.stopId : params.terminalId
  }${fullscreenMap ? '' : '/kartta'}`;

const toggleFullscreenMap = (fullscreenMap, params, router) => {
  addAnalyticsEvent({
    action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
    category: 'Map',
    name: 'StopPage',
  });
  if (fullscreenMap) {
    router.go(-1);
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

const StopPageMap = ({ stop, match, breakpoint }, { router, config }) => {
  if (!stop) {
    return false;
  }

  const fullscreenMap = some(match.routes, 'fullscreenMap');
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
    children.push(fullscreenMapOverlay(fullscreenMap, match.params, router));
    children.push(fullscreenMapToggle(fullscreenMap, match.params, router));
  }

  const showScale = fullscreenMap || breakpoint === 'large';

  return (
    <MapContainer
      className="full"
      lat={stop.lat}
      lon={stop.lon}
      zoom={!match.params.stopId || stop.platformCode ? 18 : 16}
      showStops
      hilightedStops={[match.params.stopId]}
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
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

StopPageMap.defaultProps = {
  stop: undefined,
};

const containerComponent = createFragmentContainer(
  withBreakpoint(StopPageMap),
  {
    stop: graphql`
      fragment StopPageMap_stop on Stop {
        lat
        lon
        platformCode
        name
        code
        desc
      }
    `,
  },
);

export { containerComponent as default, StopPageMap as Component };

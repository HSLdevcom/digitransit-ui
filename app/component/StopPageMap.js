import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import MapContainer from './map/MapContainer';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import BackButton from './BackButton';

const toggleFullscreenMap = (fullscreenMap, location, router) => {
  addAnalyticsEvent({
    action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
    category: 'Map',
    name: 'StopPage',
  });
  if (fullscreenMap) {
    router.go(-1);
    return;
  }
  router.push({
    ...location,
    state: { ...location.state, fullscreenMap: true },
  });
};

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const fullscreenMapOverlay = (fullscreenMap, location, router) =>
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => {
        toggleFullscreenMap(fullscreenMap, location, router);
      }}
    />
  );

const fullscreenMapToggle = (fullscreenMap, location, router) => (
  <div
    className={cx('fullscreen-toggle', 'stopPage', {
      expanded: fullscreenMap,
    })}
    key="fullscreen-toggle"
    onClick={() => {
      toggleFullscreenMap(fullscreenMap, location, router);
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

const StopPageMap = ({ stop, breakpoint }, { config, match, router }) => {
  if (!stop) {
    return false;
  }
  const fullscreenMap =
    match.location.state && match.location.state.fullscreenMap === true;
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
    children.push(fullscreenMapOverlay(fullscreenMap, match.location, router));
    children.push(fullscreenMapToggle(fullscreenMap, match.location, router));
    children.push(
      <BackButton
        icon="icon-icon_arrow-collapse--left"
        color={config.colors.primary}
        iconClassName="arrow-icon"
        key="stop-page-back-button"
      />,
    );
  }

  const showScale = fullscreenMap || breakpoint === 'large';

  const id = match.params.stopId || match.params.terminalId;

  return (
    <MapContainer
      className="full"
      lat={stop.lat}
      lon={stop.lon}
      zoom={!match.params.stopId || stop.platformCode ? 18 : 16}
      showStops
      hilightedStops={[id]}
      leafletObjs={leafletObjs}
      showScaleBar={showScale}
    >
      {children}
    </MapContainer>
  );
};

StopPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
};

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
  breakpoint: PropTypes.string.isRequired,
};

StopPageMap.defaultProps = {
  stop: undefined,
};

const componentWithBreakpoint = withBreakpoint(StopPageMap);

export { componentWithBreakpoint as default, StopPageMap as Component };

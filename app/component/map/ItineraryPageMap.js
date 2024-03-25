/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { configShape, planEdgeShape, locationShape } from '../../util/shapes';
import LocationMarker from './LocationMarker';
import ItineraryLine from './ItineraryLine';
import MapWithTracking from './MapWithTracking';
import { onLocationPopup } from '../../util/queryUtils';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import CookieSettingsButton from '../CookieSettingsButton';

const POINT_FOCUS_ZOOM = 16; // default

function ItineraryPageMap(
  {
    planEdges,
    active,
    showActive,
    from,
    to,
    viaPoints,
    breakpoint,
    showVehicles,
    topics,
    showDurationBubble,
    ...rest
  },
  { match, router, executeAction, config },
) {
  const { hash } = match.params;
  const leafletObjs = [];

  if (showVehicles) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon topics={topics} />,
    );
  }
  if (!showActive) {
    planEdges.forEach((edge, i) => {
      if (i !== active) {
        leafletObjs.push(
          <ItineraryLine
            key={`line_${i}`}
            hash={i}
            legs={edge.node.legs}
            passive
          />,
        );
      }
    });
  }
  if (active < planEdges.length) {
    leafletObjs.push(
      <ItineraryLine
        key={`line_${active}`}
        hash={active}
        streetMode={hash}
        legs={planEdges[active].node.legs}
        showTransferLabels={showActive}
        showIntermediateStops
        showDurationBubble={showDurationBubble}
      />,
    );
  }

  if (from.lat && from.lon) {
    leafletObjs.push(
      <LocationMarker key="fromMarker" position={from} type="from" />,
    );
  }
  if (to.lat && to.lon) {
    leafletObjs.push(<LocationMarker key="toMarker" position={to} type="to" />);
  }
  viaPoints.forEach((via, i) => {
    leafletObjs.push(<LocationMarker key={`via_${i}`} position={via} />);
  });

  // max 5 viapoints
  const locationPopup =
    config.viaPointsEnabled && viaPoints.length < 5
      ? 'all'
      : 'origindestination';
  const onSelectLocation = (item, id) =>
    onLocationPopup(item, id, router, match, executeAction);

  return (
    <MapWithTracking
      leafletObjs={leafletObjs}
      locationPopup={locationPopup}
      onSelectLocation={onSelectLocation}
      zoom={POINT_FOCUS_ZOOM}
      {...rest}
    >
      {breakpoint !== 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          fallback="pop"
        />
      )}

      {breakpoint === 'large' && config.useCookiesPrompt && (
        <CookieSettingsButton />
      )}
    </MapWithTracking>
  );
}

ItineraryPageMap.propTypes = {
  planEdges: PropTypes.arrayOf(planEdgeShape).isRequired,
  topics: PropTypes.arrayOf(
    PropTypes.shape({
      feedId: PropTypes.string.isRequired,
      mode: PropTypes.string,
      direction: PropTypes.number,
    }),
  ),
  active: PropTypes.number.isRequired,
  showActive: PropTypes.bool,
  breakpoint: PropTypes.string.isRequired,
  showVehicles: PropTypes.bool,
  from: locationShape.isRequired,
  to: locationShape.isRequired,
  viaPoints: PropTypes.arrayOf(locationShape).isRequired,
  showDurationBubble: PropTypes.bool,
};

ItineraryPageMap.defaultProps = {
  topics: undefined,
  showActive: false,
  showVehicles: false,
  showDurationBubble: false,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: configShape,
  executeAction: PropTypes.func.isRequired,
};

export default ItineraryPageMap;

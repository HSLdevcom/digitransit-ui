/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import LocationMarker from './LocationMarker';
import ItineraryLine from './ItineraryLine';
import MapWithTracking from './MapWithTracking';
import { onLocationPopup } from '../../util/queryUtils';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer'; // DT-3473

function ItineraryPageMap(
  {
    itineraries,
    activeIndex,
    showActive,
    from,
    to,
    viaPoints,
    breakpoint,
    showVehicles,
    topics,
    onlyHasWalkingItineraries,
    loading,
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
    itineraries.forEach((itinerary, i) => {
      if (i !== activeIndex) {
        leafletObjs.push(
          <ItineraryLine
            key={`line_${i}`}
            hash={i}
            legs={itinerary.legs}
            passive
          />,
        );
      }
    });
  }
  if (activeIndex < itineraries.length) {
    leafletObjs.push(
      <ItineraryLine
        key={`line_${activeIndex}`}
        hash={activeIndex}
        streetMode={hash}
        legs={itineraries[activeIndex].legs}
        showTransferLabels={showActive}
        showIntermediateStops
        onlyHasWalkingItineraries={onlyHasWalkingItineraries}
        loading={loading}
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
      {...rest}
    >
      {breakpoint !== 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          fallback="pop"
        />
      )}
    </MapWithTracking>
  );
}

ItineraryPageMap.propTypes = {
  itineraries: PropTypes.array.isRequired,
  activeIndex: PropTypes.number.isRequired,
  topics: PropTypes.array,
  showActive: PropTypes.bool,
  breakpoint: PropTypes.string.isRequired,
  showVehicles: PropTypes.bool,
  from: PropTypes.object.isRequired,
  to: PropTypes.object.isRequired,
  viaPoints: PropTypes.array.isRequired,
  onlyHasWalkingItineraries: PropTypes.bool,
  loading: PropTypes.bool,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
  executeAction: PropTypes.func.isRequired,
};

export default ItineraryPageMap;

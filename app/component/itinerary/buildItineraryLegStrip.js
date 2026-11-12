import { createElement } from 'react';
import Icon from '../Icon';
import StreetBar from './StreetBar';
import TransitBar from './TransitBar';
import {
  getTripOrRouteText,
  hasOneTransitLeg,
  isWalkOrBicycleWalkLeg,
  legTime,
  LegMode,
} from '../../../utils/client/legUtils';
import { modeToTranslationId } from '../../../utils/client/modeUtils';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
} from '../../../utils/shared/vehicleRentalUtils';
import { ViaLocationType } from '../../../utils/shared/constants';
import ItineraryStreetLeg from './ItineraryStreetLeg';
import { getItineraryStreetLegData } from './itineraryStreetLegUtils';
import { getItineraryTransitPresentation } from './itineraryTransitUtils';

const stationId = place =>
  place.stop?.parentStation?.gtfsId || place.stop?.gtfsId;

const ViaPoint = () =>
  createElement(
    'div',
    { className: 'leg via' },
    createElement(Icon, {
      img: 'icon_mapMarker',
      className: 'itinerary-icon place',
    }),
  );

export default function buildItineraryLegStrip({
  normalizedLegs,
  itinerary,
  config,
  formatMessage,
  usingOwnBicycle,
  usingOwnBicycleWholeTrip,
  usingOwnCarWholeTrip,
  shortenLabels,
  fitAllRouteNumbers,
  legWithRouteCount,
  bikeParkedIndex,
  renderModeIcons,
}) {
  const legs = [];
  let onlyIconLegCount = 0;
  const vehicleNames = [];
  const stopNames = [];
  let bikeNetwork;
  const citybikeNetworks = new Set();
  let citybikeicon;

  // Keep markers from duplicating when a following leg starts at another
  // platform in the same station after a transfer walk.
  let markedStationId;
  const addViaIcon = (place, key) => {
    markedStationId = stationId(place);
    onlyIconLegCount += 1;
    legs.push(createElement(ViaPoint, { key }));
  };

  normalizedLegs.forEach(processedLeg => {
    if (processedLeg.skipped) {
      return;
    }

    const {
      leg,
      index,
      legLength,
      renderBar,
      waiting,
      waitTime,
      waitLength,
      interliningWithRoute,
      nextLeg,
    } = processedLeg;
    const startMs = legTime(leg.start);
    const routeName =
      leg.route && getTripOrRouteText(leg.trip, leg.route, config);
    const longName = !routeName || routeName.length > 5;
    const viaKey = `via_${leg.mode}_${startMs}`;
    const startsAtMarkedStation =
      !!markedStationId && stationId(leg.from) === markedStationId;

    if (!isWalkOrBicycleWalkLeg(leg)) {
      markedStationId = undefined;
    }

    let viaPointAdded = false;
    if (
      leg.from.viaLocationType === ViaLocationType.Visit &&
      !startsAtMarkedStation
    ) {
      viaPointAdded = true;
      addViaIcon(leg.from, viaKey);
    }

    const transitPresentation = getItineraryTransitPresentation({
      leg,
      legLength,
      longName,
      fitAllRouteNumbers,
      legWithRouteCount,
      startsAtMarkedStation,
      viaPointAdded,
      nextLeg,
      usingOwnBicycleWholeTrip,
      usingOwnCarWholeTrip,
      config,
      waiting,
      waitTime,
      waitLength,
    });
    const streetLeg = getItineraryStreetLegData({
      leg,
      index,
      startMs,
      legLength,
      renderBar,
      renderModeIcons,
      usingOwnBicycle,
      bikeParkedIndex,
      config,
    });

    if (streetLeg) {
      legs.push(
        createElement(ItineraryStreetLeg, {
          key: streetLeg.key,
          leg: streetLeg.leg,
          duration: streetLeg.duration,
          mode: streetLeg.mode,
          legLength: streetLeg.legLength,
          renderModeIcons: streetLeg.renderModeIcons,
          icon: streetLeg.icon,
          parkingIndicator: streetLeg.parkingIndicator,
        }),
      );
      if (streetLeg.parkingIndicator) {
        onlyIconLegCount += 1;
      }
      if (streetLeg.vehicleNameId) {
        vehicleNames.push(formatMessage({ id: streetLeg.vehicleNameId }));
        stopNames.push(streetLeg.stopName);
      }
      if (streetLeg.rentalBike) {
        bikeNetwork = streetLeg.rentalBike.networkId;
        if (streetLeg.rentalBike.durationOverSurchargeLimit) {
          citybikeNetworks.add(bikeNetwork);
        }
        if (streetLeg.rentalBike.rentalWarningEnabled && !citybikeicon) {
          citybikeicon = getRentalNetworkIcon(
            getRentalNetworkConfig(bikeNetwork, config),
          );
        }
      }
    }

    if (leg.route) {
      if (transitPresentation.showFromViaPoint) {
        addViaIcon(leg.from, viaKey);
      }
      if (transitPresentation.showTransitBar) {
        legs.push(
          createElement(TransitBar, {
            key: `${leg.mode}_${startMs}`,
            leg,
            fitRouteNumber: transitPresentation.fitRouteNumber,
            interliningWithRoute,
            legLength,
            withBicycle: transitPresentation.withBicycle,
            withCar: transitPresentation.withCar,
            hasOneTransitLeg: hasOneTransitLeg(itinerary),
            shortenLabels,
          }),
        );
      }
      vehicleNames.push(
        `${formatMessage({ id: modeToTranslationId(leg.mode, config) })} ${
          routeName || ''
        }`,
      );
      stopNames.push(leg.from.name);
      if (transitPresentation.showToViaPoint) {
        addViaIcon(leg.to, viaKey);
      }
    }

    if (transitPresentation.showWaitBar) {
      legs.push(
        createElement(StreetBar, {
          key: `${leg.mode}_${startMs}_wait`,
          leg,
          legLength: transitPresentation.waitLength,
          renderModeIcons,
          duration: transitPresentation.waitDuration,
          mode: LegMode.Wait,
          icon: transitPresentation.waitIcon,
        }),
      );
    }
  });

  const normalLegCount = legs.length - onlyIconLegCount;
  const iconLegsInPixels =
    normalLegCount > 0 ? (24 * onlyIconLegCount) / normalLegCount : 0;

  return {
    legs,
    iconLegsInPixels,
    vehicleNames,
    stopNames,
    bikeNetwork,
    showRentalBikeDurationWarning: citybikeNetworks.size > 0,
    citybikeNetworkCount: citybikeNetworks.size,
    citybikeicon,
  };
}

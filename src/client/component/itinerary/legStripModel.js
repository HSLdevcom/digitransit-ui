import {
  compressLegs,
  getLegMode,
  getTripOrRouteText,
  hasOneTransitLeg,
  isCarLeg,
  isLegWithRoute,
  isWalkOrBicycleWalkLeg,
  legTime,
  LegMode,
  splitLegsAtViaPoints,
} from '../../utils/legUtils';
import { modeToTranslationId } from '../../utils/modeUtils';
import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
} from '../../../shared/utils/vehicleRentalUtils';
import { ViaLocationType } from '../../../shared/utils/constants';
import { getStreetBarProps, getTransitLegLayout, computeBarLayout } from './legStripUtils';

const NAME_LENGTH_THRESHOLD = 65;
const WAIT_THRESHOLD = 180000;

const getBikeParkedIndex = legs => {
  const index = legs.findIndex(leg => leg.to?.vehicleParking);
  return index === -1 ? legs.length : index;
};

const stationId = place => place.stop?.parentStation?.gtfsId || place.stop?.gtfsId;

/**
 * Merges and splits the legs and derives the whole-trip facts and layout limits
 * that steer how the leg strip is drawn.
 */
export function analyzeLegs({ legs, intermediatePlaces, config, breakpoint, duration }) {
  const usingOwnBicycle = legs.some(
    leg => getLegMode(leg) === 'BICYCLE' && leg.rentedBike === false,
  );
  const usingOwnBicycleWholeTrip = usingOwnBicycle && legs.every(leg => !leg.to.vehicleParking);
  const usingOwnCar = legs.some(isCarLeg);
  const usingOwnCarWholeTrip = usingOwnCar && legs.every(leg => !leg.to.vehicleParking);
  const compressedLegs = compressLegs(splitLegsAtViaPoints(legs, intermediatePlaces)).map(leg => ({
    ...leg,
  }));

  let intermediateSlack = 0;
  let legWithRouteCount = 0;
  let containsScooterLeg = false;
  let nameLengthSum = 0;

  compressedLegs.forEach((leg, index) => {
    if (isLegWithRoute(leg, config.taxiZone.allowedRouteTypes)) {
      legWithRouteCount += 1;
      nameLengthSum += getTripOrRouteText(leg.trip, leg.route, config).length;
    }

    nameLengthSum += 10;
    if (index > 0 && (leg.from.viaLocationType || leg.to.viaLocationType)) {
      intermediateSlack += legTime(leg.start) - legTime(compressedLegs[index - 1].end);
    }
    containsScooterLeg = leg.mode === 'SCOOTER' || containsScooterLeg;
  });

  const durationWithoutSlack = duration - intermediateSlack;
  const relativeLength = durationMs =>
    durationWithoutSlack > 0 ? (100 * durationMs) / durationWithoutSlack : 0;
  const lastLeg = compressedLegs[compressedLegs.length - 1];
  const lastLegLength = lastLeg ? relativeLength(lastLeg.duration * 1000) : 0;
  const normalizedLegs = computeBarLayout(compressedLegs, {
    relativeLength,
    renderBarThreshold: breakpoint === 'small' ? 8.5 : 6,
    lastLegLength,
    waitThreshold: WAIT_THRESHOLD,
  });

  return {
    compressedLegs,
    normalizedLegs,
    usingOwnBicycle,
    usingOwnBicycleWholeTrip,
    usingOwnCarWholeTrip,
    containsScooterLeg,
    shortenLabels: nameLengthSum > NAME_LENGTH_THRESHOLD,
    fitAllRouteNumbers: legWithRouteCount < 4,
    legWithRouteCount,
    bikeParkedIndex: usingOwnBicycle ? getBikeParkedIndex(compressedLegs) : undefined,
    renderModeIcons: compressedLegs.length < 10,
  };
}

/**
 * Turns an itinerary into a plain description of its leg strip. Contains no React.
 *
 * items: ordered strip parts, each { type: 'via' | 'street' | 'transit' | 'wait', key, ... }
 * vehicles: untranslated { messageId, routeName } per boarded vehicle, parallel to stopNames
 * rental: { network, networkCount, icon } for the rental bike duration warning
 */
export function getLegStripModel({ itinerary, intermediatePlaces, config, breakpoint, duration }) {
  const analysis = analyzeLegs({
    legs: itinerary.legs,
    intermediatePlaces,
    config,
    breakpoint,
    duration,
  });
  const {
    compressedLegs,
    normalizedLegs,
    usingOwnBicycle,
    usingOwnBicycleWholeTrip,
    usingOwnCarWholeTrip,
    containsScooterLeg,
    shortenLabels,
    fitAllRouteNumbers,
    legWithRouteCount,
    bikeParkedIndex,
    renderModeIcons,
  } = analysis;

  const items = [];
  let onlyIconLegCount = 0;
  const vehicles = [];
  const stopNames = [];
  let bikeNetwork;
  const citybikeNetworks = new Set();
  let citybikeicon;

  // Keep markers from duplicating when a following leg starts at another
  // platform in the same station after a transfer walk.
  let markedStationId;
  const addViaItem = (place, key) => {
    markedStationId = stationId(place);
    onlyIconLegCount += 1;
    items.push({ type: 'via', key });
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
    const routeName = leg.route && getTripOrRouteText(leg.trip, leg.route, config);
    const longName = !routeName || routeName.length > 5;
    const viaKey = `via_${leg.mode}_${startMs}`;
    const startsAtMarkedStation = !!markedStationId && stationId(leg.from) === markedStationId;

    if (!isWalkOrBicycleWalkLeg(leg)) {
      markedStationId = undefined;
    }

    let viaPointAdded = false;
    if (leg.from.viaLocationType === ViaLocationType.Visit && !startsAtMarkedStation) {
      viaPointAdded = true;
      addViaItem(leg.from, viaKey);
    }

    const transitLayout = getTransitLegLayout({
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
    const streetBar = getStreetBarProps({
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

    if (streetBar) {
      items.push({
        type: 'street',
        key: streetBar.key,
        leg: streetBar.leg,
        duration: streetBar.duration,
        mode: streetBar.mode,
        legLength: streetBar.legLength,
        renderModeIcons: streetBar.renderModeIcons,
        icon: streetBar.icon,
        parkingIndicator: streetBar.parkingIndicator,
      });
      if (streetBar.parkingIndicator) {
        onlyIconLegCount += 1;
      }
      if (streetBar.vehicleNameId) {
        vehicles.push({ messageId: streetBar.vehicleNameId });
        stopNames.push(streetBar.stopName);
      }
      if (streetBar.rentalBike) {
        bikeNetwork = streetBar.rentalBike.networkId;
        if (streetBar.rentalBike.durationOverSurchargeLimit) {
          citybikeNetworks.add(bikeNetwork);
        }
        if (streetBar.rentalBike.rentalWarningEnabled && !citybikeicon) {
          citybikeicon = getRentalNetworkIcon(getRentalNetworkConfig(bikeNetwork, config));
        }
      }
    }

    if (leg.route) {
      if (transitLayout.showFromViaPoint) {
        addViaItem(leg.from, viaKey);
      }
      if (transitLayout.showTransitBar) {
        items.push({
          type: 'transit',
          key: `${leg.mode}_${startMs}`,
          leg,
          fitRouteNumber: transitLayout.fitRouteNumber,
          interliningWithRoute,
          legLength,
          withBicycle: transitLayout.withBicycle,
          withCar: transitLayout.withCar,
          hasOneTransitLeg: hasOneTransitLeg(itinerary),
          shortenLabels,
        });
      }
      vehicles.push({
        messageId: modeToTranslationId(leg.mode, config),
        routeName: routeName || '',
      });
      stopNames.push(leg.from.name);
      if (transitLayout.showToViaPoint) {
        addViaItem(leg.to, viaKey);
      }
    }

    if (transitLayout.showWaitBar) {
      items.push({
        type: 'wait',
        key: `${leg.mode}_${startMs}_wait`,
        leg,
        legLength: transitLayout.waitLength,
        renderModeIcons,
        duration: transitLayout.waitDuration,
        mode: LegMode.Wait,
        icon: transitLayout.waitIcon,
      });
    }
  });

  const normalLegCount = items.length - onlyIconLegCount;

  return {
    items,
    iconLegsInPixels: normalLegCount > 0 ? (24 * onlyIconLegCount) / normalLegCount : 0,
    compressedLegs,
    containsScooterLeg,
    vehicles,
    stopNames,
    rental: { network: bikeNetwork, networkCount: citybikeNetworks.size, icon: citybikeicon },
  };
}

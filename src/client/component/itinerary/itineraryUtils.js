import {
  compressLegs,
  getLegMode,
  getTripOrRouteText,
  isCarLeg,
  isLegWithRoute,
  legTime,
  legTimeStr,
  splitLegsAtViaPoints,
} from '../../utils/legUtils';
import {
  getBoardingInformationText,
  getFirstDepartureMessageId,
  getFirstDepartureStopTypeText,
} from '../../utils/localeUtils';
import { dateOrEmpty, durationToString } from '../../utils/timeUtils';
import { normalizeLegLengths } from './itineraryLegProcessor';

const NAME_LENGTH_THRESHOLD = 65;
const WAIT_THRESHOLD = 180000;

// Makes a fragment read as a complete sentence so segments joined together stay grammatical.
function ensureSentence(text) {
  if (!text) {
    return '';
  }
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`; // Add a period if the text doesn't already end with punctuation.
}

function getTripDescriptionText(
  intl,
  {
    hasCallAgencyLeg,
    startTime,
    endTime,
    refTime,
    departureTime,
    arrivalTime,
    vehicleNames,
    firstDeparture,
    stopNames,
    duration,
  },
) {
  if (hasCallAgencyLeg) {
    return intl.formatMessage({ id: 'itinerary-summary-row.call-agency-description' });
  }

  const firstDepartureTime = firstDeparture ? legTimeStr(firstDeparture.start) : '';
  const firstDeparturePlatform = getBoardingInformationText(intl, firstDeparture);

  const firstDepartureText = ensureSentence(
    vehicleNames.length && firstDeparture
      ? intl.formatMessage(
          { id: getFirstDepartureMessageId(firstDeparture, true) },
          {
            vehicle: vehicleNames[0],
            firstDepartureTime,
            firstDepartureStop: stopNames[0],
            firstDepartureStopType: getFirstDepartureStopTypeText(intl, firstDeparture.mode),
            firstDeparturePlatform,
          },
        )
      : '',
  );

  const transfers = vehicleNames
    .map((name, index) => {
      if (index === 0) {
        return null;
      }
      return ensureSentence(
        intl.formatMessage(
          {
            id: stopNames[index]
              ? 'itinerary-summary-row.transfers'
              : 'itinerary-summary-row.transfers-to-rental',
          },
          { vehicle: name, stopName: stopNames[index] },
        ),
      );
    })
    .filter(Boolean)
    .join(' '); // Ensure that transfers are separated by a space, not a newline.

  return intl
    .formatMessage(
      { id: 'itinerary-summary-row.description' },
      {
        departureDate: dateOrEmpty(startTime, refTime),
        departureTime,
        arrivalDate: dateOrEmpty(endTime, refTime),
        arrivalTime,
        firstDeparture: firstDepartureText,
        transfers,
        totalTime: durationToString(intl, duration),
      },
    )
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
}

/**
 * Builds the localized accessible text for an itinerary row (for screen readers): the row label,
 * the trip description and, if given, the CO2 emissions.
 *
 * @param {Object} intl - react-intl intl object
 * @param {Object} params
 * @param {number} params.rowNumber - 1-based number of the itinerary row
 * @param {number|null} params.co2value - Emissions in grams, or null when they are not shown
 * @param {boolean} params.hasCallAgencyLeg - Whether the itinerary contains a call-agency leg
 * @param {number} params.startTime - Itinerary start time in ms since epoch
 * @param {number} params.endTime - Itinerary end time in ms since epoch
 * @param {number} params.refTime - Reference time in ms since epoch
 * @param {string} params.departureTime - Formatted departure time string
 * @param {string} params.arrivalTime - Formatted arrival time string
 * @param {string[]} params.vehicleNames - Formatted vehicle name strings for each transit leg
 * @param {Object} params.firstDeparture - First departure leg object
 * @param {string[]} params.stopNames - Stop names for each transit leg
 * @param {number} params.duration - Total itinerary duration in milliseconds
 * @returns {string}
 */
export function getItineraryScreenReaderText(intl, { rowNumber, co2value = null, ...tripParams }) {
  return [
    intl.formatMessage({ id: 'summary-page.row-label' }, { number: rowNumber }),
    getTripDescriptionText(intl, tripParams),
    co2value === null
      ? ''
      : intl.formatMessage({ id: 'itinerary-co2.description-simple' }, { co2value }),
  ]
    .filter(Boolean)
    .join(' ');
}

const getBikeParkedIndex = legs => {
  const index = legs.findIndex(leg => leg.to?.vehicleParking);
  return index === -1 ? legs.length : index;
};

export function getItineraryLegSummary({ legs, intermediatePlaces, config, breakpoint, duration }) {
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
  const normalizedLegs = normalizeLegLengths(compressedLegs, {
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

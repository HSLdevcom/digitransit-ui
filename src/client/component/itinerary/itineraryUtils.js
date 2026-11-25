import { legTimeStr } from '../../utils/legUtils';
import {
  getBoardingInformationText,
  getFirstDepartureMessageId,
  getFirstDepartureStopTypeText,
} from '../../utils/localeUtils';
import { dateOrEmpty, durationToString } from '../../utils/timeUtils';

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
    return intl.formatMessage({ id: 'itinerary-row.call-agency-description' });
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
            id: stopNames[index] ? 'itinerary-row.transfers' : 'itinerary-row.transfers-to-rental',
          },
          { vehicle: name, stopName: stopNames[index] },
        ),
      );
    })
    .filter(Boolean)
    .join(' '); // Ensure that transfers are separated by a space, not a newline.

  return intl
    .formatMessage(
      { id: 'itinerary-row.description' },
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

const actionHintIds = {
  open: 'itinerary-row.hint-open',
  select: 'itinerary-row.hint-select',
  selected: 'itinerary-row.hint-selected',
};

/**
 * Builds the localized accessible description of an itinerary row (for screen readers): the trip
 * description, the CO2 emissions if given and a hint about what activating the row does. The row
 * number is not included, it is the accessible name of the row.
 *
 * @param {Object} intl - react-intl intl object
 * @param {Object} params
 * @param {'open'|'select'|'selected'} params.actionHint - What activating the row does
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
export function getItineraryScreenReaderText(intl, { actionHint, co2value = null, ...tripParams }) {
  return [
    ensureSentence(getTripDescriptionText(intl, tripParams)),
    co2value === null
      ? ''
      : ensureSentence(
          intl.formatMessage({ id: 'itinerary-co2.description-simple' }, { co2value }),
        ),
    intl.formatMessage({ id: actionHintIds[actionHint] }),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Formats the untranslated vehicle descriptions produced by getLegStripModel. */
export const formatVehicleNames = (formatMessage, vehicles) =>
  vehicles.map(({ messageId, routeName }) => {
    const name = formatMessage({ id: messageId });
    return routeName === undefined ? name : `${name} ${routeName}`;
  });

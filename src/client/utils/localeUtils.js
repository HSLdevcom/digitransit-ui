import { TransportMode } from '../../shared/utils/constants';
import { isBikeOrScooterRentalLeg, isPlatformChanged, isScooterLeg, isTaxiLeg } from './legUtils';

const TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS = {
  [TransportMode.Rail]: { id: 'track', defaultMessage: 'Track' },
  [TransportMode.Ferry]: { id: 'pier-short-no-num', defaultMessage: 'Pier' },
  default: { id: 'platform-short-no-num', defaultMessage: 'Plat.' },
};

export function getTrackOrPierOrPlatformTextShort(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS = {
  [TransportMode.Rail]: { id: 'track', defaultMessage: 'Track' },
  [TransportMode.Ferry]: { id: 'pier', defaultMessage: 'Pier' },
  default: { id: 'platform', defaultMessage: 'Platform' },
};

export function getTrackOrPierOrPlatformText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS[mode] ?? TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS = {
  [TransportMode.Rail]: { id: 'track-num' },
  [TransportMode.Ferry]: { id: 'pier-num' },
  default: { id: 'platform-num' },
};

export function getTrackOrPierOrPlatformWithNumText(intl, mode, platformCode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS.default,
    { platformCode },
  );
}

const TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS = {
  [TransportMode.Rail]: { id: 'navigation-track-change', defaultMessage: 'Track change' },
  [TransportMode.Ferry]: { id: 'navigation-pier-change', defaultMessage: 'Pier change' },
  default: { id: 'navigation-platform-change', defaultMessage: 'Platform change' },
};

export function getTrackOrPierOrPlatformChangeText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS[mode] ?? TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS = {
  [TransportMode.Rail]: { id: 'navigation-track-restored', defaultMessage: 'Track restored' },
  [TransportMode.Ferry]: { id: 'navigation-pier-restored', defaultMessage: 'Pier restored' },
  default: { id: 'navigation-platform-restored', defaultMessage: 'Platform restored' },
};

export function getTrackOrPierOrPlatformRestoredText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS = {
  [TransportMode.Rail]: { id: 'navigation-track-change-details' },
  [TransportMode.Ferry]: { id: 'navigation-pier-change-details' },
  default: { id: 'navigation-platform-change-details' },
};

export function getTrackOrPierOrPlatformChangeDetailsText(intl, mode, number, routeName) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS.default,
    { number: number || '', name: routeName || '' },
  );
}

const TERMINAL_OR_STATION_MSGS = {
  [TransportMode.Ferry]: { id: 'terminal', defaultMessage: 'Terminal' },
  default: { id: 'station', defaultMessage: 'Station' },
};

export function getTerminalOrStationText(intl, mode) {
  return intl.formatMessage(TERMINAL_OR_STATION_MSGS[mode] ?? TERMINAL_OR_STATION_MSGS.default);
}

const FIRST_DEPARTURE_STOP_TYPE_MSGS = {
  FERRY: { id: 'from-ferrypier' },
  RAIL: { id: 'from-station' },
  SUBWAY: { id: 'from-station' },
  default: { id: 'from-stop' },
};

export function getFirstDepartureStopTypeText(intl, mode) {
  return intl.formatMessage(
    FIRST_DEPARTURE_STOP_TYPE_MSGS[mode] ?? FIRST_DEPARTURE_STOP_TYPE_MSGS.default,
  );
}

/**
 * Returns a string with platform/track information for a transit leg, for screen reader use.
 * @param {Object} intl - The intl object for formatting messages.
 * @param {Object} leg - The transit leg object.
 * @param {boolean} showPlatformChangeLabel - Whether to include a platform-change prefix.
 * @returns {string} The boarding information text.
 */
export function getBoardingInformationText(intl, leg, showPlatformChangeLabel = true) {
  if (!leg) {
    return '';
  }
  const platformCode = leg?.from?.stop?.platformCode;
  if (platformCode) {
    const platformChangeLabelText =
      showPlatformChangeLabel && isPlatformChanged(leg)
        ? `${getTrackOrPierOrPlatformChangeText(intl, leg.mode)}:`
        : '';
    const platformLabel = getTrackOrPierOrPlatformWithNumText(intl, leg.mode, platformCode);
    return `${platformChangeLabelText} ${platformLabel}`;
  }
  return '';
}

export function getFirstDepartureMessageId(firstDepartureLeg, isScreenReaderMessage) {
  if (isBikeOrScooterRentalLeg(firstDepartureLeg)) {
    return isScooterLeg(firstDepartureLeg)
      ? 'itinerary-summary-row.first-leg-start-time-scooter'
      : 'itinerary-summary-row.first-leg-start-time-citybike';
  }
  if (isTaxiLeg(firstDepartureLeg)) {
    return 'itinerary-summary-row.first-leg-start-time-taxi';
  }
  return isScreenReaderMessage
    ? 'itinerary-summary-row.first-leg-start-time-sr'
    : 'itinerary-summary-row.first-leg-start-time';
}

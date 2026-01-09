import {
  getNameLabel,
  getStopCode,
} from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import { getStopName } from '@digitransit-search-util/digitransit-search-util-helpers';
import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import { DateTime } from 'luxon';

export const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

export const isPOISearch = id =>
  id === 'origin' ||
  id === 'destination' ||
  id === 'via-point' ||
  id === 'origin-stop-near-you';

export const getPlatform = (addendum, lng, t) => {
  // check if i81n is initialized
  if (!t) {
    return undefined;
  }
  if (!addendum || !addendum.GTFS.platform) {
    return undefined;
  }
  const { modes, platform } = addendum.GTFS;
  const type =
    modes && modes[0] === 'RAIL' ? t('track', { lng }) : t('platform', { lng });
  return [type, platform];
};

export function getSuggestionContent(item, lng, t) {
  // check if i81n is initialized
  if (!t) {
    return undefined;
  }
  if (item.type !== 'FutureRoute') {
    if (item.type === 'SelectFromMap') {
      return ['', t('select-from-map', { lng })];
    }
    if (item.type === 'CurrentLocation') {
      return ['', t('use-own-position', { lng })];
    }
    if (item.type === 'SelectFromOwnLocations') {
      return ['', t('select-from-own-locations', { lng })];
    }
    /* eslint-disable-next-line prefer-const */
    let [name, label] = getNameLabel(item.properties, true);
    let suggestionType;
    if (
      item.properties.layer.toLowerCase().includes('bikerental') ||
      item.properties.layer.toLowerCase().includes('bikestation')
    ) {
      suggestionType = t('vehiclerentalstation', { lng });
      const stopCode = item.properties.labelId;
      return [suggestionType, name, undefined, stopCode];
    }

    if (item.properties.layer === 'bikepark') {
      suggestionType = t('bikepark', { lng });
      return [suggestionType, name, undefined, undefined];
    }

    if (item.properties.layer === 'carpark') {
      suggestionType = t('carpark', { lng });
      return [suggestionType, name, undefined, undefined];
    }

    if (item.properties.mode) {
      suggestionType = t(
        item.properties.mode.toLowerCase().replace('favourite', ''),
        { lng },
      );
    } else {
      const layer = item.properties.layer
        .replace('route-', '')
        .toLowerCase()
        .replace('favourite', '');
      suggestionType = t(layer, { lng });
    }

    if (
      item.properties.id &&
      (item.properties.layer === 'stop' || item.properties.layer === 'station')
    ) {
      const stopCode = getStopCode(item.properties);
      const mode = item.properties.addendum?.GTFS.modes;
      const platform = getPlatform(item.properties.addendum, lng, t);
      return [
        suggestionType,
        getStopName(name, stopCode),
        label,
        stopCode,
        mode,
        platform,
      ];
    }
    if (
      item.properties.layer === 'favouriteStop' ||
      item.properties.layer === 'favouriteStation'
    ) {
      const { address, code } = item.properties;
      const stoName = address ? getStopName(address.split(',')[0], code) : name;
      const platform = getPlatform(item.properties.addendum, lng);
      return [suggestionType, stoName, label, code, undefined, platform];
    }
    return [suggestionType, name, label];
  }
  const { origin, destination } = item.properties;
  const tail1 = origin.locality ? `, ${origin.locality} foobar` : '';
  const tail2 = destination.locality ? `, ${destination.locality}` : '';
  const name1 = origin.name;
  const name2 = destination.name;
  return [
    t('future-route', { lng }),
    `${t('origin', { lng })} ${name1}${tail1} ${t('destination', {
      lng,
    })} ${name2}${tail2}`,
    item.translatedText,
  ];
}

export function translateFutureRouteSuggestionTime(item, lng, t) {
  // check if i81n is initialized
  if (!t) {
    return undefined;
  }
  const time = DateTime.fromSeconds(Number(item.properties.time));
  const now = DateTime.now();
  let str = item.properties.arriveBy
    ? t('arrival', { lng })
    : t('departure', { lng });
  if (time.hasSame(now, 'day')) {
    str = `${str} ${t('today-at')}`;
  } else if (time.hasSame(now.plus({ days: 1 }), 'day')) {
    str = `${str} ${t('tomorrow-at', { lng })}`;
  } else {
    str = `${str} ${time.toFormat('ccc d.L.')}`;
  }
  str = `${str} ${time.toFormat('HH:mm')}`;
  return str;
}

export const getSuggestionValue = suggestion => {
  if (
    suggestion.type === 'SelectFromOwnLocations' ||
    suggestion.type === 'back'
  ) {
    return '';
  }
  return getLabel(suggestion.properties);
};

export const suggestionAsAriaContent = ({ suggestions, t, lng }) => {
  let label = [];
  const firstSuggestion = suggestions[0];
  if (firstSuggestion) {
    if (firstSuggestion.type && firstSuggestion.type.includes('Favourite')) {
      label.push(t('favourite', { lng }));
    }
    label = label.concat(getSuggestionContent(suggestions[0], lng));
  }
  return [...new Set(label)].join(' - ');
};

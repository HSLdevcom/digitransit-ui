import React from 'react';
import { FormattedMessage } from 'react-intl';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';

import StopCode from '../component/StopCode';

const getLocality = suggestion => suggestion.localadmin || suggestion.locality || '';

memoize.Cache = Map;

export const getLabel = memoize((suggestion) => {
  switch (suggestion.layer) {
    case 'currentPosition':
      return [suggestion.labelId, null];
    case 'favouritePlace':
      return [suggestion.locationName, suggestion.address];
    case 'favouriteRoute':
    case 'route-BUS':
    case 'route-TRAM':
    case 'route-RAIL':
    case 'route-SUBWAY':
    case 'route-FERRY':
    case 'route-AIRPLANE':
      return suggestion.shortName ? [(
        <span>
          <span className={suggestion.mode.toLowerCase()}>{suggestion.shortName}</span>
          <span className="suggestion-type">
            &nbsp;-&nbsp;
            <FormattedMessage id="route" defaultMessage="Route" />
          </span>
        </span>
      ), suggestion.longName] : [suggestion.longName, null];
    case 'venue': {
      let desc;
      if (suggestion.street) {
        desc = suggestion.housenumber ?
          `${suggestion.street} ${suggestion.housenumber}, ${getLocality(suggestion)}` :
          `${suggestion.street}, ${getLocality(suggestion)}`;
      } else {
        desc = suggestion.label.replace(new RegExp(`${suggestion.name}(,)?( )?`), '');
      }
      return [suggestion.name, desc];
    }
    case 'favouriteStop':
    case 'stop':
      return suggestion.source === 'gtfs' ?
        [suggestion.name || suggestion.label, getLocality(suggestion)] : [suggestion.name, (
          <span>{suggestion.code && <StopCode code={suggestion.code} />} {suggestion.desc}</span>
        )];
    case 'station':
      return [suggestion.name || suggestion.label, getLocality(suggestion)];
    default:
      return [suggestion.name || suggestion.label, getLocality(suggestion)];
  }
});

export function uniqByLabel(features) {
  return uniqWith(features, (feat1, feat2) =>
    isEqual(getLabel(feat1.properties), getLabel(feat2.properties)),
  );
}

export function getIcon(layer) {
  const layerIcon = new Map([
    ['favouritePlace', 'icon-icon_star'],
    ['favouriteRoute', 'icon-icon_star'],
    ['favouriteStop', 'icon-icon_star'],
    ['favourite', 'icon-icon_star'],
    ['address', 'icon-icon_place'],
    ['stop', 'icon-icon_bus-stop'],
    ['locality', 'icon-icon_city'],
    ['station', 'icon-icon_station'],
    ['localadmin', 'icon-icon_city'],
    ['neighbourdood', 'icon-icon_city'],
    ['route-BUS', 'icon-icon_bus-withoutBox'],
    ['route-TRAM', 'icon-icon_tram-withoutBox'],
    ['route-RAIL', 'icon-icon_rail-withoutBox'],
    ['route-SUBWAY', 'icon-icon_subway-withoutBox'],
    ['route-FERRY', 'icon-icon_ferry-withoutBox'],
    ['route-AIRPLANE', 'icon-icon_airplane-withoutBox']]);

  const defaultIcon = 'icon-icon_place';
  return layerIcon.get(layer) || defaultIcon;
}

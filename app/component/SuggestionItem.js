import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';

import Icon from './Icon';
import {
  getNameLabel,
  getIcon,
  isStop,
  getGTFSId,
} from '../util/suggestionUtils';
import ComponentUsageExample from './ComponentUsageExample';

const SuggestionItem = pure(
  ({ item, useTransportIcons, doNotShowLinkToStop }) => {
    let icon;
    if (item.properties.mode && useTransportIcons) {
      icon = (
        <Icon
          img={`icon-icon_${item.properties.mode}`}
          className={item.properties.mode}
        />
      );
    } else {
      icon = (
        <Icon
          img={getIcon(item.properties.layer)}
          className={item.iconClass || ''}
        />
      );
    }

    const [name, label] = getNameLabel(item.properties, false);

    const ri = (
      <div
        className={cx('search-result', item.type, {
          favourite: item.type.startsWith('Favourite'),
        })}
      >
        <span className="autosuggestIcon">{icon}</span>
        <div>
          <p className="suggestion-name">{name}</p>
          <p className="suggestion-label">{label}</p>
        </div>
      </div>
    );
    if (
      doNotShowLinkToStop === false &&
      isStop(item.properties) &&
      getGTFSId(item.properties) !== undefined &&
      (get(item, 'properties.id') || get(item, 'properties.code')) !== undefined
    ) {
      /* eslint no-param-reassign: ["error", { "props": false }] */
      return (
        <div className="suggestion-item-stop">
          <div>
            <Link
              onClick={() => {
                item.timetableClicked = false;
              }}
            >
              {ri}
            </Link>
          </div>
          <div className="suggestion-item-timetable">
            <Link
              onClick={() => {
                item.timetableClicked = true;
              }}
            >
              <Icon img="icon-icon_schedule" />
              <div className="suggestion-item-timetable-label">
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </Link>
          </div>
        </div>
      );
    }
    return ri;
  },
);

SuggestionItem.propTypes = {
  item: PropTypes.object,
  useTransportIcons: PropTypes.bool,
  doNotShowLInkToStop: PropTypes.bool,
};

SuggestionItem.displayName = 'SuggestionItem';

const exampleFavourite = {
  type: 'FavouritePlace',
  properties: {
    locationName: 'HSL',
    address: 'Opastinsilta 6, Helsinki',
    layer: 'favouritePlace',
  },
};

const exampleAddress = {
  type: 'Feature',
  properties: {
    id: 'fi/uusimaa:103267060F-3',
    layer: 'address',
    source: 'openaddresses',
    name: 'Opastinsilta 6',
    housenumber: '6',
    street: 'Opastinsilta',
    postalcode: '00520',
    confidence: 1,
    accuracy: 'point',
    region: 'Uusimaa',
    localadmin: 'Helsinki',
    locality: 'Helsinki',
    neighbourhood: 'Itä-Pasila',
    label: 'Opastinsilta 6, Helsinki',
  },
};

const exampleRoute = {
  type: 'Route',
  properties: {
    gtfsId: 'HSL:1019',
    agency: { name: 'Helsingin seudun liikenne' },
    shortName: '19',
    mode: 'FERRY',
    longName: 'Kauppatori - Suomenlinna',
    layer: 'route-FERRY',
    link: '/linjat/HSL:1019',
  },
};

const exampleStop = {
  type: 'Stop',
  properties: {
    source: 'gtfsHSL',
    gtfsId: 'HSL:1130446',
    id: 'HSL:1130446#0221',
    name: 'Caloniuksenkatu',
    desc: 'Mechelininkatu 21',
    code: '0221',
    mode: 'tram',
    layer: 'stop',
    link: '/pysakit/HSL:1130446',
  },
};

SuggestionItem.description = () => (
  <div>
    <ComponentUsageExample description="Favourite">
      <SuggestionItem item={exampleFavourite} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Address">
      <SuggestionItem item={exampleAddress} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Route">
      <SuggestionItem item={exampleRoute} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Stop">
      <SuggestionItem item={exampleStop} doNotShowLinkToStop={false} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Stop">
      <SuggestionItem item={exampleStop} doNotShowLinkToStop />
    </ComponentUsageExample>
  </div>
);

export default SuggestionItem;

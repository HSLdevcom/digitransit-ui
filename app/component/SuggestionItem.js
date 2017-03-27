import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';

import Icon from './Icon';
import { getLabel, getIcon } from '../util/suggestionUtils';
import ComponentUsageExample from './ComponentUsageExample';

const SuggestionItem = pure((props) => {
  let icon;
  if (props.item.properties.mode && props.useTransportIcons) {
    icon = (
      <Icon
        img={`icon-icon_${props.item.properties.mode}`}
        className={props.item.properties.mode}
      />
    );
  } else {
    icon = (
      <Icon
        img={getIcon(props.item.properties.layer)}
        className={props.item.iconClass || ''}
      />
    );
  }

  const label = getLabel(props.item.properties);

  return (
    <div
      className={cx(
        'search-result',
        props.item.type,
        { favourite: props.item.type.startsWith('Favourite') },
      )}
    >
      <span className="autosuggestIcon">
        {icon}
      </span>
      <div>
        <p className="suggestion-name" >{label[0]}</p>
        <p className="suggestion-label" >{label[1]}</p>
      </div>
    </div>);
});

SuggestionItem.propTypes = {
  item: React.PropTypes.object,
  useTransportIcons: React.PropTypes.bool,
};


SuggestionItem.displayName = 'SuggestionItem';

const exampleFavourite = {
  type: 'FavouritePlace',
  properties: { locationName: 'HSL', address: 'Opastinsilta 6, Helsinki', layer: 'favouritePlace' },
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
    gtfsId: 'HSL:1130446',
    name: 'Caloniuksenkatu',
    desc: 'Mechelininkatu 21',
    code: '0221',
    mode: 'tram',
    layer: 'stop',
    link: '/pysakit/HSL:1130446',
  },
};

SuggestionItem.description = () =>
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
      <SuggestionItem item={exampleStop} />
    </ComponentUsageExample>
  </div>;

export default SuggestionItem;

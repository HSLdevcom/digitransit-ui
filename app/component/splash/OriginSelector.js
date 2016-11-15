import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import config from '../../config';
import { setEndpoint } from '../../action/EndpointActions';
import Icon from '../icon/Icon';

const OriginSelectorRow = ({ type, address, lat, lon }, { executeAction }) => (
  <li
    onClick={() => executeAction(setEndpoint,
      { target: 'origin', endpoint: { lat, lon, address } })}
  >
    <Icon className={`icon-origin-${type}`} img={`icon-icon_${type}`} />
    { address }
  </li>
);

OriginSelectorRow.propTypes = {
  type: React.PropTypes.string.isRequired,
  address: React.PropTypes.string.isRequired,
  lat: React.PropTypes.number.isRequired,
  lon: React.PropTypes.number.isRequired,
};

OriginSelectorRow.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

const OriginSelector = ({ favourites }) => {
  const names = favourites.map(
      f => <OriginSelectorRow
        key={f.locationName}
        type="star"
        address={f.locationName}
        lat={f.lat}
        lon={f.lon}
      />).concat(
    config.defaultOrigins.map(
      o => <OriginSelectorRow key={o.address} {...o} />)).slice(0, 3);
  return <ul>{names.slice(0, 3)}</ul>;
  // TODO Fill to three options from config
};

OriginSelector.propTypes = {
  favourites: React.PropTypes.array.isRequired,
};

export default connectToStores(
  OriginSelector,
  ['FavouriteLocationStore'],
  context => (
    { favourites: context.getStore('FavouriteLocationStore').getLocations() }
  ));

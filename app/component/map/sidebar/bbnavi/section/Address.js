import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../../../../Icon';

const Address = ({ addresses }) => {
  if (!addresses.length) {
    return null;
  }

  return addresses.map(item => {
    const { id, city, street, zip } = item;

    if (!city || !street || !zip) {
      return null;
    }

    return (
      <div key={id}>
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="icon-icon_place" />
          <span className="text-alignment">{`${street}, ${zip} ${city}`}</span>
        </div>
      </div>
    );
  });
};

Address.propTypes = {
  addresses: PropTypes.object.isRequired,
};

export default Address;

import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

const ZoneTicketIcon = ({ ticketType }) =>
  ticketType ? (
    <Icon
      className="zone-ticket-icon"
      img={`icon-icon_zone-ticket-${ticketType.toLowerCase()}`}
      viewBox={`0 0 ${ticketType.length * 44} 44`}
    />
  ) : null;

ZoneTicketIcon.propTypes = {
  ticketType: PropTypes.string.isRequired,
};

export default ZoneTicketIcon;

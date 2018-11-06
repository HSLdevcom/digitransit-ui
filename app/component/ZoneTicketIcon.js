import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

const ZoneTicketIcon = ({ ticketType }) =>
  ticketType ? (
    <Icon
      className="zone-ticket-icon"
      height={1}
      img={`icon-icon_zone-ticket-${ticketType.toLowerCase()}`}
      omitViewBox
      width={ticketType.length + 0.35}
    />
  ) : null;

ZoneTicketIcon.propTypes = {
  ticketType: PropTypes.string.isRequired,
};

export default ZoneTicketIcon;

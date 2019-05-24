import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export const isWithinZoneB = (zones, fares) =>
  zones.length === 1 &&
  zones[0] === 'B' &&
  fares.length === 1 &&
  (fares[0].fareId === 'HSL:AB' || fares[0].fareId === 'HSL:BC');

export const renderZoneTicketIcon = (zoneId, isOnlyZoneB) => {
  if (!isOnlyZoneB) {
    return <ZoneTicketIcon ticketType={zoneId} />;
  }
  return (
    <div className="zone-ticket-multiple-options">
      <ZoneTicketIcon ticketType="AB" />
      <FormattedMessage id="or" />
      <ZoneTicketIcon ticketType="BC" />
    </div>
  );
};

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

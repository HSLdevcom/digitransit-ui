import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * Returns a zone ticket icon or icons, if there are alternativeFares, to render.
 *
 * @param {*} fareId the fareId (without feedId, for example AB)
 * @param {*} alternativeFares fares that should be shown in addition to the one given by OpenTripPlanner.
 */
export const renderZoneTicket = (fareId, alternativeFares) => {
  if (Array.isArray(alternativeFares) && alternativeFares.length > 0) {
    const options = [<ZoneTicket key={fareId} ticketType={fareId} />];
    for (let i = 0; i < alternativeFares.length; i++) {
      options.push(
        <FormattedMessage key={`${alternativeFares[i]}-or`} id="or" />,
      );
      options.push(
        <ZoneTicket
          key={alternativeFares[i]}
          ticketType={alternativeFares[i]}
        />,
      );
    }

    return <div className="zone-ticket-multiple-options">{options}</div>;
  }
  return <ZoneTicket ticketType={fareId} />;
};

const ZoneTicket = ({ ticketType }) =>
  ticketType ? <span className="zone-ticket">{ticketType}</span> : null;

ZoneTicket.propTypes = {
  ticketType: PropTypes.string.isRequired,
};

export default ZoneTicket;

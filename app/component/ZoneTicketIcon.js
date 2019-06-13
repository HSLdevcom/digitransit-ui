import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

/**
 * Returns a zone ticket icon or icons, if there are alternativeFares, to render.
 *
 * @param {*} fareId the fareId (without feedId, for example AB)
 * @param {*} alternativeFares fares that should be shown in addition to the one given by OpenTripPlanner.
 */
export const renderZoneTicketIcon = (fareId, alternativeFares) => {
  if (Array.isArray(alternativeFares) && alternativeFares.length > 0) {
    const options = [<ZoneTicketIcon ticketType={fareId} />]
    for (let i = 0; i < alternativeFares.length; i++) {
      options.push(<FormattedMessage id="or" />);
      options.push(<ZoneTicketIcon ticketType={alternativeFares[i]} />);
    }

    return (
      <div className="zone-ticket-multiple-options">
        {options}
      </div>
    );
  }
  return <ZoneTicketIcon ticketType={fareId} />;
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

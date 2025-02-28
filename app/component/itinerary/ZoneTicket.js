import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * Returns a zone ticket icon or icons, if there are alternativeFares, to render.
 *
 * @param {*} fareId the fareId (without feedId, for example AB)
 * @param {*} alternativeFares fares that should be shown in addition to the one given by OpenTripPlanner.
 */
export const renderZoneTicket = (fareId, alternativeFares, hasPurchaseLink) => {
  if (Array.isArray(alternativeFares) && alternativeFares.length > 0) {
    const options = [
      <ZoneTicket
        key={fareId}
        ticketType={fareId}
        hasPurchaseLink={hasPurchaseLink}
      />,
    ];
    for (let i = 0; i < alternativeFares.length; i++) {
      options.push(
        <div className="or" key={`${alternativeFares[i]}-or`}>
          <FormattedMessage id="or" />
        </div>,
      );
      options.push(
        <ZoneTicket
          key={alternativeFares[i]}
          ticketType={alternativeFares[i]}
          hasPurchaseLink={hasPurchaseLink}
        />,
      );
    }

    return <div className="zone-ticket-multiple-options">{options}</div>;
  }
  return <ZoneTicket ticketType={fareId} hasPurchaseLink={hasPurchaseLink} />;
};

const ZoneTicket = ({ ticketType, hasPurchaseLink }) =>
  ticketType ? (
    <span
      className={cx('zone-ticket', {
        purchase: hasPurchaseLink,
      })}
    >
      {ticketType}
    </span>
  ) : null;

ZoneTicket.propTypes = {
  ticketType: PropTypes.string.isRequired,
  hasPurchaseLink: PropTypes.bool,
};

ZoneTicket.defaultProps = {
  hasPurchaseLink: false,
};
export default ZoneTicket;

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
export const renderZoneTicket = (fareId, alternativeFares, hslMobile) => {
  if (Array.isArray(alternativeFares) && alternativeFares.length > 0) {
    const options = [<ZoneTicket key={fareId} ticketType={fareId} />];
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
        />,
      );
    }

    return <div className="zone-ticket-multiple-options">{options}</div>;
  }
  return <ZoneTicket ticketType={fareId} isHSL={hslMobile} />;
};

const ZoneTicket = ({ ticketType, isHSL }) =>
  ticketType ? (
    <span
      className={cx('zone-ticket', {
        hsl: isHSL,
      })}
    >
      {ticketType}
    </span>
  ) : null;

ZoneTicket.propTypes = {
  ticketType: PropTypes.string.isRequired,
  isHSL: PropTypes.bool,
};

ZoneTicket.defaultProps = {
  isHSL: false,
};
export default ZoneTicket;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function ItineraryNotification({ headerId, bodyId, iconId }) {
  return (
    <div className="itinerary-notification">
      <div className="left-block">{iconId && <Icon img={iconId} />}</div>
      <div className="right-block">
        <h3>{headerId && <FormattedMessage id={headerId} />}</h3>
        <p>{bodyId && <FormattedMessage id={bodyId} />}</p>
      </div>
    </div>
  );
}

ItineraryNotification.propTypes = {
  headerId: PropTypes.string,
  bodyId: PropTypes.string,
  iconId: PropTypes.string,
};

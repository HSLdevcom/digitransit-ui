import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function ItineraryListHeader({ translationId, defaultMessage }) {
  return (
    <div className="itinerary-summary-subtitle-container">
      <FormattedMessage id={translationId} defaultMessage={defaultMessage} />
    </div>
  );
}

ItineraryListHeader.propTypes = {
  translationId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
};

ItineraryListHeader.defaultProps = {
  defaultMessage: '',
};

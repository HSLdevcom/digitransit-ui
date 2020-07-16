import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export const ItinerarySummarySubtitle = ({ translationId, defaultMessage }) => {
  return (
    <div className="itinerary-summary-subtitle-container">
      <FormattedMessage id={translationId} defaultMessage={defaultMessage} />
    </div>
  );
};

ItinerarySummarySubtitle.propTypes = {
  translationId: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
};

ItinerarySummarySubtitle.defaultProps = {
  defaultMessage: '',
};

export default ItinerarySummarySubtitle;

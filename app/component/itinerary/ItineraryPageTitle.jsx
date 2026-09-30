import React from 'react';
import { FormattedMessage } from 'react-intl';
import { matchShape } from '../../../utils/client/shapes';

export default function ItineraryPageTitle(props) {
  return (
    <span>
      {props.match.params.hash == null ? (
        <FormattedMessage
          id="summary-page.title"
          defaultMessage="Itinerary suggestions"
        />
      ) : (
        <FormattedMessage
          id="itinerary-page.title"
          defaultMessage="Itinerary"
        />
      )}
    </span>
  );
}

ItineraryPageTitle.propTypes = {
  match: matchShape.isRequired,
};

import React from 'react';
import { matchShape } from 'found';
import { FormattedMessage } from 'react-intl';

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

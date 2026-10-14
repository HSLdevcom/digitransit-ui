import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'found';

export default function ItineraryPageTitle() {
  const match = useMatch();
  return (
    <span>
      {match.params.hash == null ? (
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

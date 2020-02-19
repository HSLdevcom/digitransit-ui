import React from 'react';
import { matchShape } from 'found';
import { FormattedMessage } from 'react-intl';

export default function SummaryTitle(props) {
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

SummaryTitle.propTypes = {
  match: matchShape.isRequired,
};

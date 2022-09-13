import React from 'react';
import { matchShape } from 'found';
import ExternalLink from './ExternalLink';

const PastLink = ({ match }) => (
  <ExternalLink
    href={match.location.pathname}
    msgId="itinerary-in-the-past-link"
  />
);

PastLink.propTypes = {
  match: matchShape.isRequired,
};

export default PastLink;

import React from 'react';
import { matchShape } from 'found';
import Link from './Link';

const PastLink = ({ match }) => (
  <Link href={match.location.pathname} msgId="itinerary-in-the-past-link" />
);

PastLink.propTypes = {
  match: matchShape.isRequired,
};

export default PastLink;

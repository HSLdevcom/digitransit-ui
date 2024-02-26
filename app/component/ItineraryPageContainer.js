import PropTypes from 'prop-types';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { matchShape } from 'found';
import Loading from './Loading';

const ItineraryPage = lazy(() => import('./ItineraryPage'));

export default function ItineraryPageContainer({ content, match }) {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  if (!isClient) {
    return <Loading />;
  }
  return (
    <Suspense fallback={<Loading />}>
      <ItineraryPage content={content} match={match} />
    </Suspense>
  );
}

ItineraryPageContainer.propTypes = {
  content: PropTypes.node,
  match: matchShape.isRequired,
};

ItineraryPageContainer.defaultProps = {
  content: undefined,
};

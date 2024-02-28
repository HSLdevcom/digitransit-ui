import React from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';

import LocationStateShape from '../prop-types/LocationStateShape';
import LocationShape from '../prop-types/LocationShape';
import ErrorShape from '../prop-types/ErrorShape';
import RoutingErrorShape from '../prop-types/RoutingErrorShape';
import ErrorCard from './ErrorCard';
import findErrorMessageIds from './findErrorMessageIds';
import errorCardProps from './errorCardProperties';

/**
 * Get error message visual properties.
 *
 * @param {Array.<String>} summaryMessageIds
 * @return {Object} { titleId, bodyId, linkComponent, iconType, iconImg, LinkComponent }
 */
function getErrorCardProps(summaryMessageIds) {
  // match to priority-ordered props list
  return (
    errorCardProps.find(({ id }) => summaryMessageIds.indexOf(id) >= 0)
      ?.props || {}
  );
}

export default function ItinerarySummaryMessage(
  {
    walking,
    biking,
    driving,
    currentTime,
    error,
    from,
    locationState,
    searchTime,
    to,
    routingErrors,
  },
  context,
) {
  const { match, config } = context;
  const { areaPolygon, minDistanceBetweenFromAndTo, nationalServiceLink } =
    config;

  const query = { from, to, searchTime, biking, driving, walking };
  const queryContext = {
    locationState,
    areaPolygon,
    minDistanceBetweenFromAndTo,
    error,
    currentTime,
  };
  const errorMessageIds = findErrorMessageIds(
    routingErrors,
    query,
    queryContext,
  );

  const { LinkComponent, titleId, bodyId, iconImg, iconType } =
    getErrorCardProps(errorMessageIds);

  const linkCompProps = {
    nationalServiceLink,
    match,
  };

  return (
    <ErrorCard
      msgId={bodyId}
      titleId={titleId}
      iconImg={iconImg}
      iconType={iconType}
    >
      {LinkComponent && <LinkComponent {...linkCompProps} />}
    </ErrorCard>
  );
}

ItinerarySummaryMessage.propTypes = {
  from: LocationShape.isRequired,
  to: LocationShape.isRequired,
  locationState: LocationStateShape,
  searchTime: PropTypes.number.isRequired,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  driving: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  error: ErrorShape,
  routingErrors: PropTypes.arrayOf(RoutingErrorShape),
};

ItinerarySummaryMessage.defaultProps = {
  walking: false,
  biking: false,
  driving: false,
  error: '',
  locationState: undefined,
  routingErrors: [],
};

ItinerarySummaryMessage.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

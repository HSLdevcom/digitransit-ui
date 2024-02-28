import React from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
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

function ItinerarySummaryMessage(
  {
    from,
    to,
    walking,
    biking,
    driving,
    error,
    routingErrors,
    locationState,
    currentTime,
    searchTime,
  },
  context,
) {
  const { match, config } = context;
  const { areaPolygon, minDistanceBetweenFromAndTo, nationalServiceLink } =
    config;

  const query = { from, to, searchTime, biking, driving, walking };
  if (!searchTime) {
    query.searchTime = currentTime;
  }
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

const connectedComponent = connectToStores(
  ItinerarySummaryMessage,
  ['TimeStore', 'PositionStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().valueOf(),
    locationState: context.getStore('PositionStore').getLocationState(),
  }),
);

export { connectedComponent as default, ItinerarySummaryMessage as Component };

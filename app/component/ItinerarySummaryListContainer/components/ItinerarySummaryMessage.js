import React from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';

import LocationStateShape from '../../../prop-types/LocationStateShape';
import LocationShape from '../../../prop-types/LocationShape';
import ErrorShape from '../../../prop-types/ErrorShape';
import RoutingErrorShape from '../../../prop-types/RoutingErrorShape';
import ErrorCard from './components/ErrorCard';
import findErrorMessageIds from './utils/findErrorMessageIds';
import isRelayNetworkError from '../../../util/relayUtils';
import errorCardProps from './utils/errorCardProperties';

/**
 * Get error message visual properties.
 *
 * @param {Array.<String>} summaryMessageIds
 * @return {Object} { titleId, bodyId, linkComponent, iconType, iconImg, LinkComponent }
 */
const getErrorCardProps = summaryMessageIds => {
  // match to priority-ordered props list
  return (
    errorCardProps.find(({ id }) => summaryMessageIds.indexOf(id) >= 0)
      ?.props || {}
  );
};

const ItinerarySummaryMessage = (
  {
    areaPolygon,
    biking,
    currentTime,
    driving,
    error,
    from,
    locationState,
    minDistanceBetweenFromAndTo,
    nationalServiceLink,
    searchTime,
    to,
    walking,
    routingErrors,
    hasSettingsChanges,
  },
  context,
) => {
  const { match } = context;

  const query = { from, to, searchTime, biking, driving, walking };
  const queryContext = {
    locationState,
    areaPolygon,
    minDistanceBetweenFromAndTo,
    error,
    currentTime,
    hasSettingsChanges,
  };
  const errorMessageIds = findErrorMessageIds(
    routingErrors,
    query,
    queryContext,
  );

  // todo: move this into findErrorMessageIds()
  // `error` is either an error message or a message id.
  if (error && (/\bNetworkError\b/.test(error) || isRelayNetworkError(error))) {
    errorMessageIds.unshift('network-error-itineraries-summary');
  }

  const {
    LinkComponent,
    titleId,
    bodyId,
    iconImg,
    iconType,
  } = getErrorCardProps(errorMessageIds);

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
};

const PolygonPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number));
const LinkShape = PropTypes.objectOf(
  PropTypes.shape({
    href: PropTypes.string,
    name: PropTypes.string,
  }),
);

ItinerarySummaryMessage.propTypes = {
  areaPolygon: PolygonPropType.isRequired,
  biking: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  driving: PropTypes.bool,
  error: ErrorShape,
  from: LocationShape.isRequired,
  locationState: LocationStateShape,
  minDistanceBetweenFromAndTo: PropTypes.number,
  nationalServiceLink: LinkShape.isRequired,
  searchTime: PropTypes.number.isRequired,
  to: LocationShape.isRequired,
  walking: PropTypes.bool,
  routingErrors: PropTypes.arrayOf(RoutingErrorShape),
  hasSettingsChanges: PropTypes.bool,
};

ItinerarySummaryMessage.defaultProps = {
  biking: false,
  driving: false,
  error: '',
  locationState: undefined,
  minDistanceBetweenFromAndTo: 0,
  walking: false,
  routingErrors: [],
  hasSettingsChanges: false,
};

ItinerarySummaryMessage.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

export default ItinerarySummaryMessage;

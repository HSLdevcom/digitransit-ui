import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import {
  errorShape,
  RoutingerrorShape,
  locationShape,
} from '../../../utils/client/shapes';
import ErrorCard from './ErrorCard';
import findErrorMessageIds from './findErrorMessageIds';
import errorCardProps from './errorCardProperties';
import { useConfigContext } from '../../hooks/ConfigContext';
import { usePosition } from '../../hooks/PositionContext';

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

export default function NoItinerariesNote({
  from,
  to,
  walking = false,
  biking = false,
  driving = false,
  error = '',
  routingErrors = [],
  searchTime,
}) {
  const { match } = useRouter();
  const config = useConfigContext();
  const locationState = usePosition();
  const { areaPolygon, minDistanceBetweenFromAndTo, nationalServiceLink } =
    config;
  const { hash } = match.params;
  const query = { from, to, searchTime, biking, driving, walking, hash };
  const currentTime = Date.now();
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

NoItinerariesNote.propTypes = {
  from: locationShape.isRequired,
  to: locationShape.isRequired,
  searchTime: PropTypes.number.isRequired,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  driving: PropTypes.bool,
  error: errorShape,
  routingErrors: PropTypes.arrayOf(RoutingerrorShape),
};

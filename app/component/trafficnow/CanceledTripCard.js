import React from 'react';
import { useRouter } from 'found';
import PropTypes from 'prop-types';
import { useConfigContext } from '../../configurations/ConfigContext';
import { TRAFFICNOW, routePagePath } from '../../util/path';
import Card from '../Card';
import Icon from '../Icon';
// import CanceledDepartures from './components/CanceledDepartures';
import DisruptionStatus from './components/DisruptionStatus';
import RouteBadgeGroup from './components/RouteBadgeGroup';
import DisruptionBadge from './DisruptionBadge';
import { patternShape, routeShape } from '../../util/shapes';

const MAX_BADGES = 5;

const CanceledTripCard = ({ mode, routes, isMobile = false }) => {
  const { router } = useRouter();
  const { colors } = useConfigContext();
  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    e.stopPropagation();
    router.push(url);
  };

  return (
    <Card
      className="disruption-card clickable"
      onClick={handleRouteBadgeClick(`/${TRAFFICNOW}/peruutukset/${mode}`)}
    >
      <header>
        <span className="disruption-card__header-left">
          <DisruptionBadge showIcon variant="WARNING" label="NO_SERVICE" />
          {!isMobile && (
            <>
              {' '}
              <div className="separator vertical" />
              <DisruptionStatus
                active
                showDates={false}
                className="text-xs-bold"
              />
            </>
          )}
        </span>
        <button type="button">
          <Icon
            img="icon_arrow-collapse--right"
            color={colors.primary}
            className="disruption-card__icon"
          />
        </button>
      </header>
      <div className="badges">
        <RouteBadgeGroup
          mode={mode}
          stopPropagation
          routes={routes.slice(0, MAX_BADGES).map(({ route }) => ({
            name: route.shortName,
            gtfsId: route.gtfsId,
            id: route.id,
            url: routePagePath(route.gtfsId),
          }))}
          // TODO: show canceled departures on single route card
          // renderRouteSuffix={() =>
          //   true ? (
          //     <CanceledDepartures
          //       departures={routes[0].patterns.map(({ gtfsId }) => ({
          //         tripId: gtfsId,
          //         departureTime: '11:23',
          //       }))}
          //     />
          //   ) : null
          // }
          renderSuffix={
            routes.length > MAX_BADGES ? (
              <span style={{ backgroundColor: '#F2F5F7' }}>
                <Icon img="icon_three-dots" width={1.3} height={1.3} />
              </span>
            ) : null
          }
        />
      </div>
      {isMobile && (
        <DisruptionStatus active showDates={false} className="text-xs-bold" />
      )}
    </Card>
  );
};

CanceledTripCard.propTypes = {
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      cancellationCount: PropTypes.number.isRequired,
      route: routeShape.isRequired,
      patterns: PropTypes.arrayOf(
        PropTypes.shape({
          pattern: patternShape.isRequired,
          cancellationCount: PropTypes.number.isRequired,
        }).isRequired,
      ).isRequired,
    }),
  ).isRequired,
};

export default CanceledTripCard;

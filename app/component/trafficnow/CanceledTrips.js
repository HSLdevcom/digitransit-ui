import React, { useMemo, useState } from 'react';
import Button from '@hsl-fi/button';
import cx from 'classnames';
import Link from 'found/Link';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { usePaginationFragment } from 'react-relay/hooks';
import { useConfigContext } from '../../configurations/ConfigContext';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import Card from '../Card';
import Icon from '../Icon';
import CanceledTripsModal from './CanceledTripsModal';
import CancellationContainer from './components/CancellationContainer';
import ResultsProgressBar from './components/ResultsProgressBar';
import DisruptionBadge from './DisruptionBadge';
import CanceledTripsPaginationFragment from './queries/CanceledTripsPaginationFragment';

const CANCELED_TRIPS_QUERY_AMOUNT = 1;

const CanceledTrips = ({ query, isMobile = false, ...props }) => {
  const { colors } = useConfigContext();
  const intl = useTranslationsContext();
  const [detailsKey, setDetailsKey] = useState(null);

  const {
    data: { canceledTrips },
    loadNext,
    isLoadingNext,
    hasNext,
  } = usePaginationFragment(CanceledTripsPaginationFragment, query);

  const mode = props.mode.toLowerCase();

  const allEdges = canceledTrips?.edges ?? [];

  const trips = useMemo(
    () =>
      /* eslint-disable no-param-reassign */
      allEdges.reduce((routeGroups, { node }) => {
        if (
          !node?.trip?.route?.gtfsId ||
          !node?.start?.schedule?.time?.departure
        ) {
          return routeGroups;
        }

        const { start, end, trip } = node;
        const routeShortName = trip?.route?.shortName;
        const patternCode = trip?.pattern?.code;

        if (!routeGroups[routeShortName]) {
          routeGroups[routeShortName] = {
            routeGtfsId: trip.route.gtfsId,
            patterns: {},
          };
        }

        if (routeGroups[routeShortName].patterns[patternCode]) {
          routeGroups[routeShortName].patterns[
            patternCode
          ].cancelledDepartures.push(
            DateTime.fromISO(start?.schedule.time.departure).toFormat('HH:mm'),
          );
        } else {
          routeGroups[routeShortName].patterns[patternCode] = {
            start,
            end,
            trip,
            cancelledDepartures: [
              DateTime.fromISO(start?.schedule.time.departure).toFormat(
                'HH:mm',
              ),
            ],
          };
        }

        return routeGroups;
      }, {}),
    [allEdges],
  );

  const content = (
    <>
      <header className="canceled-trips__header">
        <DisruptionBadge showIcon variant="WARNING" label="NO_SERVICE" />
        <div className="validity-container text-s-bold">
          <Icon img="icon_clock" />
          <FormattedMessage id="valid" default="Active" />
        </div>
      </header>
      <div className="canceled-trips__body">
        {Object.entries(trips).map(
          ([routeShortName, { routeGtfsId, patterns }], i, arr) =>
            isMobile ? (
              <Card key={routeShortName}>
                <CancellationContainer
                  item={{
                    routeShortName,
                    routeGtfsId,
                    patterns,
                    index: i,
                    total: arr.length,
                  }}
                  mode={mode}
                  isMobile={isMobile}
                  colors={colors}
                  onShowDetailsClick={setDetailsKey}
                />
              </Card>
            ) : (
              <CancellationContainer
                key={routeShortName}
                item={{
                  routeShortName,
                  routeGtfsId,
                  patterns,
                  index: i,
                  total: arr.length,
                }}
                mode={mode}
                isMobile={isMobile}
                colors={colors}
                onShowDetailsClick={setDetailsKey}
              />
            ),
        )}
      </div>
      <footer className="canceled-trips__footer paragraph-extra-small">
        <div className="canceled-trips__footer-body">
          <FormattedMessage
            id="traffic-now_canceled-trips--amount"
            values={{
              amount: allEdges.length,
              totalAmount: canceledTrips.totalCount,
            }}
          />
          <ResultsProgressBar
            currentAmount={allEdges.length}
            totalAmount={canceledTrips.totalCount}
          />
          {hasNext && (
            <Button
              className="load-more-button link-bold-small"
              size="small"
              fullWidth={false}
              variant="white"
              value={intl.formatMessage({ id: 'show-more' })}
              onClick={() => loadNext(CANCELED_TRIPS_QUERY_AMOUNT)}
              disabled={isLoadingNext}
            />
          )}
        </div>
      </footer>
    </>
  );

  return (
    <>
      <div
        className={cx('canceled-trips__cta-container', {
          'canceled-trips__cta-container--mobile': isMobile,
        })}
      >
        <Link to="/liikenne" className="cta-small">
          <Icon img="icon_chevron-left" />
          <FormattedMessage id="traffic-now_go-back" />
          {isMobile && <div />}
        </Link>
      </div>

      <div className="canceled-trips__container">
        {isMobile ? content : <Card>{content}</Card>}
      </div>
      {!!detailsKey && (
        <CanceledTripsModal
          detailsKey={detailsKey}
          mode={mode}
          trips={trips}
          onClose={() => setDetailsKey(null)}
        />
      )}
    </>
  );
};

CanceledTrips.propTypes = {
  mode: PropTypes.string.isRequired,
  query: PropTypes.shape({}).isRequired,
  isMobile: PropTypes.bool,
};

export default CanceledTrips;

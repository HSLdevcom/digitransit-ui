import React, { useState } from 'react';
import Button from '@hsl-fi/button';
import cx from 'classnames';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';
import Card from '../Card';
import Icon from '../Icon';
import CanceledTripsModal from './CanceledTripsModal';
import CancellationContainer from './components/CancellationContainer';
import ResultsProgressBar from './components/ResultsProgressBar';
import DisruptionBadge from './DisruptionBadge';
import DisruptionStatus from './components/DisruptionStatus';
import { patternShape, routeShape } from '../../util/shapes';

const DEFAULT_ROUTES_SHOWN_AMOUNT = 8;

const CanceledTrips = ({ canceledRoutes = [], mode, isMobile = false }) => {
  const { colors } = useConfigContext();
  const intl = useIntl();
  const [detailsKey, setDetailsKey] = useState(null);
  const [showAmount, setShowAmount] = useState(
    DEFAULT_ROUTES_SHOWN_AMOUNT > canceledRoutes.length
      ? canceledRoutes.length
      : DEFAULT_ROUTES_SHOWN_AMOUNT,
  );

  const content = (
    <>
      <header className="canceled-trips__header">
        <DisruptionBadge showIcon variant="WARNING" label="NO_SERVICE" />
        <DisruptionStatus active showDates={false} className="text-s-bold" />
      </header>
      <div className="canceled-trips__body">
        {canceledRoutes.slice(0, showAmount).map((routeSummary, i) =>
          isMobile ? (
            <Card key={routeSummary.route.shortName}>
              <CancellationContainer
                routeSummary={routeSummary}
                mode={mode.toLowerCase()}
                isMobile={isMobile}
                colors={colors}
                onShowDetailsClick={setDetailsKey}
                separator={false}
              />
            </Card>
          ) : (
            <CancellationContainer
              key={routeSummary.route.shortName}
              routeSummary={routeSummary}
              mode={mode.toLowerCase()}
              isMobile={isMobile}
              colors={colors}
              onShowDetailsClick={setDetailsKey}
              separator={i + 1 < canceledRoutes.length}
            />
          ),
        )}
      </div>
      <footer className="canceled-trips__footer paragraph-extra-small">
        <div className="canceled-trips__footer-body">
          <FormattedMessage
            id="traffic-now_canceled-trips--amount"
            values={{
              amount: showAmount,
              totalAmount: canceledRoutes.length,
            }}
          />
          <ResultsProgressBar
            currentAmount={showAmount}
            totalAmount={canceledRoutes.length}
          />
          {showAmount < canceledRoutes.length && (
            <Button
              className="load-more-button link-bold-small"
              size="small"
              fullWidth={false}
              variant="white"
              value={intl.formatMessage({ id: 'show-more' })}
              onClick={() =>
                setShowAmount(
                  // cannot be set to more than the amount of cancellations
                  showAmount + DEFAULT_ROUTES_SHOWN_AMOUNT >
                    canceledRoutes.length
                    ? canceledRoutes.length
                    : showAmount + DEFAULT_ROUTES_SHOWN_AMOUNT,
                )
              }
            />
          )}
        </div>
      </footer>
    </>
  );

  return (
    <>
      <div
        className={cx('detail-view__cta-container', {
          'detail-view__cta-container--mobile': isMobile,
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
          routeSummary={canceledRoutes.find(
            ({ route }) => route.shortName === detailsKey,
          )}
          onClose={() => setDetailsKey(null)}
        />
      )}
    </>
  );
};

CanceledTrips.propTypes = {
  canceledRoutes: PropTypes.arrayOf(
    PropTypes.shape({
      cancellationCount: PropTypes.number.isRequired,
      route: routeShape.isRequired,
      patterns: PropTypes.arrayOf(
        PropTypes.shape({
          cancellationCount: PropTypes.number.isRequired,
          pattern: patternShape.isRequired,
        }),
      ).isRequired,
    }),
  ),
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default CanceledTrips;

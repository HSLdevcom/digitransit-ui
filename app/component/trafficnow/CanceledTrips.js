import React, { useState } from 'react';
import { Button } from '@hsl-fi/layout-primitives';
import cx from 'classnames';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';
import Card from '../Card';
import Icon from '../Icon';
import CancellationContainer from './components/CancellationContainer';
import ResultsProgressBar from './components/ResultsProgressBar';
import { patternShape, routeShape } from '../../util/shapes';

const DEFAULT_ROUTES_SHOWN_AMOUNT = 8;

const CanceledTrips = ({ canceledRoutes = [], mode, isMobile = false }) => {
  const { colors } = useConfigContext();
  const intl = useIntl();
  const [showAmount, setShowAmount] = useState(
    DEFAULT_ROUTES_SHOWN_AMOUNT > canceledRoutes.length
      ? canceledRoutes.length
      : DEFAULT_ROUTES_SHOWN_AMOUNT,
  );

  const content = (
    <>
      <div className="canceled-trips__body">
        {canceledRoutes.slice(0, showAmount).map((routeSummary, i) => {
          const cancellationContainer = (
            <CancellationContainer
              routeSummary={routeSummary}
              mode={mode.toLowerCase()}
              isMobile={isMobile}
              colors={colors}
              separator={!isMobile && i + 1 < canceledRoutes.length}
            />
          );

          return isMobile ? (
            <React.Fragment key={routeSummary.route.shortName}>
              {cancellationContainer}
            </React.Fragment>
          ) : (
            <Card
              key={routeSummary.route.shortName}
              className="canceled-trips__card"
            >
              {cancellationContainer}
            </Card>
          );
        })}
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
            <div className="canceled-trips__footer-show-more-container">
              <Button
                size="s"
                variant="secondary"
                onClick={() =>
                  setShowAmount(
                    // cannot be set to more than the amount of cancellations
                    showAmount + DEFAULT_ROUTES_SHOWN_AMOUNT >
                      canceledRoutes.length
                      ? canceledRoutes.length
                      : showAmount + DEFAULT_ROUTES_SHOWN_AMOUNT,
                  )
                }
              >
                {intl.formatMessage({ id: 'show-more' })}
              </Button>
            </div>
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

      <div className="canceled-trips__container">{content}</div>
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

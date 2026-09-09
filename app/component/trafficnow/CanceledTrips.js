import React, { useState } from 'react';
import { Button, Text } from '@hsl-fi/layout-primitives';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';
import Card from '../Card';
import CancellationContainer from './components/CancellationContainer';
import ResultsProgressBar from './components/ResultsProgressBar';
import { patternShape, routeShape } from '../../util/shapes';
import CTAContainer from './components/CTAContainer';

const DEFAULT_ROUTES_SHOWN_AMOUNT = 8;

const CanceledTrips = ({ canceledRoutes = [], mode, isMobile = false }) => {
  const { colors } = useConfigContext();
  const { formatMessage } = useIntl();
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
      <footer className="canceled-trips__footer">
        <div className="canceled-trips__footer-body">
          <Text variant="text-xs" as="div">
            {formatMessage(
              { id: 'traffic-now_canceled-trips--amount' },
              {
                amount: showAmount,
                totalAmount: canceledRoutes.length,
              },
            )}
          </Text>
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
                {formatMessage({ id: 'show-more' })}
              </Button>
            </div>
          )}
        </div>
      </footer>
    </>
  );

  return (
    <>
      <CTAContainer isMobile={isMobile} />
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

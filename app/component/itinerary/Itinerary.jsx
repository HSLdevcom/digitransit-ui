import cx from 'classnames';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { locationShape, itineraryShape } from '../../../utils/client/shapes';
import Icon from '../Icon';
import Feedback from './Feedback';
import {
  getTotalDistance,
  getZones,
  isCallAgencyLeg,
  isBoardableLeg,
} from '../../../utils/client/legUtils';
import {
  dateOrEmpty,
  isTomorrow,
  timeStr,
} from '../../../utils/client/timeUtils';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { isKeyboardSelectionEvent } from '../../../utils/shared/browser';
import { getSummaryDescriptionText } from '../../../utils/client/localeUtils';
import getCo2Value from '../../../utils/client/emissions';
import { ItineraryFragment } from './queries/ItineraryFragment';
import { getTicketString } from '../../../utils/client/fareUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import FirstLegStartTime from './FirstLegStartTime';
import { getItineraryLegSummary } from './itinerarySummaryUtils';
import useItineraryNavigation from './useItineraryNavigation';
import useItinerarySummaryUIState from './useItinerarySummaryUIState';
import ItineraryTimeSummary from './ItineraryTimeSummary';
import ItineraryLegs from './ItineraryLegs';
import buildItineraryLegStrip from './buildItineraryLegStrip';

export default function Itinerary({
  itinerary: itineraryRef,
  intermediatePlaces = [],
  hideSelectionIndicator = true,
  lowestCo2value = 0,
  passive = false,
  focusToHeader,
  ...props
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { formatMessage } = intl;
  const itinerary = useFragment(ItineraryFragment, itineraryRef);
  const breakpoint = useBreakpoint();
  const { onSelectImmediately, onSelectActive } = useItineraryNavigation({
    itinerary,
    hash: props.hash,
    passive,
    focusToHeader,
  });

  const { refTime } = props;
  const startTime = Date.parse(itinerary.start);
  const endTime = Date.parse(itinerary.end);
  const departureTime = timeStr(itinerary.start);
  const arrivalTime = timeStr(itinerary.end);
  const duration = endTime - startTime;
  const co2value = getCo2Value(itinerary);
  const mobile = bp => !(bp === 'large');
  const {
    compressedLegs,
    normalizedLegs,
    usingOwnBicycle,
    usingOwnBicycleWholeTrip,
    usingOwnCarWholeTrip,
    containsScooterLeg,
    shortenLabels,
    fitAllRouteNumbers,
    legWithRouteCount,
    bikeParkedIndex,
    renderModeIcons,
  } = getItineraryLegSummary({
    legs: itinerary.legs,
    intermediatePlaces,
    config,
    breakpoint,
    duration,
  });
  const {
    legs,
    iconLegsInPixels,
    vehicleNames,
    stopNames,
    bikeNetwork,
    showRentalBikeDurationWarning,
    citybikeNetworkCount,
    citybikeicon,
  } = buildItineraryLegStrip({
    normalizedLegs,
    itinerary,
    config,
    formatMessage,
    usingOwnBicycle,
    usingOwnBicycleWholeTrip,
    usingOwnCarWholeTrip,
    shortenLabels,
    fitAllRouteNumbers,
    legWithRouteCount,
    bikeParkedIndex,
    renderModeIcons,
  });
  const hasCallAgencyLeg = itinerary.legs.some(leg => isCallAgencyLeg(leg));

  const firstDeparture = compressedLegs.find(leg =>
    isBoardableLeg(leg, config.taxiZone.allowedRouteTypes),
  );
  const firstLegStartTime = (
    <FirstLegStartTime
      firstDeparture={firstDeparture}
      hasCallAgencyLeg={hasCallAgencyLeg}
      breakpoint={breakpoint}
      stopNames={stopNames}
    />
  );

  //  accessible representation for summary
  const summaryDescription = getSummaryDescriptionText(intl, {
    hasCallAgencyLeg,
    startTime,
    endTime,
    refTime,
    departureTime,
    arrivalTime,
    vehicleNames,
    firstDeparture,
    stopNames,
    duration,
  });
  const co2summary = (
    <FormattedMessage
      id="itinerary-co2.description-simple"
      defaultMessage="CO₂ emissions for this route"
      values={{
        co2value,
      }}
    />
  );

  const ariaLabelMessage = intl.formatMessage(
    {
      id: 'itinerary-page.show-details-label',
    },
    { number: props.hash + 1 },
  );

  const dateString = dateOrEmpty(startTime, refTime);
  const date = (
    <>
      {dateString}
      <span> </span>
      {dateString && <FormattedMessage id="at-time" />}
    </>
  );

  const startDate = isTomorrow(startTime, refTime) ? (
    <div className="tomorrow">
      <FormattedMessage id="tomorrow" />
    </div>
  ) : (
    date
  );
  const showCo2Info =
    config.showCO2InItinerarySummary &&
    co2value !== null &&
    co2value >= 0 &&
    !containsScooterLeg;

  const gotFeedback = props.feedback !== undefined;
  const {
    itineraryContainerOverflowRef,
    showOverflowIcon,
    isExpanded,
    feedbackExpandDone,
    handleFeedbackTransitionEnd,
  } = useItinerarySummaryUIState(gotFeedback);

  return (
    <div
      role="listitem"
      className={cx([
        'itinerary-summary-row',
        {
          passive,
          'bp-large': breakpoint === 'large',
          'no-border': hideSelectionIndicator,
        },
      ])}
      aria-atomic="true"
    >
      <div className="sr-only">
        <FormattedMessage
          id="summary-page.row-label"
          values={{
            number: props.hash + 1,
          }}
        />{' '}
        {summaryDescription}
        {showCo2Info && <> {co2summary}</>}
      </div>
      <div
        className="itinerary-summary-visible"
        style={{ display: 'flex' }}
        data-ticket-type={`${getTicketString(
          itinerary.legs,
          getZones(itinerary.legs),
          config,
        )}`}
      >
        {/* This next clickable region does not have proper accessible role, tabindex and keyboard handler
            because screen reader works weirdly with nested buttons. Same functonality works from the inner button */
        /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div className="itinerary-summary-header">
          <div>
            <div
              className="summary-clickable-area cursor-pointer"
              onClick={e => {
                if (mobile(breakpoint)) {
                  e.stopPropagation();
                  onSelectImmediately();
                } else {
                  onSelectActive();
                }
              }}
              onKeyPress={e => isKeyboardSelectionEvent(e) && onSelectActive()}
              tabIndex="0"
              role="button"
              aria-label={ariaLabelMessage}
            >
              <span key="ShowOnMapScreenReader" className="sr-only">
                <FormattedMessage id="itinerary-summary-row.clickable-area-description" />
              </span>
              <div className="itinerary-duration-container" aria-hidden="true">
                <ItineraryTimeSummary
                  startDate={startDate}
                  hasCallAgencyLeg={hasCallAgencyLeg}
                  departureTime={departureTime}
                  arrivalTime={arrivalTime}
                  duration={duration}
                >
                  {config.showDistanceInItinerarySummary && (
                    <div className="itinerary-total-distance">
                      {(getTotalDistance(itinerary) / 1000).toFixed(1)} km
                    </div>
                  )}
                  {showCo2Info && (
                    <div className="itinerary-co2-value-container">
                      {lowestCo2value === co2value && (
                        <Icon img="icon_co2_leaf" className="co2-leaf" />
                      )}
                      <div className="itinerary-co2-value">{co2value} g</div>
                    </div>
                  )}
                </ItineraryTimeSummary>
              </div>
              <ItineraryLegs
                ref={itineraryContainerOverflowRef}
                legs={legs}
                showOverflowIcon={showOverflowIcon}
                iconLegsInPixels={iconLegsInPixels}
              />
              <div
                className="itinerary-first-leg-start-time-container"
                key="endtime-distance"
                aria-hidden="true"
              >
                {firstLegStartTime}
              </div>
              {showRentalBikeDurationWarning &&
                (citybikeNetworkCount === 1 ? (
                  <div className="citybike-duration-info-short">
                    <Icon img={citybikeicon} height={1.2} width={1.2} />
                    <FormattedMessage
                      id="citybike-duration-info-short"
                      values={{
                        duration:
                          config.vehicleRental.networks[bikeNetwork]
                            .timeBeforeSurcharge / 60,
                      }}
                      defaultMessage=""
                    />
                  </div>
                ) : (
                  <div className="citybike-duration-info-short">
                    <Icon img={citybikeicon} height={1.2} width={1.2} />
                    <FormattedMessage
                      id="citybike-duration-general-header"
                      defaultMessage=""
                    />
                  </div>
                ))}
            </div>
            {props.giveFeedback && props.recommended && (
              <div
                className={
                  gotFeedback
                    ? ''
                    : cx('feedback-animated', {
                        open: isExpanded,
                        expanded: feedbackExpandDone,
                      })
                }
                onTransitionEnd={handleFeedbackTransitionEnd}
              >
                <div className={gotFeedback ? '' : 'feedback-motion'}>
                  <div className="feedback-frame">
                    <Feedback
                      recommended={props.recommended}
                      feedback={props.feedback}
                      giveFeedback={props.giveFeedback}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="summary-separator" />
          </div>
          {mobile(breakpoint) !== true && (
            <div
              tabIndex="0"
              role="button"
              title={formatMessage({ id: 'itinerary-page.show-details' })}
              key="arrow"
              className="action-arrow-click-area cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onSelectImmediately();
              }}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && onSelectImmediately()
              }
              aria-label={ariaLabelMessage}
            >
              <div className="action-arrow flex-grow">
                <Icon img="icon_arrow-collapse--right" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Itinerary.propTypes = {
  itinerary: itineraryShape.isRequired,
  refTime: PropTypes.number.isRequired,
  passive: PropTypes.bool,
  focusToHeader: PropTypes.func.isRequired,
  hash: PropTypes.number.isRequired,
  intermediatePlaces: PropTypes.arrayOf(locationShape),
  hideSelectionIndicator: PropTypes.bool,
  lowestCo2value: PropTypes.number,
  viaPoints: PropTypes.arrayOf(locationShape),
  recommended: PropTypes.bool,
  feedback: PropTypes.bool,
  giveFeedback: PropTypes.func,
};

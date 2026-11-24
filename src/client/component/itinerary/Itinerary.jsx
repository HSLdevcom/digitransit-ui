import cx from 'classnames';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { locationShape, itineraryShape } from '../../utils/shapes';
import Icon from '../Icon';
import AnimatedFeedback from './AnimatedFeedback';
import ShowDetailsButton from './ShowDetailsButton';
import { getTotalDistance, getZones, isCallAgencyLeg, isBoardableLeg } from '../../utils/legUtils';
import { dateOrEmpty, isTomorrow, timeStr } from '../../utils/timeUtils';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';
import getCo2Value from '../../utils/emissions';
import { ItineraryFragment } from './queries/ItineraryFragment';
import { getTicketString } from '../../utils/fareUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import FirstLegStartTime from './FirstLegStartTime';
import { getItineraryScreenReaderText } from './itineraryUtils';
import { getLegStripModel, formatVehicleNames } from './legStripModel';
import useItineraryNavigation from './useItineraryNavigation';
import useOverflowDetection from './useOverflowDetection';
import TimeRow from './TimeRow';
import LegStrip from './LegStrip';
import RentalDurationWarning from './RentalDurationWarning';

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
    items,
    iconLegsInPixels,
    compressedLegs,
    containsScooterLeg,
    vehicles,
    stopNames,
    rental,
  } = getLegStripModel({ itinerary, intermediatePlaces, config, breakpoint, duration });
  const vehicleNames = formatVehicleNames(formatMessage, vehicles);
  const hasCallAgencyLeg = itinerary.legs.some(leg => isCallAgencyLeg(leg));

  const firstDeparture = compressedLegs.find(leg =>
    isBoardableLeg(leg, config.taxiZone.allowedRouteTypes),
  );

  const ariaLabelMessage = intl.formatMessage(
    { id: 'itinerary-page.show-details-label' },
    { number: props.hash + 1 },
  );

  const dateString = dateOrEmpty(startTime, refTime);
  const startDate = isTomorrow(startTime, refTime) ? (
    <div className="tomorrow">
      <FormattedMessage id="tomorrow" />
    </div>
  ) : (
    dateString && (
      <>
        {dateString} <FormattedMessage id="at-time" />
      </>
    )
  );
  const showCo2Info = config.showCO2InItinerarySummary && co2value !== null && !containsScooterLeg;

  const screenReaderText = getItineraryScreenReaderText(intl, {
    rowNumber: props.hash + 1,
    co2value: showCo2Info ? co2value : null,
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

  const { overflowRef, showOverflowIcon } = useOverflowDetection();

  return (
    <div
      role="listitem"
      className={cx([
        'itinerary-summary-row',
        { passive, 'bp-large': breakpoint === 'large', 'no-border': hideSelectionIndicator },
      ])}
      aria-atomic="true"
    >
      <div className="sr-only">{screenReaderText}</div>
      <div
        className="itinerary-summary-visible"
        style={{ display: 'flex' }}
        data-ticket-type={`${getTicketString(itinerary.legs, getZones(itinerary.legs), config)}`}
      >
        {/* This next clickable region does not have proper accessible role, tabindex and keyboard handler
            because screen reader works weirdly with nested buttons. Same functonality works from the inner button */}
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
                <TimeRow
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
                </TimeRow>
              </div>
              <LegStrip
                ref={overflowRef}
                items={items}
                showOverflowIcon={showOverflowIcon}
                iconLegsInPixels={iconLegsInPixels}
              />
              <FirstLegStartTime
                firstDeparture={firstDeparture}
                hasCallAgencyLeg={hasCallAgencyLeg}
                breakpoint={breakpoint}
                stopNames={stopNames}
              />
              {rental.networkCount > 0 && (
                <RentalDurationWarning
                  network={rental.network}
                  networkCount={rental.networkCount}
                  icon={rental.icon}
                />
              )}
            </div>
            {props.giveFeedback && props.recommended && (
              <AnimatedFeedback
                recommended={props.recommended}
                feedback={props.feedback}
                giveFeedback={props.giveFeedback}
              />
            )}
            <div className="summary-separator" />
          </div>
          {!mobile(breakpoint) && (
            <ShowDetailsButton ariaLabel={ariaLabelMessage} onClick={onSelectImmediately} />
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

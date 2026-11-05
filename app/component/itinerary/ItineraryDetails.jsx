import cx from 'classnames';
import { useRouter } from 'found';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFragment } from 'react-relay';
import {
  getFaresFromLegs,
  shouldShowMobilePurchaseInfo,
} from '../../../utils/client/fareUtils';
import {
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalDrivingDistance,
  getTotalDrivingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  hasScooterLegs,
  legTimeStr,
} from '../../../utils/client/legUtils';
import { itineraryShape, relayShape } from '../../../utils/client/shapes';
import { getFutureText } from '../../../utils/client/timeUtils';
import { BreakpointConsumer } from '../../hooks/BreakpointContext';
import {
  getItineraryDisplayFlags,
  getSettings,
} from '../../../utils/client/planParamUtil';
import BackButton from '../BackButton';
import Emissions from './Emissions';
import EmissionsInfo from './EmissionsInfo';
import Feedback from './Feedback';
import ItinerarySummary from './ItinerarySummary';
import ItineraryDisclaimers from './ItineraryDisclaimers';
import Legs from './Legs';
import StartNavi from './StartNavi';
import VehicleRentalDurationInfo from './VehicleRentalDurationInfo';
import { ItineraryDetailsFragment } from './queries/ItineraryDetailsFragment';
import { useConfigContext } from '../../hooks/ConfigContext';
import { FareInfo } from './FareInfo';
import {
  getBoardingInformationFlags,
  shouldShowStartNavigation,
} from './itineraryDetailsUtils';

function getExtraProps(itinerary, intl, compressedLegs) {
  const compressedItinerary = {
    ...itinerary,
    legs: compressedLegs,
  };
  const walkingDistance = getTotalWalkingDistance(compressedItinerary);
  const walkingDuration = getTotalWalkingDuration(compressedItinerary);
  const bikingDistance = getTotalBikingDistance(compressedItinerary);
  const bikingDuration = getTotalBikingDuration(compressedItinerary);
  const drivingDuration = getTotalDrivingDuration(compressedItinerary);
  const drivingDistance = getTotalDrivingDistance(compressedItinerary);
  const futureText = getFutureText(itinerary.start, intl);
  const isMultiRow =
    walkingDistance > 0 &&
    (bikingDistance > 0 || drivingDistance > 0) &&
    futureText !== '';
  return {
    walking: {
      duration: walkingDuration,
      distance: walkingDistance,
    },
    biking: {
      duration: bikingDuration,
      distance: bikingDistance,
    },
    driving: {
      duration: drivingDuration,
      distance: drivingDistance,
    },
    futureText,
    isMultiRow,
  };
}

export default function ItineraryDetails({
  itinerary: itineraryRef,
  focusToPoint,
  focusToLeg,
  isMobile,
  tabIndex,
  hideTitle = false,
  carEmissions,
  changeHash = () => {},
  openSettings,
  startNavigation,
  bikePublicItineraryCount = 0,
  carPublicItineraryCount = 0,
  relayEnvironment,
  recommended = false,
  feedback,
  giveFeedback,
}) {
  const itinerary = useFragment(ItineraryDetailsFragment, itineraryRef);
  const { match } = useRouter();
  const config = useConfigContext();
  const { language } = config;
  const intl = useIntl();
  if (!itinerary?.legs[0]) {
    return null;
  }

  const settings = getSettings(config);
  const { shouldShowDisclaimer, shouldShowFeedback } = getItineraryDisplayFlags(
    {
      config,
      legs: itinerary.legs,
      hash: match.params.hash,
      settings,
    },
  );

  const fares = getFaresFromLegs(itinerary.legs, config);
  const compressedLegs = compressLegs(itinerary.legs);
  const extraProps = getExtraProps(itinerary, intl, compressedLegs);
  const { biking, walking, driving, futureText, isMultiRow } = extraProps;
  // This does not take into account if the user is using a car at the time of using transit,
  // instead this just calculates if the car is used for the whole trip.
  // A smarter approach would be to store the current personal mode of transport (walk, bike, car)
  // this could then be used to set the waiting icon legs that need it.
  const usingOwnCarWholeTrip =
    walking.distance === 0 && biking.distance === 0 && driving.distance > 0;
  const hasLegsWithScooter = hasScooterLegs({ legs: compressedLegs });
  const showEmissions = config.showCO2InItinerarySummary && !hasLegsWithScooter;
  const showStartNavi = shouldShowStartNavigation({
    startNavigation,
    legs: compressedLegs,
    drivingDistance: driving.distance,
  });
  const { showBikeBoardingInformation, showCarBoardingInformation } =
    getBoardingInformationFlags({
      legs: compressedLegs,
      biking,
      driving,
      bikePublicItineraryCount,
      carPublicItineraryCount,
    });
  let itineraryIndex = match.params.secondHash
    ? Number(match.params.secondHash)
    : Number(match.params.hash);
  if (Number.isNaN(itineraryIndex)) {
    itineraryIndex = 1;
  } else {
    itineraryIndex += 1;
  }
  return (
    <div className="itinerary-tab">
      <h2 className="sr-only">
        <FormattedMessage
          id="summary-page.row-label"
          values={{
            number: itineraryIndex,
          }}
        />
        <FormattedMessage id="leaves">
          {msg => (
            <span id={`tab-${tabIndex}-context`}>{`, ${msg} ${legTimeStr(
              itinerary.legs[0].start,
            )}.`}</span>
          )}
        </FormattedMessage>
      </h2>
      <BreakpointConsumer>
        {breakpoint => [
          breakpoint === 'large' && !hideTitle && (
            <div className="desktop-title" key="header">
              <BackButton
                title={
                  <FormattedMessage
                    id="itinerary-page.title"
                    defaultMessage="Itinerary suggestions"
                  />
                }
                fallback="pop"
              />
            </div>
          ),
          <ItinerarySummary
            itinerary={itinerary}
            key="summary"
            walking={walking}
            biking={biking}
            driving={driving}
            futureText={futureText}
            isMultiRow={isMultiRow}
            isMobile={isMobile}
            hideBottomDivider={shouldShowMobilePurchaseInfo(
              config,
              itinerary.legs,
              fares,
              isMobile,
            )}
          />,
          <VehicleRentalDurationInfo
            key="rentaldurationinfo"
            legs={compressedLegs}
            config={config}
          />,
          <FareInfo
            key="fareinfo"
            config={config}
            legs={itinerary.legs}
            fares={fares}
            isMobile={isMobile}
          />,
          showStartNavi && (
            <StartNavi key="navigation" startNavigation={startNavigation} />
          ),
          showEmissions && (
            <EmissionsInfo
              key="emissionsummary"
              itinerary={itinerary}
              isMobile={isMobile}
            />
          ),
          <div
            className={cx('momentum-scroll itinerary-tabs__scroll', {
              multirow: isMultiRow,
            })}
            key="legs"
          >
            <div
              className={cx('itinerary-main', {
                'bp-large': breakpoint === 'large',
              })}
              key="legwrapper"
            >
              <ItineraryDisclaimers
                legs={itinerary.legs}
                compressedLegs={compressedLegs}
                fares={fares}
              />
              <Legs
                key="itinerarylegs"
                fares={fares}
                itinerary={itinerary}
                focusToPoint={focusToPoint}
                focusToLeg={focusToLeg}
                changeHash={changeHash}
                tabIndex={tabIndex}
                openSettings={openSettings}
                showBikeBoardingInformation={showBikeBoardingInformation}
                showCarBoardingInformation={showCarBoardingInformation}
                usingOwnCarWholeTrip={usingOwnCarWholeTrip}
                relayEnvironment={relayEnvironment}
              />
            </div>
            {showEmissions && (
              <Emissions
                key="emissionsinfo"
                config={config}
                itinerary={itinerary}
                carEmissions={carEmissions}
                emissionsInfolink={config.URL.EMISSIONS_INFO?.[language]}
              />
            )}
            {shouldShowDisclaimer && (
              <div className="itinerary-disclaimer" key="disclaimer">
                <FormattedMessage
                  id="disclaimer"
                  defaultMessage="Results are based on estimated travel times"
                />
              </div>
            )}
            {shouldShowFeedback && (
              <div className="itinerary-disclaimer" key="feedback">
                <div className="separator" />
                <div className="itinerary-empty-space" />
                <Feedback
                  recommended={recommended}
                  feedback={feedback}
                  giveFeedback={giveFeedback}
                />
              </div>
            )}
            <div className="itinerary-empty-space" key="emptyspace" />
          </div>,
        ]}
      </BreakpointConsumer>
    </div>
  );
}

ItineraryDetails.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  tabIndex: PropTypes.number.isRequired,
  hideTitle: PropTypes.bool,
  carEmissions: PropTypes.number,
  changeHash: PropTypes.func,
  openSettings: PropTypes.func.isRequired,
  startNavigation: PropTypes.func,
  bikePublicItineraryCount: PropTypes.number,
  carPublicItineraryCount: PropTypes.number,
  relayEnvironment: relayShape,
  recommended: PropTypes.bool,
  feedback: PropTypes.bool,
  giveFeedback: PropTypes.func,
};

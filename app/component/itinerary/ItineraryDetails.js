import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape } from 'found';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { useFragment } from 'react-relay';
import { getRouteMode } from '../../util/modeUtils';
import {
  getFaresFromLegs,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../../util/fareUtils';
import localizedUrl from '../../util/urlUtils';
import {
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalDrivingDistance,
  getTotalDrivingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  getZones,
  isCallAgencyLeg,
  legContainsBikePark,
  legContainsRentalBike,
  legTimeStr,
} from '../../util/legUtils';
import { streetHash } from '../../util/path';
import { configShape, itineraryShape, relayShape } from '../../util/shapes';
import { getFutureText } from '../../util/timeUtils';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import BackButton from '../BackButton';
import Emissions from './Emissions';
import EmissionsInfo from './EmissionsInfo';
import FareDisclaimer from './FareDisclaimer';
import RouteDisclaimer from './RouteDisclaimer';
import ItinerarySummary from './ItinerarySummary';
import Legs from './Legs';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import StartNavi from './StartNavi';
import TicketInformation from './TicketInformation';
import VehicleRentalDurationInfo from './VehicleRentalDurationInfo';
import { ItineraryDetailsFragment } from './queries/ItineraryDetailsFragment';

function getExtraProps(itinerary, intl) {
  const compressedItinerary = {
    ...itinerary,
    legs: compressLegs(itinerary.legs),
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

function ItineraryDetails(
  {
    itinerary: itineraryRef,
    focusToPoint,
    focusToLeg,
    isMobile,
    tabIndex,
    hideTitle,
    carEmissions,
    currentLanguage,
    changeHash,
    openSettings,
    startNavigation,
    bikePublicItineraryCount,
    carPublicItineraryCount,
    relayEnvironment,
  },
  { config, match, intl },
) {
  const itinerary = useFragment(ItineraryDetailsFragment, itineraryRef);

  const shouldShowDisclaimer =
    config.showDisclaimer &&
    match.params.hash !== streetHash.walk &&
    match.params.hash !== streetHash.bike;

  if (!itinerary?.legs[0]) {
    return null;
  }
  const fares = getFaresFromLegs(itinerary.legs, config);
  const extraProps = getExtraProps(itinerary, intl);
  const { biking, walking, driving, futureText, isMultiRow } = extraProps;
  // This does not take into account if the user is using a car at the time of using transit,
  // instead this just calculates if the car is used for the whole trip.
  // A smarter approach would be to store the current personal mode of transport (walk, bike, car)
  // this could then be used to set the waiting icon legs that need it.
  const usingOwnCarWholeTrip =
    walking.distance === 0 && biking.distance === 0 && driving.distance > 0;
  const compressedLegs = compressLegs(itinerary.legs);
  const legsWithRentalBike = compressedLegs.filter(leg =>
    legContainsRentalBike(leg),
  );
  const legswithBikePark = compressedLegs.filter(leg =>
    legContainsBikePark(leg),
  );
  const legsWithScooter = compressedLegs.some(leg => leg.mode === 'SCOOTER');
  const legsWithAirplane = compressedLegs.some(leg => leg.mode === 'AIRPLANE');
  const onlyWalking = compressedLegs.every(leg => leg.mode === 'WALK');
  const onlyBiking = compressedLegs.every(leg => leg.mode === 'BICYCLE');
  const showStartNavi =
    startNavigation &&
    !onlyWalking &&
    !onlyBiking &&
    !legsWithScooter &&
    !legsWithAirplane &&
    legsWithRentalBike.length === 0 &&
    driving.distance === 0;
  const containsBiking = biking.duration > 0 && biking.distance > 0;
  const showBikeBoardingInformation =
    containsBiking &&
    bikePublicItineraryCount > 0 &&
    legswithBikePark.length === 0;
  const containsDriving = driving.duration > 0 && driving.distance > 0;
  const showCarBoardingInformation =
    containsDriving && carPublicItineraryCount > 0;
  const rentalBikeNetworks = new Set();
  let showRentalBikeDurationWarning = false;
  if (legsWithRentalBike.length > 0) {
    for (let i = 0; i < legsWithRentalBike.length; i++) {
      const leg = legsWithRentalBike[i];
      const network = leg.from.vehicleRentalStation?.rentalNetwork.networkId;
      if (
        config.vehicleRental.networks[network]?.timeBeforeSurcharge &&
        config.vehicleRental.networks[network]?.durationInstructions
      ) {
        const rentDurationOverSurchargeLimit =
          leg.duration >
          config.vehicleRental.networks[network].timeBeforeSurcharge;
        if (rentDurationOverSurchargeLimit) {
          rentalBikeNetworks.add(network);
          showRentalBikeDurationWarning =
            rentDurationOverSurchargeLimit || showRentalBikeDurationWarning;
        }
      }
    }
  }
  let itineraryIndex = match.params.secondHash
    ? Number(match.params.secondHash)
    : Number(match.params.hash);
  if (Number.isNaN(itineraryIndex)) {
    itineraryIndex = 1;
  } else {
    itineraryIndex += 1;
  }
  const disclaimers = [];
  const externalOperatorJourneys = legsWithScooter;
  if (
    shouldShowFareInfo(config) &&
    (fares.some(fare => fare.isUnknown) || externalOperatorJourneys)
  ) {
    const found = {};
    itinerary.legs.forEach(leg => {
      if (config.modeDisclaimers?.[leg.mode] && !found[leg.mode]) {
        found[leg.mode] = true;
        const disclaimer = config.modeDisclaimers[leg.mode][currentLanguage];
        disclaimers.push(
          <FareDisclaimer
            key={leg.mode}
            text={disclaimer.disclaimer}
            href={disclaimer.link}
            linkText={disclaimer.text}
          />,
        );
      }
    });

    const info = config.callAgencyInfo?.[currentLanguage];
    if (info && itinerary.legs.some(leg => isCallAgencyLeg(leg))) {
      disclaimers.push(
        <FareDisclaimer
          key={disclaimers.length}
          textId="separate-ticket-required-for-call-agency-disclaimer"
          href={info.callAgencyInfoLink}
          linkText={info.callAgencyInfoLinkText}
        />,
      );
    }

    if (!disclaimers.length) {
      disclaimers.push(
        <FareDisclaimer
          key="faredisclaimer-separate-ticket-key"
          textId="separate-ticket-required-disclaimer"
          values={{
            agencyName:
              typeof config.primaryAgencyName === 'string'
                ? config.primaryAgencyName
                : config.primaryAgencyName?.[currentLanguage],
          }}
        />,
      );
    }
  }

  if (config.replacementBusNotification) {
    itinerary.legs.forEach(({ route, trip }) => {
      const isReplacementRoute =
        route &&
        (getRouteMode(route, config)?.includes('replacement') ||
          config.replacementBusRoutes?.includes(route.gtfsId));
      const isReplacementTrip =
        trip?.submode?.includes('replacement') || trip?.submode?.includes(714);

      if (isReplacementRoute || isReplacementTrip) {
        const notification =
          isReplacementRoute &&
          config.showRouteDescNotification &&
          route.desc?.length
            ? { content: route.desc, link: route.url }
            : config.replacementBusNotification;
        const notificationText =
          notification.content?.[currentLanguage]?.join(' ');
        const key = `replacementBusNotification-${
          route.gtfsId || trip?.gtfsId
        }`;
        if (!disclaimers.some(d => d.props?.text === notificationText)) {
          disclaimers.push(
            <RouteDisclaimer
              key={key}
              text={notificationText}
              href={notification.link?.[currentLanguage]}
              linkText={intl.formatMessage({ id: 'extra-info' })}
              header={intl.formatMessage({ id: 'replacement-bus' })}
            />,
          );
        }
      }
    });
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
              <div className="title-container h2">
                <BackButton
                  title={
                    <FormattedMessage
                      id="itinerary-page.title"
                      defaultMessage="Itinerary suggestions"
                    />
                  }
                  icon="icon_arrow-collapse--left"
                  iconClassName="arrow-icon"
                  fallback="pop"
                />
              </div>
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
            hideBottomDivider={
              isMobile && shouldShowFarePurchaseInfo(config, breakpoint, fares)
            }
          />,
          showRentalBikeDurationWarning && (
            <VehicleRentalDurationInfo
              key="rentaldurationinfo"
              networks={Array.from(rentalBikeNetworks)}
              config={config}
            />
          ),
          shouldShowFareInfo(config, itinerary.legs) &&
            (shouldShowFarePurchaseInfo(config, breakpoint, fares) ? (
              <MobileTicketPurchaseInformation
                key="mobileticketpurchaseinformation"
                fares={fares}
                zones={getZones(itinerary.legs)}
              />
            ) : (
              <TicketInformation
                key="ticketinformation"
                fares={fares}
                zones={getZones(itinerary.legs)}
                legs={itinerary.legs}
                ticketLink={localizedUrl(config.ticketLink, currentLanguage)}
              />
            )),

          showStartNavi && (
            <StartNavi key="navigation" startNavigation={startNavigation} />
          ),
          config.showCO2InItinerarySummary && !legsWithScooter && (
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
              {disclaimers}
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
            {config.showCO2InItinerarySummary && !legsWithScooter && (
              <Emissions
                key="emissionsinfo"
                config={config}
                itinerary={itinerary}
                carEmissions={carEmissions}
                emissionsInfolink={config.URL.EMISSIONS_INFO?.[currentLanguage]}
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
  currentLanguage: PropTypes.string,
  changeHash: PropTypes.func,
  openSettings: PropTypes.func.isRequired,
  startNavigation: PropTypes.func,
  bikePublicItineraryCount: PropTypes.number,
  carPublicItineraryCount: PropTypes.number,
  relayEnvironment: relayShape,
};

ItineraryDetails.defaultProps = {
  hideTitle: false,
  currentLanguage: 'fi',
  changeHash: () => {},
  bikePublicItineraryCount: 0,
  carPublicItineraryCount: 0,
  carEmissions: undefined,
  relayEnvironment: undefined,
  startNavigation: undefined,
};

ItineraryDetails.contextTypes = {
  config: configShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
  getStore: PropTypes.func.isRequired,
};

const connectedComponent = connectToStores(
  ItineraryDetails,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { ItineraryDetails as Component, connectedComponent as default };

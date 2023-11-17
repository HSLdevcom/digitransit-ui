import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import ItineraryLegs from './ItineraryLegs';
import BackButton from './BackButton';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import {
  compressLegs,
  getRoutes,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalDrivingDistance,
  getTotalDrivingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  getZones,
  isCallAgencyPickupType,
  legContainsRentalBike,
} from '../util/legUtils';
import { BreakpointConsumer } from '../util/withBreakpoint';

import {
  getFares,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  getCurrentMillis,
  getFormattedTimeDate,
  isToday,
  isTomorrow,
} from '../util/timeUtils';
import CityBikeDurationInfo from './CityBikeDurationInfo';
import { getCityBikeNetworkId } from '../util/citybikes';
import { FareShape } from '../util/shapes';
import FareDisclaimer from './FareDisclaimer';

const AlertShape = PropTypes.shape({ alertSeverityLevel: PropTypes.string });

const RouteShape = PropTypes.shape({
  alerts: PropTypes.arrayOf(AlertShape),
});

const TripShape = PropTypes.shape({
  pattern: PropTypes.shape({
    code: PropTypes.string,
  }),
});

const ItineraryShape = PropTypes.shape({
  legs: PropTypes.arrayOf(
    PropTypes.shape({
      route: RouteShape,
      trip: TripShape,
      distance: PropTypes.number,
      fares: PropTypes.arrayOf(FareShape),
    }),
  ),
  fares: PropTypes.arrayOf(FareShape),
});

/* eslint-disable prettier/prettier */
class ItineraryTab extends React.Component {
  static propTypes = {
    plan: PropTypes.shape({
      date: PropTypes.number.isRequired,
    }).isRequired,
    itinerary: ItineraryShape.isRequired,
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    currentTime: PropTypes.number.isRequired,
    hideTitle: PropTypes.bool,
    currentLanguage: PropTypes.string,
    changeHash: PropTypes.func,
  };

  static defaultProps = {
    hideTitle: false,
    currentLanguage: 'fi',
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  handleFocus = (lat, lon) => {
    this.props.focusToPoint(lat, lon);
  };

  shouldShowDisclaimer = config => {
    return (
      config.showDisclaimer &&
      this.context.match.params.hash !== 'walk' &&
      this.context.match.params.hash !== 'bike'
    );
  };

  printItinerary = e => {
    e.stopPropagation();

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'Print',
      name: null,
    });

    const printPath = `${this.context.match.location.pathname}/tulosta`;
    this.context.router.push({
      ...this.context.match.location,
      pathname: printPath,
    });
  };

  getFutureText = (startTime, currentTime) => {
    const refTime = getCurrentMillis(currentTime);
    if (isToday(startTime, refTime)) {
      return '';
    }
    if (isTomorrow(startTime, refTime)) {
      return this.context.intl.formatMessage({
        id: 'tomorrow',
      });
    }
    return getFormattedTimeDate(startTime, 'dd D.M.');
  };

  setExtraProps = itinerary => {
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
    const futureText = this.getFutureText(
      itinerary.startTime,
      this.props.currentTime,
    );
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
  };

  render() {
    const { itinerary, currentLanguage } = this.props;
    const { config } = this.context;

    if (!itinerary || !itinerary.legs[0]) {
      return null;
    }

    const fares = getFares(itinerary.fares, getRoutes(itinerary.legs), config);
    const extraProps = this.setExtraProps(itinerary);
    const legsWithRentalBike = compressLegs(itinerary.legs).filter(leg =>
      legContainsRentalBike(leg),
    );
    const rentalBikeNetworks = new Set();
    let showRentalBikeDurationWarning = false;
    if (legsWithRentalBike.length > 0) {
      for (let i = 0; i < legsWithRentalBike.length; i++) {
        const leg = legsWithRentalBike[i];
        const network = getCityBikeNetworkId(
          leg.from.bikeRentalStation?.networks,
        );
        if (
          config.cityBike.networks[network]?.timeBeforeSurcharge &&
          config.cityBike.networks[network]?.durationInstructions
        ) {
          const rentDurationOverSurchargeLimit =
            leg.duration >
            config.cityBike.networks[network].timeBeforeSurcharge;
          if (rentDurationOverSurchargeLimit) {
            rentalBikeNetworks.add(network);
            showRentalBikeDurationWarning =
              rentDurationOverSurchargeLimit || showRentalBikeDurationWarning;
          }
        }
      }
    }
    const suggestionIndex = this.context.match.params.secondHash
      ? Number(this.context.match.params.secondHash) + 1
      : Number(this.context.match.params.hash) + 1;
    const itineraryContainsCallLegs = itinerary.legs.some(leg =>
      isCallAgencyPickupType(leg),
    );

    const showCallAgencyDisclaimer =
      config.callAgencyInfo && itineraryContainsCallLegs;

    const showLegModeDisclaimer = itinerary.legs.some(leg => {
      return !!(config.modeDisclaimers && config.modeDisclaimers[leg.mode]);
    });

    const disclaimers = [];
    const uniqueMessages = new Set();

    function pushUniqueMessage(message) {
      if (!uniqueMessages.has(JSON.stringify(message))) {
        disclaimers.push(message);
        uniqueMessages.add(JSON.stringify(message));
      }
    }

    itinerary.legs.forEach(leg => {
      if (config.modeDisclaimers && config.modeDisclaimers[leg.mode]) {
        const message = {
          textId: 'train-ticket-limited',
          values: 'appBarLink.name',
          href: config.modeDisclaimers[leg.mode][currentLanguage].link,
          linkText: config.modeDisclaimers[leg.mode][currentLanguage].link,
        };
        pushUniqueMessage(message);
      }

      if (showCallAgencyDisclaimer) {
        const message = {
          textId: 'separate-ticket-required-for-call-agency-disclaimer',
          values: `callAgencyInfo.${currentLanguage}.callAgencyInfoLink`,
          href: config.callAgencyInfo[currentLanguage].callAgencyInfoLink,
          linkText:
            config.callAgencyInfo[currentLanguage].callAgencyInfoLinkText,
        };
        pushUniqueMessage(message);
      }

      if (!showLegModeDisclaimer && !showCallAgencyDisclaimer) {
        const message = {
          textId: 'separate-ticket-required-disclaimer',
          values: 'ticketInformation.primaryAgencyName',
          href: null,
          linkText: null,
        };
        pushUniqueMessage(message);
      }
    });

    return (
      <div className="itinerary-tab">
        <h2 className="sr-only">
          <FormattedMessage
            id="summary-page.row-label"
            values={{
              number: suggestionIndex,
            }}
          />
        </h2>
        <BreakpointConsumer>
          {breakpoint => [
            breakpoint !== 'large' ? (
              <ItinerarySummary
                itinerary={itinerary}
                key="summary"
                walking={extraProps.walking}
                biking={extraProps.biking}
                driving={extraProps.driving}
                futureText={extraProps.futureText}
                isMultiRow={extraProps.isMultiRow}
                isMobile={this.props.isMobile}
                hideBottomDivider={shouldShowFarePurchaseInfo(
                  config,
                  breakpoint,
                  fares,
                )}
              />
            ) : (
              <>
                {!this.props.hideTitle && (
                  <div className="desktop-title" key="header">
                    <div className="title-container h2">
                      <BackButton
                        title={
                          <FormattedMessage
                            id="itinerary-page.title"
                            defaultMessage="Itinerary suggestions"
                          />
                        }
                        icon="icon-icon_arrow-collapse--left"
                        iconClassName="arrow-icon"
                        fallback="pop"
                      />
                    </div>
                  </div>
                )}
                <div className="itinerary-summary-container">
                  <ItinerarySummary
                    itinerary={itinerary}
                    key="summary"
                    walking={extraProps.walking}
                    biking={extraProps.biking}
                    driving={extraProps.driving}
                    futureText={extraProps.futureText}
                    isMultiRow={extraProps.isMultiRow}
                    isMobile={this.props.isMobile}
                  />
                </div>
              </>
            ),
            showRentalBikeDurationWarning && (
              <CityBikeDurationInfo
                networks={Array.from(rentalBikeNetworks)}
                config={config}
              />
            ),
            shouldShowFareInfo(config) &&
              (shouldShowFarePurchaseInfo(config, breakpoint, fares) ? (
                <MobileTicketPurchaseInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                />
              ) : (
                <TicketInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                  legs={itinerary.legs}
                />
              )),
            <div
              className={cx('momentum-scroll itinerary-tabs__scroll', {
                multirow: extraProps.isMultiRow,
              })}
              key="legs"
            >
              <div
                className={cx('itinerary-main', {
                  'bp-large': breakpoint === 'large',
                })}
              >
                {shouldShowFareInfo(config) &&
                  fares.some(fare => fare.isUnknown) &&
                  disclaimers.map((disclaimer, index) => (
                    <FareDisclaimer
                      /* eslint-disable-next-line react/no-array-index-key */
                      key={index}
                      textId={disclaimer.textId}
                      values={disclaimer.values}
                      href={disclaimer.href}
                      linkText={disclaimer.linkText}
                    />
                  ))}
                <ItineraryLegs
                  fares={fares}
                  itinerary={itinerary}
                  focusToPoint={this.handleFocus}
                  focusToLeg={this.props.focusToLeg}
                  changeHash={this.props.changeHash}
                  tabIndex={suggestionIndex - 1}
                />
                {config.showRouteInformation && <RouteInformation />}
              </div>
              {this.shouldShowDisclaimer(config) && (
                <div className="itinerary-disclaimer">
                  <FormattedMessage
                    id="disclaimer"
                    defaultMessage="Results are based on estimated travel times"
                  />
                </div>
              )}
              <div className="itinerary-empty-space" />
            </div>,
          ]}
        </BreakpointConsumer>
      </div>
    );
  }
}

const withRelay = createFragmentContainer(
  connectToStores(ItineraryTab, ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  })),
  {
    plan: graphql`
      fragment ItineraryTab_plan on Plan {
        date
      }
    `,
    itinerary: graphql`
      fragment ItineraryTab_itinerary on Itinerary {
        walkDistance
        duration
        startTime
        endTime
        fares {
          cents
          components {
            cents
            fareId
            routes {
              agency {
                gtfsId
                fareUrl
                name
              }
              gtfsId
            }
          }
          type
        }
        legs {
          mode
          nextLegs(
            numberOfLegs: 2
            originModesWithParentStation: [RAIL]
            destinationModesWithParentStation: [RAIL]
          ) {
            mode
            distance
            route {
              alerts {
                alertSeverityLevel
              }
              shortName
              mode
              type
              gtfsId
              color
            }
            from {
              stop {
                platformCode
                alerts {
                  alertSeverityLevel
                }
              }
            }
            to {
              stop {
                alerts {
                  alertSeverityLevel
                }
              }
            }
            startTime
            trip {
              tripHeadsign
              pattern {
                code
              }
              occupancy {
                occupancyStatus
              }
              gtfsId
            }
            realTime
          }
          ...LegAgencyInfo_leg
          from {
            lat
            lon
            name
            vertexType
            bikePark {
              bikeParkId
              name
            }
            bikeRentalStation {
              networks
              bikesAvailable
              lat
              lon
              stationId
            }
            stop {
              gtfsId
              code
              platformCode
              vehicleMode
              zoneId
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                alertHeaderText
                alertDescriptionText
                entities {
                  __typename
                  ... on Stop {
                    gtfsId
                  }
                }
              }
            }
          }
          to {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              lat
              lon
              stationId
              networks
              bikesAvailable
            }
            stop {
              gtfsId
              code
              platformCode
              zoneId
              name
              vehicleMode
              alerts {
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                alertHeaderText
                alertDescriptionText
                entities {
                  __typename
                  ... on Stop {
                    gtfsId
                  }
                }
              }
            }
            bikePark {
              bikeParkId
              name
            }
            carPark {
              carParkId
              name
            }
          }
          legGeometry {
            length
            points
          }
          intermediatePlaces {
            arrivalTime
            stop {
              gtfsId
              lat
              lon
              name
              code
              platformCode
              zoneId
            }
          }
          realTime
          realtimeState
          transitLeg
          rentedBike
          startTime
          endTime
          mode
          interlineWithPreviousLeg
          distance
          duration
          intermediatePlace
          route {
            shortName
            color
            gtfsId
            type
            longName
            desc
            agency {
              gtfsId
              fareUrl
              name
              phone
            }
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              alertHeaderText
              alertDescriptionText
              entities {
                __typename
                ... on Route {
                  gtfsId
                }
              }
            }
          }
          trip {
            gtfsId
            tripHeadsign
            pattern {
              code
            }
            stoptimesForDate {
              headsign
              pickupType
              realtimeState
              stop {
                gtfsId
              }
            }
            occupancy {
              occupancyStatus
            }
          }
        }
      }
    `,
  },
);

export { ItineraryTab as Component, withRelay as default };

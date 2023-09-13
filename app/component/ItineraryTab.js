import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Link from 'found/Link';
import Icon from './Icon';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import ItineraryLegs from './ItineraryLegs';
import BackButton from './BackButton';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import {
  getRoutes,
  getZones,
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  legContainsRentalBike,
  getTotalDrivingDuration,
  getTotalDrivingDistance,
} from '../util/legUtils';
import { BreakpointConsumer } from '../util/withBreakpoint';

import {
  getFares,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  isToday,
  isTomorrow,
  getFormattedTimeDate,
  getCurrentMillis,
} from '../util/timeUtils';
import CityBikeDurationInfo from './CityBikeDurationInfo';
import { getCityBikeNetworkId } from '../util/citybikes';
import { FareShape } from '../util/shapes';

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
  emissions: PropTypes.number,
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
    lang: PropTypes.string.isRequired,
    hideTitle: PropTypes.bool,
    carItinerary: PropTypes.array,
  };

  static defaultProps = {
    hideTitle: false,
    carItinerary: [],
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
    const extraProps = {
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
    return extraProps;
  };

  render() {
    const { itinerary } = this.props;
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
    const co2value = itinerary.emissions ? Math.round(itinerary.emissions) : 0;
    const carCo2Value = this.props.carItinerary && this.props.carItinerary.length > 0 ? Math.round(this.props.carItinerary[0].emissions) : 0;
    const co2percentage = co2value > 0 && carCo2Value > 0 ? Math.round((co2value / carCo2Value) * 100) : 0;
    const co2SimpleDesc = co2percentage === 0 && carCo2Value === 0;

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
		hideBottomDivider={shouldShowFarePurchaseInfo(config,breakpoint,fares)}
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
            shouldShowFareInfo(config) && (
              shouldShowFarePurchaseInfo(config,breakpoint,fares) ? (
                <MobileTicketPurchaseInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                />) :
            (  <TicketInformation
                  fares={fares}
                  zones={getZones(itinerary.legs)}
                  legs={itinerary.legs}
                />)
            ),
            config.showCO2InItinerarySummary && co2value >= 0 && (
              <div className={cx("itinerary-co2-information",{ mobile: this.props.isMobile})}>
                <div className="itinerary-co2-line">
                  <div className={cx("co2-container",{mobile: this.props.isMobile})}>
                    <div className="co2-title-container">
                      <Icon img="icon-icon_co2_leaf" className="co2-leaf" />
                      <span className="itinerary-co2-title">
                        <FormattedMessage
                          id="itinerary-co2.title"
                          defaultMessage="CO2 emissions for this route"
                        />
                      </span>
                    </div>
                    <div className="itinerary-co2-value-container">
                      <div className="itinerary-co2-value">{co2value} g</div>
                    </div>
                  </div>
                </div>
              </div>
            ),
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
                  fares.some(fare => fare.isUnknown) && (
                    <div className="disclaimer-container unknown-fare-disclaimer__top">
                      <div className="icon-container">
                        <Icon className="info" img="icon-icon_info" />
                      </div>
                      <div className="description-container">
                        <FormattedMessage
                          id="separate-ticket-required-disclaimer"
                          values={{
                            agencyName: get(
                              config,
                              'ticketInformation.primaryAgencyName',
                            ),
                          }}
                        />
                      </div>
                    </div>
                  )}
                <ItineraryLegs
                  fares={fares}
                  itinerary={itinerary}
                  focusToPoint={this.handleFocus}
                  focusToLeg={this.props.focusToLeg}
                />
                {config.showRouteInformation && <RouteInformation />}
              </div>
              {config.showCO2InItinerarySummary && co2value >= 0 ? (
                <div className="itinerary-co2-comparison">
                  <div className="itinerary-co2-line">
                    <div className={cx('divider-top')} />
                    <div className="co2-container">
                      <div className="co2-description-container">
                        <Icon img="icon-icon_co2_leaf" className="co2-leaf" />
                        <span className={cx("itinerary-co2-description", {simple: co2SimpleDesc})}>
 {                       carCo2Value >= 0 && co2percentage >= 0 ? ( <FormattedMessage
                            id="itinerary-co2.description"
                            defaultMessage="CO2 emissions for this route"
                            values={{
                              co2value,
                              co2percentage,
                            }}
                          />):
                              <FormattedMessage id="itinerary-co2.description-simple"
                                defaultMessage="CO2 emissions for this route2"
                                values={{
                                  co2value,
                                }}
                          />}
                          {config.URL.EMISSIONSINFO && (
                            <div className='co2link'>
                              <Link style={{ textDecoration: 'none', fontWeight: '450' }}
                                to={`${config.URL.EMISSIONSINFO[this.props.lang]}`}
                                target="_blank"
                              >
                                <FormattedMessage
                                  id="itinerary-co2.link"
                                  defaultMessage="Näin vähennämme päästöjä ›"
                                />
                              </Link>
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className={cx('divider-bottom')} />
                  </div>
                </div>
              ) :
                (null)}
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
        emissions
        legs {
          mode
          nextLegs(numberOfLegs: 2  originModesWithParentStation: [RAIL]  destinationModesWithParentStation: [RAIL]) {
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
          }
        }
      }
    `,
  },
);

export { ItineraryTab as Component, withRelay as default };

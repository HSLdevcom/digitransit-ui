import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Icon from './Icon';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import ItineraryLegs from './ItineraryLegs';
import BackButton from './BackButton';
import EmissionsInfo from './EmissionsInfo';
import Emissions from './Emissions';
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

import { fetchFares, getFares, shouldShowFareInfo } from '../util/fareUtils';
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

const ItineraryShape = PropTypes.oneOfType([
  PropTypes.any,
  PropTypes.shape({
    legs: PropTypes.arrayOf(
      PropTypes.shape({
        route: RouteShape,
        trip: TripShape,
        distance: PropTypes.number,
        fares: PropTypes.arrayOf(FareShape),
      }),
    ),
    emissionsPerPerson: PropTypes.shape({
      co2: PropTypes.number,
    }),
  }),
]);

/* eslint-disable prettier/prettier */
class ItineraryDetails extends React.Component {
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
    toggleCarpoolDrawer: PropTypes.func,
    carItinerary: ItineraryShape,
  };

  static defaultProps = {
    hideTitle: false,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  state = {
    fares: [],
    lang: '',
    fetchedFares: false,
  };

  handleFocus = (lat, lon) => {
    this.props.focusToPoint(lat, lon);
  };

  shouldShowDisclaimer(config) {
    return (
      config.showDisclaimer &&
      this.context.match.params.hash !== 'walk' &&
      this.context.match.params.hash !== 'bike'
    );
  }

  shouldShowCarpoolDisclaimer(config) {
    const hasCarpoolLegs = this.props.itinerary.legs.some(
      l => l.mode === 'CARPOOL',
    );
    return hasCarpoolLegs && config.carpoolDisclaimer;
  }

  printItinerary(e) {
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
  }

  getFutureText(startTime, currentTime) {
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
  }

  getExtraProps(itinerary) {
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
  }

  componentDidMount() {
    const { itinerary } = this.props;
    const { config } = this.context;

    if (!this.state.fetchedFares && config.URL?.FARES) {
      fetchFares(itinerary, config.URL.FARES)
        .then(data => {
          this.setState({
            fares: data,
            lang: this.context.getStore('PreferencesStore').getLanguage(),
            fetchedFares: true,
          });
        })
        // eslint-disable-next-line no-console
        .catch(err => console.log(err));
    } else {
      this.setState({
        fares: itinerary.fares,
        lang: this.context.getStore('PreferencesStore').getLanguage(),
        fetchedFares: true,
      });
    }
  }

  render() {
    const { itinerary } = this.props;
    const { config } = this.context;

    if (!itinerary?.legs[0]) {
      return null;
    }

    const fares = getFares(
      this.state.fares,
      getRoutes(itinerary.legs),
      config,
      this.state.lang,
    );
    const extraProps = this.getExtraProps(itinerary);
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

    let itineraryIndex = this.context.match.params.secondHash
      ? Number(this.context.match.params.secondHash)
      : Number(this.context.match.params.hash);

    if (Number.isNaN(itineraryIndex)) {
      itineraryIndex = 1;
    } else {
      itineraryIndex += 1;
    }
    return (
      <div className="itinerary-tab">
        <h2 className="sr-only" key="srlabel">
          <FormattedMessage
            id="summary-page.row-label"
            values={{
              number: itineraryIndex,
            }}
          />
        </h2>
        <BreakpointConsumer>
          {breakpoint => [
            breakpoint === 'large' && !this.props.hideTitle && (
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
            ),
            <ItinerarySummary
              itinerary={itinerary}
              key="summary"
              walking={extraProps.walking}
              biking={extraProps.biking}
              driving={extraProps.driving}
              futureText={extraProps.futureText}
              isMultiRow={extraProps.isMultiRow}
              isMobile={this.props.isMobile}
            />,
            showRentalBikeDurationWarning && (
              <CityBikeDurationInfo
                key="citybikedurationinfo"
                networks={Array.from(rentalBikeNetworks)}
                config={config}
              />
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
                key="legwrapper"
              >
                {shouldShowFareInfo(config) &&
                  config.displayFareInfoTop &&
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
                {config.showCO2InItinerarySummary && (
                  <EmissionsInfo
                    key="emissionssummary"
                    itinerary={itinerary}
                    isMobile={this.props.isMobile}
                  />
                )}
                <ItineraryLegs
                  fares={fares}
                  itinerary={itinerary}
                  focusToPoint={this.handleFocus}
                  focusToLeg={this.props.focusToLeg}
                  toggleCarpoolDrawer={this.props.toggleCarpoolDrawer}
                />
                {config.showCO2InItinerarySummary && (
                  <Emissions
                    config={config}
                    itinerary={itinerary}
                    carItinerary={this.props.carItinerary}
                    emissionsInfolink={config.EMISSIONS_INFO}
                  />
                )}
                {this.shouldShowCarpoolDisclaimer(config) && (
                  <div
                    className="itinerary-disclaimer"
                    key="carpool-disclaimer"
                  >
                    <div className="info-container">
                      <div className="icon-container">
                        <Icon className="info" img="icon-icon_info" />
                      </div>
                      <div className="description-container">
                        {config.carpoolDisclaimer}
                      </div>
                    </div>
                  </div>
                )}
                {shouldShowFareInfo(config) && (
                  <TicketInformation
                    key="ticketinformation"
                    fares={fares}
                    zones={getZones(itinerary.legs)}
                    legs={itinerary.legs}
                    loaded={this.state.fetchedFares}
                  />
                )}
                {config.showRouteInformation && <RouteInformation />}
              </div>
              {this.shouldShowDisclaimer(config) && (
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
}

const withRelay = createFragmentContainer(
  connectToStores(ItineraryDetails, ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  })),
  {
    plan: graphql`
      fragment ItineraryDetails_plan on Plan {
        date
      }
    `,
    itinerary: graphql`
      fragment ItineraryDetails_itinerary on Itinerary {
        walkDistance
        duration
        startTime
        endTime
        arrivedAtDestinationWithRentedBicycle
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
        emissionsPerPerson {
          co2
        }
        legs {
          mode
          # TODO still to implemented in upstream OTP
          # alerts {
          #  alertId
          #  alertDescriptionTextTranslations {
          #    language
          #    text
          #  }
          #}
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
                alertHeaderTextTranslations {
                  text
                  language
                }
                alertDescriptionText
                alertDescriptionTextTranslations {
                  text
                  language
                }
                alertUrl
                alertUrlTranslations {
                  text
                  language
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
                alertSeverityLevel
                effectiveEndDate
                effectiveStartDate
                alertHeaderText
                alertHeaderTextTranslations {
                  text
                  language
                }
                alertDescriptionText
                alertDescriptionTextTranslations {
                  text
                  language
                }
                alertUrl
                alertUrlTranslations {
                  text
                  language
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
            # TODO still to update upstream OTP
            # vehicleParkingWithEntrance {
            #  vehicleParking {
            #    tags
            #  }
            #}
          }
          dropOffBookingInfo {
            message
            dropOffMessage
            contactInfo {
              phoneNumber
              infoUrl
              bookingUrl
            }
          }
          steps {
            distance
            lon
            lat
            relativeDirection
            absoluteDirection
            streetName
            exit
            stayOn
            area
            walkingBike
            bogusName
            alerts {
              feed
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
          departureDelay
          arrivalDelay
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
            url
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
              entities {
                __typename
                ... on Route {
                  patterns {
                    code
                  }
                }
              }
              alertHeaderText
              alertHeaderTextTranslations {
                text
                language
              }
              alertDescriptionText
              alertDescriptionTextTranslations {
                text
                language
              }
              alertUrl
              alertUrlTranslations {
                text
                language
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

export { ItineraryDetails as Component, withRelay as default };

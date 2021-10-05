import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import ItineraryLegs from './ItineraryLegs';
import BackButton from './BackButton';
import {
  getRoutes,
  getZones,
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  legContainsRentalBike,
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

/* eslint-disable prettier/prettier */
class ItineraryTab extends React.Component {
  static propTypes = {
    plan: PropTypes.shape({
      date: PropTypes.number.isRequired,
    }).isRequired,
    itinerary: PropTypes.object.isRequired,
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    hideTitle: PropTypes.bool,
    toggleCarpoolDrawer: PropTypes.func,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    getStore: PropTypes.func,
  };

  state = {
    fares: [],
    lang: '',
    fetchedFares: false,
  }

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

  getFutureText = startTime => {
    const refTime = getCurrentMillis();
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
    const futureText = this.getFutureText(itinerary.startTime);
    const isMultiRow =
      walkingDistance > 0 && bikingDistance > 0 && futureText !== '';
    const extraProps = {
      walking: {
        duration: walkingDuration,
        distance: walkingDistance,
      },
      biking: {
        duration: bikingDuration,
        distance: bikingDistance,
      },
      futureText,
      isMultiRow,
    };
    return extraProps;
  };

  componentDidMount() {
    const { itinerary } = this.props;
    const { config } = this.context;

    if (itinerary.fares === null && config.URL.FARES) {
      fetchFares(itinerary, config.URL.FARES)
        .then(data => {
          this.setState({
            fares: data,
            lang: this.context.getStore('PreferencesStore').getLanguage(),
            fetchedFares: true
          });
        })
        // eslint-disable-next-line no-console
        .catch(err => console.log(err));
    } else {
      this.setState({
        fares: itinerary.fares,
        lang: this.context.getStore('PreferencesStore').getLanguage(),
        fetchedFares: true
      });
    }
  }

  render() {
    const { itinerary } = this.props;
    const { config } = this.context;

    if (!itinerary || !itinerary.legs[0]) {
      return null;
    }

    const fares = getFares(this.state.fares, getRoutes(itinerary.legs), config, this.state.lang)
    const extraProps = this.setExtraProps(itinerary);
    const legsWithRentalBike = itinerary.legs.filter(leg => legContainsRentalBike(leg));
    const rentalBikeNetworks = new Set();
    let showRentalBikeDurationWarning = false;
    if (legsWithRentalBike.length > 0) {
      for (let i=0; i < legsWithRentalBike.length; i++) {
        const leg = legsWithRentalBike[i];
        const network = getCityBikeNetworkId(leg.from.bikeRentalStation?.networks);
        if (config.cityBike.networks[network]?.timeBeforeSurcharge && config.cityBike.networks[network]?.durationInstructions) {
          const rentDurationOverSurchargeLimit = leg.duration > config.cityBike.networks[network].timeBeforeSurcharge;
          if (rentDurationOverSurchargeLimit) {
            rentalBikeNetworks.add(network);
            showRentalBikeDurationWarning = rentDurationOverSurchargeLimit || showRentalBikeDurationWarning;
          }
        }
      }
    }
    return (
      <div className="itinerary-tab">
        <h2 className="sr-only">
          <FormattedMessage
            id="summary-page.row-label"
            values={{
              number: Number(this.context.match.params.hash) + 1,
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
                futureText={extraProps.futureText}
                isMultiRow={extraProps.isMultiRow}
                isMobile={this.props.isMobile}
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
                    futureText={extraProps.futureText}
                    isMultiRow={extraProps.isMultiRow}
                    isMobile={this.props.isMobile}
                  />
                  <div className="summary-divider" />
                </div>
              </>
            ),
            showRentalBikeDurationWarning && <CityBikeDurationInfo networks={Array.from(rentalBikeNetworks)} config={config} />,
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
                {shouldShowFareInfo(config) && config.displayFareInfoTop &&
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
                  toggleCarpoolDrawer={this.props.toggleCarpoolDrawer}
                />
                {shouldShowFareInfo(config) && (
                  <TicketInformation
                    fares={fares}
                    zones={getZones(itinerary.legs)}
                    legs={itinerary.legs}
                    loaded={this.state.fetchedFares}
                  />
                )}
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

const withRelay = createFragmentContainer(ItineraryTab, {
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
      legs {
        mode
        alerts {
          alertId
          alertDescriptionTextTranslations {
            language
            text
          }
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
              trip {
                pattern {
                  code
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
              trip {
                pattern {
                  code
                }
              }
              alertHeaderText
              alertHeaderTextTranslations {
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
          vehicleParkingWithEntrance {
            vehicleParking {
              tags
            }
          }
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
          longName
          url
          type
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
            trip {
              pattern {
                code
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
});

export { ItineraryTab as Component, withRelay as default };

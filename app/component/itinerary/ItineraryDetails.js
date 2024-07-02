import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import get from 'lodash/get';
import { configShape, itineraryShape } from '../../util/shapes';
import TicketInformation from './TicketInformation';
import ItinerarySummary from './ItinerarySummary';
import Legs from './Legs';
import BackButton from '../BackButton';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import {
  compressLegs,
  getTotalBikingDistance,
  getTotalBikingDuration,
  getTotalDrivingDistance,
  getTotalDrivingDuration,
  getTotalWalkingDistance,
  getTotalWalkingDuration,
  getZones,
  isCallAgencyPickupType,
  legContainsBikePark,
  legContainsRentalBike,
} from '../../util/legUtils';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import { streetHash } from '../../util/path';
import {
  getFaresFromLegs,
  shouldShowFareInfo,
  shouldShowFarePurchaseInfo,
} from '../../util/fareUtils';
import {
  getFormattedTimeDate,
  isToday,
  isTomorrow,
} from '../../util/timeUtils';
import VehicleRentalDurationInfo from './VehicleRentalDurationInfo';
import Emissions from './Emissions';
import EmissionsInfo from './EmissionsInfo';
import FareDisclaimer from './FareDisclaimer';

import SecondaryButton from '../SecondaryButton';

const followItineraryRoute = '../../../FollowTheItinerary';

/* eslint-disable prettier/prettier */
class ItineraryDetails extends React.Component {
  static propTypes = {
    itinerary: itineraryShape.isRequired,
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
    hideTitle: PropTypes.bool,
    carEmissions: PropTypes.number,
    currentLanguage: PropTypes.string,
    changeHash: PropTypes.func,
    openSettings: PropTypes.func.isRequired,
    bikeAndPublicItineraryCount: PropTypes.number,
  };

  static defaultProps = {
    hideTitle: false,
    currentLanguage: 'fi',
    changeHash: () => {},
    bikeAndPublicItineraryCount: 0,
    carEmissions: undefined,
  };

  static contextTypes = {
    config: configShape.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  shouldShowDisclaimer(config) {
    return (
      config.showDisclaimer &&
      this.context.match.params.hash !== streetHash.walk &&
      this.context.match.params.hash !== streetHash.bike
    );
  };

  getIsItineraryFollowerOn(config){
    return config.itineraryFollowerOn;
  };

  getFutureText(startTime) {
    const refTime = Date.now();
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
    const futureText = this.getFutureText(itinerary.start);
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
  
  followItinerary = e => {
    e.stopPropagation();
    window.open(followItineraryRoute, '_blank');   
  };

  render() {
    const { itinerary, currentLanguage, isMobile, bikeAndPublicItineraryCount } = this.props;
    const { config } = this.context;
    if (!itinerary?.legs[0]) {
      return null;
    }
    const fares = getFaresFromLegs(itinerary.legs, config);
    const extraProps = this.getExtraProps(itinerary);
    const {biking, walking, driving, futureText, isMultiRow} = extraProps;
    const legsWithRentalBike = compressLegs(itinerary.legs).filter(leg =>
      legContainsRentalBike(leg),
    );
    const legswithBikePark = compressLegs(itinerary.legs).filter(leg => legContainsBikePark(leg));
    const containsBiking = biking.duration > 0 && biking.distance > 0;
    const showBikeBoardingInformation = containsBiking && bikeAndPublicItineraryCount > 0 && legswithBikePark.length === 0;
    const rentalBikeNetworks = new Set();
    let showRentalBikeDurationWarning = false;
    if (legsWithRentalBike.length > 0) {
      for (let i = 0; i < legsWithRentalBike.length; i++) {
        const leg = legsWithRentalBike[i];
        const network = leg.from.vehicleRentalStation?.network;
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

    const disclaimers = [];

    if (shouldShowFareInfo(config) && fares.some(fare => fare.isUnknown)) {
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
      if (
        info &&
        itinerary.legs.some(leg => isCallAgencyPickupType(leg))
      ) {
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
              agencyName: get(config, 'ticketInformation.primaryAgencyName'),
            }}
          />,
        );
      }
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
              walking={walking}
              biking={biking}
              driving={driving}
              futureText={futureText}
              isMultiRow={isMultiRow}
              isMobile={isMobile}
              hideBottomDivider={isMobile && shouldShowFarePurchaseInfo(
                config,
                breakpoint,
                fares,
              )}
            />,
            showRentalBikeDurationWarning && (
              <VehicleRentalDurationInfo
		key="rentaldurationinfo"
                networks={Array.from(rentalBikeNetworks)}
                config={config}
              />
            ),
            shouldShowFareInfo(config) &&
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
                />
              )),
            config.showCO2InItinerarySummary && (
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
                  focusToPoint={this.props.focusToPoint}
                  focusToLeg={this.props.focusToLeg}
                  changeHash={this.props.changeHash}
                  tabIndex={itineraryIndex - 1}
                  openSettings={this.props.openSettings}
                  showBikeBoardingInformation={showBikeBoardingInformation}
                />
              </div>
              {config.showCO2InItinerarySummary && (
                <Emissions
		  key="emissionsinfo"
                  config={config}
                  itinerary={itinerary}
                  carEmissions={this.props.carEmissions}
                  emissionsInfolink={
                    config.URL.EMISSIONS_INFO?.[currentLanguage]
                  }
                />
              )}

              {this.getIsItineraryFollowerOn(config) && (
                <div>
                  <SecondaryButton 
                    ariaLabel="follow" 
                    buttonName="followtheitinerary"
                    buttonClickAction={this.followItinerary}
                    buttonIcon="icon.icon_mapMarker-via-map"
                    smallSize /> 
                </div>
              )}


              {this.shouldShowDisclaimer(config) && (
                <div className="itinerary-disclaimer" key="disclaimer">
                  <FormattedMessage
                    id="disclaimer"
                    defaultMessage="Results are based on estimated travel times"
                  />
                </div>
              )}
              <div className="itinerary-empty-space" key="emptyspace"/>
            </div>,
          ]}
        </BreakpointConsumer>
      </div>
    );
  }
}

const withRelay = createFragmentContainer(
  connectToStores(ItineraryDetails, ['PreferencesStore'], context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  })),
  {
    itinerary: graphql`
      fragment ItineraryDetails_itinerary on Itinerary {
        duration
        start
        end
        emissionsPerPerson {
          co2
        }
        legs {
          fareProducts {
            id
            product {
              id
              ... on DefaultFareProduct {
                price {
                  amount
                }
              }
            }
          }
          mode
          legGeometry {
            points
          }
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
            start {
              scheduledTime
              estimated {
                time
              }
            }
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
            vehicleParking  {
              name
              vehicleParkingId
            }
            vehicleRentalStation {
              network
              availableVehicles {
                total
              }
              lat
              lon
              stationId
            }
            rentalVehicle {
              vehicleId
              name
              lat
              lon
              network
              rentalUris {
                android
                ios 
                web
              }
              vehicleRentalSystem {
                url
              }
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
            vehicleRentalStation {
              lat
              lon
              stationId
              network
              availableVehicles {
                total
              }
            }
            rentalVehicle {
                vehicleId
                lat
                lon
                network
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
            vehicleParking  {
               vehicleParkingId
               name
            }
          }
          intermediatePlaces {
            arrival  {
              scheduledTime
              estimated {
                time
              }
            }
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
          start {
            scheduledTime
            estimated {
              time
            }
          }
          end {
            scheduledTime
            estimated {
              time
            }
          }
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

export { ItineraryDetails as Component, withRelay as default };

import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItineraryProfile from './ItineraryProfile';
import ItinerarySummary from './ItinerarySummary';
import TimeFrame from './TimeFrame';
import DateWarning from './DateWarning';
import ItineraryLegs from './ItineraryLegs';
import SecondaryButton from './SecondaryButton';
import { getRoutes, getZones } from '../util/legUtils';
import { BreakpointConsumer } from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';

import exampleData from './data/ItineraryTab.exampleData.json';
import { getFares } from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
/* eslint-disable prettier/prettier */
class ItineraryTab extends React.Component {
  static propTypes = {
    plan: PropTypes.shape({
      date: PropTypes.number.isRequired,
    }).isRequired,
    itinerary: PropTypes.object.isRequired,
    match: matchShape.object,
    focus: PropTypes.func.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  state = {
    lat: undefined,
    lon: undefined,
  };

  getState = () => ({
    lat: this.state.lat || this.props.itinerary.legs[0].from.lat,
    lon: this.state.lon || this.props.itinerary.legs[0].from.lon,
  });

  handleFocus = (lat, lon) => {
    this.props.focus(lat, lon);

    return this.setState({
      lat,
      lon,
    });
  };

  printItinerary = e => {
    e.stopPropagation();

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'Print',
      name: null,
    });

    const printPath = `${this.props.match.location.pathname}/tulosta`;
    this.context.router.push({
      ...this.props.match.location,
      pathname: printPath,
    });
  };

  render() {
    const { itinerary, plan } = this.props;
    const { config } = this.context;

    const fares = getFares(itinerary.fares, getRoutes(itinerary.legs), config);
    return (
      <div className="itinerary-tab">
        <BreakpointConsumer>
          {breakpoint => [
            breakpoint !== 'large' ? (
              <ItinerarySummary itinerary={itinerary} key="summary">
                <TimeFrame
                  startTime={itinerary.startTime}
                  endTime={itinerary.endTime}
                  refTime={plan.date}
                  className="timeframe--itinerary-summary"
                />
              </ItinerarySummary>
            ) : (
              <div className="itinerary-timeframe" key="timeframe">
                <DateWarning date={itinerary.startTime} refTime={plan.date} />
              </div>
            ),
            <div className="momentum-scroll itinerary-tabs__scroll" key="legs">
              <div
                className={cx('itinerary-main', {
                  'bp-large': breakpoint === 'large',
                })}
              >

                {config.showTicketInformation &&
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
                  focusMap={this.handleFocus}
                />
                <ItineraryProfile
                  itinerary={itinerary}
                  small={breakpoint !== 'large'}
                />
                {config.showTicketInformation && (
                  <TicketInformation
                    fares={fares}
                    zones={getZones(itinerary.legs)}
                    legs={itinerary.legs}
                  />
                )}
                {config.showRouteInformation && <RouteInformation />}
              </div>
              <div className="row print-itinerary-button-container">
                <SecondaryButton
                  ariaLabel="print"
                  buttonName="print"
                  buttonClickAction={e => this.printItinerary(e)}
                  buttonIcon="icon-icon_print"
                />
              </div>
              {config.showDisclaimer && (
                <div className="itinerary-disclaimer">
                  <FormattedMessage
                    id="disclaimer"
                    defaultMessage="Results are based on estimated travel times"
                  />
                </div>
              )}
            </div>,
          ]}
        </BreakpointConsumer>
      </div>
    );
  }
}

ItineraryTab.description = (
  <ComponentUsageExample description="with disruption">
    <div style={{ maxWidth: '528px' }}>
      <ItineraryTab
        focus={() => {}}
        itinerary={{ ...exampleData.itinerary }}
        plan={{date: 1553845502000}}
      />
    </div>
  </ComponentUsageExample>
);

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
      elevationGained
      elevationLost
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
        ...LegAgencyInfo_leg
        from {
          lat
          lon
          name
          vertexType
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
            zoneId
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
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
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
            }
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
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
            }
          }
        }
        realTime
        realtimeState
        transitLeg
        rentedBike
        startTime
        endTime
        mode
        distance
        duration
        intermediatePlace
        route {
          shortName
          color
          gtfsId
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
            trip {
              pattern {
                code
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
          stoptimes {
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

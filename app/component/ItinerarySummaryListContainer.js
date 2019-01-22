import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import cx from 'classnames';
import startsWith from 'lodash/startsWith';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import Icon from './Icon';
import { isBrowser } from '../util/browser';
import { distance } from '../util/geo-utils';
import { checkForCanceledLegs } from '../util/legUtils';

class ItinerarySummaryListContainer extends React.Component {
  state = {
    showCancelled: false,
  };

  showCanceledItineraries(val) {
    this.setState({
      showCancelled: val,
    });
  }

  render() {
    console.log(this.props.itineraries);
    if (
      !this.props.error &&
      this.props.itineraries &&
      this.props.itineraries.length > 0
    ) {
      const canceledItineraries = [];
      this.props.itineraries.forEach(
        itinerary =>
          checkForCanceledLegs(itinerary) &&
          canceledItineraries.push(itinerary),
      );

      console.log(canceledItineraries);

      const canceledItinerarySummaries = (
        <div className="additional-canceled-itineraries">
          <div className="canceled-itineraries-container">
            <div className="canceled-itineraries-icon">
              <Icon img="icon-icon_caution" />
            </div>
            <div className="canceled-itineraries-text">
              Lisäksi {canceledItineraries.length} peruttua reittiehdotusta
            </div>
            <div className="canceled-itineraries-button">
              <button
                className="canceled-itineraries-show"
                onClick={() => this.showCanceledItineraries(true)}
              >
                Näytä
              </button>
            </div>
          </div>
        </div>
      );

      const openedIndex = this.props.open && Number(this.props.open);
      const summaries = this.props.itineraries.map((itinerary, i) => (
        <SummaryRow
          refTime={this.props.searchTime}
          key={i} // eslint-disable-line react/no-array-index-key
          hash={i}
          data={itinerary}
          passive={i !== this.props.activeIndex}
          currentTime={this.props.currentTime}
          onSelect={this.props.onSelect}
          onSelectImmediately={this.props.onSelectImmediately}
          intermediatePlaces={this.props.intermediatePlaces}
          isCancelled={canceledItineraries.includes(itinerary)}
          showCancelled={this.state.showCancelled}
        >
          {i === openedIndex && this.props.children}
        </SummaryRow>
      ));

      return (
        <div className="summary-list-container">
          {isBrowser && summaries}
          {isBrowser && canceledItinerarySummaries}
        </div>
      );
    }
    if (
      !this.props.error &&
      (!this.props.from.lat ||
        !this.props.from.lon ||
        !this.props.to.lat ||
        !this.props.to.lon)
    ) {
      return (
        <div className="summary-list-container summary-no-route-found">
          <FormattedMessage
            id="no-route-start-end"
            defaultMessage="Please select origin and destination."
          />
        </div>
      );
    }

    let msgId;
    let outside;
    let iconType = 'caution';
    let iconImg = 'icon-icon_caution';
    // If error starts with "Error" it's not a message id, it's an error message
    // from OTP
    if (this.props.error && !startsWith(this.props.error, 'Error')) {
      msgId = this.props.error;
    } else if (
      !inside(
        [this.props.from.lon, this.props.from.lat],
        this.context.config.areaPolygon,
      )
    ) {
      msgId = 'origin-outside-service';
      outside = true;
    } else if (
      !inside(
        [this.props.to.lon, this.props.to.lat],
        this.context.config.areaPolygon,
      )
    ) {
      msgId = 'destination-outside-service';
      outside = true;
    } else if (
      distance(this.props.from, this.props.to) <
      this.context.config.minDistanceBetweenFromAndTo
    ) {
      iconType = 'info';
      iconImg = 'icon-icon_info';
      if (
        this.props.locationState &&
        this.props.locationState.hasLocation &&
        ((this.props.from.lat === this.props.locationState.lat &&
          this.props.from.lon === this.props.locationState.lon) ||
          (this.props.to.lat === this.props.locationState.lat &&
            this.props.to.lon === this.props.locationState.lon))
      ) {
        msgId = 'no-route-already-at-destination';
      } else {
        msgId = 'no-route-origin-near-destination';
      }
    } else {
      msgId = 'no-route-msg';
    }

    let linkPart = null;
    if (outside && this.context.config.nationalServiceLink) {
      linkPart = (
        <div>
          <FormattedMessage
            id="use-national-service"
            defaultMessage="You can also try the national service available at"
          />
          <ExternalLink
            className="external-no-route"
            {...this.context.config.nationalServiceLink}
          />
        </div>
      );
    }

    return (
      <div className="summary-list-container summary-no-route-found">
        <div className="flex-horizontal">
          <Icon className={cx('no-route-icon', iconType)} img={iconImg} />
          <div>
            <FormattedMessage
              id={msgId}
              defaultMessage={
                'Unfortunately no routes were found for your journey. ' +
                'Please change your origin or destination address.'
              }
            />
            {linkPart}
          </div>
        </div>
      </div>
    );
  }
}

const locationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

ItinerarySummaryListContainer.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  children: PropTypes.node,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string }),
  ]),
  from: locationShape.isRequired,
  intermediatePlaces: PropTypes.arrayOf(locationShape),
  itineraries: PropTypes.array,
  locationState: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  open: PropTypes.number,
  searchTime: PropTypes.number.isRequired,
  to: locationShape.isRequired,
};

ItinerarySummaryListContainer.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
};

ItinerarySummaryListContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default Relay.createContainer(ItinerarySummaryListContainer, {
  fragments: {
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural:true){
        walkDistance
        startTime
        endTime
        legs {
          realTime
          transitLeg
          startTime
          endTime
          mode
          distance
          duration
          rentedBike
          intermediatePlace
          route {
            mode
            shortName
            color
            agency {
              name
            }
          }
          trip {
            alerts {
              effectiveStartDate
              effectiveEndDate
            }
            stoptimes {
              stop {
                gtfsId
              }
              pickupType
            }
          }
          from {
            name
            lat
            lon
            stop {
              gtfsId
              stoptimes: stoptimesWithoutPatterns(omitCanceled: false) {
                pickupType
                realtimeState
                trip {
                  gtfsId
                  route {
                    shortName
                    gtfsId
                  }
                }
                stop {
                  gtfsId
                }
              }
            }
            bikeRentalStation {
              bikesAvailable
            }
          }
          to {
            stop {
              gtfsId
            }
          }
        }
      }
    `,
  },
});

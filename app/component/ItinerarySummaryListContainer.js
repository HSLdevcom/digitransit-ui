import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import inside from 'point-in-polygon';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import Icon from './Icon';
import { checkPromotionQueries } from '../util/promotionUtils';

const locationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

class ItinerarySummaryListContainer extends React.Component {
  static propTypes = {
    searchTime: PropTypes.number.isRequired,
    itineraries: PropTypes.array,
    intermediatePlaces: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number,
        lon: PropTypes.number,
        address: PropTypes.string,
      }),
    ),
    activeIndex: PropTypes.number.isRequired,
    currentTime: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectImmediately: PropTypes.func.isRequired,
    setPromotionSuggestions: PropTypes.func.isRequired,
    setNewQuery: PropTypes.bool,
    disableNewQuery: PropTypes.func,
    open: PropTypes.number,
    error: PropTypes.string,
    config: PropTypes.object,
    children: PropTypes.node,
    from: locationShape.isRequired,
    to: locationShape.isRequired,
    relay: PropTypes.shape({
      route: PropTypes.shape({
        params: PropTypes.shape({
          to: PropTypes.shape({
            lat: PropTypes.number,
            lon: PropTypes.number,
            address: PropTypes.string.isRequired,
          }).isRequired,
          from: PropTypes.shape({
            lat: PropTypes.number,
            lon: PropTypes.number,
            address: PropTypes.string.isRequired,
          }).isRequired,
          intermediatePlaces: PropTypes.array,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    intermediatePlaces: [],
    itineraries: [],
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  componentDidMount = () => {
    this.getPromotionSuggestions();
  };

  componentWillReceiveProps = () => {
    if (this.props.setNewQuery) {
      this.getPromotionSuggestions();
    }
  };

  getPromotionSuggestions = () => {
    checkPromotionQueries(
      this.props.itineraries,
      this.context,
      this.props.config,
      this.props.currentTime,
      this.setPromotionSuggestions,
    );
  };

  setPromotionSuggestions = promotionSuggestions => {
    this.props.setPromotionSuggestions(promotionSuggestions);
    this.props.disableNewQuery();
  };

  render() {
    if (
      !this.props.error &&
      this.props.itineraries &&
      this.props.itineraries.length > 0
    ) {
      const open = this.props.open && Number(this.props.open);
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
        >
          {i === open && this.props.children}
        </SummaryRow>
      ));

      return (
        <React.Fragment>
          <div className="summary-list-container momentum-scroll">
            {summaries}
          </div>
        </React.Fragment>
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

    let msg;
    let outside;
    if (this.props.error) {
      msg = this.props.error;
    } else if (
      !inside(
        [this.props.from.lon, this.props.from.lat],
        this.context.config.areaPolygon,
      )
    ) {
      msg = 'origin-outside-service';
      outside = true;
    } else if (
      !inside(
        [this.props.to.lon, this.props.to.lat],
        this.context.config.areaPolygon,
      )
    ) {
      msg = 'destination-outside-service';
      outside = true;
    } else {
      msg = 'no-route-msg';
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
          <Icon className="no-route-icon" img="icon-icon_caution" />
          <div>
            <FormattedMessage
              id={msg}
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

export default Relay.createContainer(ItinerarySummaryListContainer, {
  fragments: {
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural:true){
        walkDistance
        startTime
        endTime
        duration
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
            alerts {
              effectiveStartDate
              effectiveEndDate
            }
            agency {
              name
            }
          }
          trip {
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

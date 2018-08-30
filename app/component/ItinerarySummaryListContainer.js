import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import inside from 'point-in-polygon';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import Icon from './Icon';
import PromotionSuggestions from './PromotionSuggestions';
import { getBikeWalkPromotions } from '../util/promotionUtils';
import { getStreetMode } from '../util/modeUtils';

class ItinerarySummaryListContainer extends React.Component {
  static propTypes = {
    searchTime: PropTypes.number.isRequired,
    itineraries: PropTypes.array,
    activeIndex: PropTypes.number.isRequired,
    currentTime: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectImmediately: PropTypes.func.isRequired,
    promotionSuggestions: PropTypes.array,
    setPromotionSuggestions: PropTypes.func.isRequired,
    open: PropTypes.number,
    error: PropTypes.string,
    config: PropTypes.object,
    children: PropTypes.node,
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

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  state = {
    promotionSuggestions: false,
  };

  componentDidMount = () => {
    this.getBikeWalkPromotionQuery();
  };

  getBikeWalkPromotionQuery() {
    const totalTransitDistance = this.props.itineraries[0].legs
      .map(leg => leg.distance)
      .reduce((a, b) => a + b, 0);
    if (
      Math.round(totalTransitDistance / 500) * 500 <= 5000 &&
      getStreetMode(this.context.location, this.context.config) ===
        'PUBLIC_TRANSPORT'
    ) {
      getBikeWalkPromotions(
        this.props.currentTime,
        this.props.config,
        this.context,
        this.setPromotionSuggestions,
      );
    }
  }

  setPromotionSuggestions = promotionSuggestions => {
    this.setState({ promotionSuggestions });
  };

  render() {
    console.log(this.state.promotionSuggestions);
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
          intermediatePlaces={this.props.relay.route.params.intermediatePlaces}
        >
          {i === open && this.props.children}
        </SummaryRow>
      ));

      return (
        <React.Fragment>
          <div
            className="biking-walk-promotion-container"
            style={{
              display: this.state.promotionSuggestions ? 'flex' : 'none',
            }}
          >
            {this.state.promotionSuggestions &&
              this.state.promotionSuggestions.map(suggestion => (
                <PromotionSuggestions
                  key={suggestion.plan.endTime}
                  promotionSuggestion={suggestion.plan}
                  textId={suggestion.textId}
                  iconName={suggestion.iconName}
                  onSelect={this.props.onSelectImmediately}
                  mode={suggestion.mode}
                  hash={0}
                />
              ))}
          </div>
          <div className="summary-list-container momentum-scroll">
            {summaries}
          </div>
        </React.Fragment>
      );
    }
    const { from, to } = this.props.relay.route.params;
    if (!this.props.error && (!from.lat || !from.lon || !to.lat || !to.lon)) {
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
    } else if (!inside([from.lon, from.lat], this.context.config.areaPolygon)) {
      msg = 'origin-outside-service';
      outside = true;
    } else if (!inside([to.lon, to.lat], this.context.config.areaPolygon)) {
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

import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import isEqual from 'lodash/isEqual';

import DefaultNavigation from '../component/navigation/DefaultNavigation';
import { otpToLocation } from '../util/otp-strings';
import config from '../config';
import ItineraryPlanContainer from '../component/itinerary/ItineraryPlanContainer';
import PlanRoute from '../route/PlanRoute';
import { storeEndpoint } from '../action/EndpointActions';
import NoRoutePopup from '../component/summary/no-route-popup';

const getItinerarySearch = (store) => ({
  modes: store.getMode().join(','),
  walkReluctance: store.getWalkReluctance(),
  walkBoardCost: store.getWalkBoardCost(),
  minTransferTime: store.getMinTransferTime(),
  walkSpeed: store.getWalkSpeed(),
  wheelchair: store.isWheelchair(),
  maxWalkDistance: store.getMode().indexOf('BICYCLE') === -1 ?
      config.maxWalkDistance : config.maxBikingDistance,
  disableRemainingWeightHeuristic: store.getCitybikeState(),
});

const getTime = (store) => ({
  selectedTime: store.getSelectedTime(),
  arriveBy: store.getArriveBy(),
});

class ItineraryPage extends React.Component {
  static propTypes = {
    params: React.PropTypes.shape({
      from: React.PropTypes.string.isRequired,
      to: React.PropTypes.string.isRequired,
      hash: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    raven: React.PropTypes.object.isRequired,
  };

  static loadAction(params) {
    return [[storeEndpoint, {
      target: 'origin',
      endpoint: otpToLocation(params.from),
    }], [storeEndpoint, {
      target: 'destination',
      endpoint: otpToLocation(params.to),
    }]];
  }

  state = {
    search: getItinerarySearch(this.context.getStore('ItinerarySearchStore')),
    time: getTime(this.context.getStore('TimeStore')),
  }

  componentDidMount() {
    this.context.getStore('ItinerarySearchStore').addChangeListener(this.onChange);
  }

  shouldComponentUpdate(newProps, newState) {
    return !(this.state && isEqual(this.props, newProps && isEqual(this.state, newState)));
  }

  componentWillUnmount() {
    this.context.getStore('ItinerarySearchStore').removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      search: getItinerarySearch(this.context.getStore('ItinerarySearchStore')),
    });
  }

  render() {
    let plan;

    // dependencies from config
    const preferredAgencies = config.preferredAgency || '';

    // dependencies from route params
    const from = otpToLocation(this.props.params.from);
    const to = otpToLocation(this.props.params.to);

    // dependencies from itinerary search store
    const search = this.state && this.state.search;

    // dependencies from time store
    const time = this.state && this.state.time;

    if (search && time) {
      plan = (
        <Relay.RootContainer
          Component={ItineraryPlanContainer}
          route={new PlanRoute({
            fromPlace: this.props.params.from,
            toPlace: this.props.params.to,
            from,
            to,
            numItineraries: 3,
            modes: search.modes,
            date: time.selectedTime.format('YYYY-MM-DD'),
            time: time.selectedTime.format('HH:mm:ss'),
            walkReluctance: search.walkReluctance + 0.000099,
            walkBoardCost: search.walkBoardCost,
            minTransferTime: search.minTransferTime,
            walkSpeed: search.walkSpeed + 0.000099,
            maxWalkDistance: search.maxWalkDistance + 0.1,
            wheelchair: search.wheelchair,

            preferred: {
              agencies: preferredAgencies,
            },

            arriveBy: time.arriveBy,
            disableRemainingWeightHeuristic: search.disableRemainingWeightHeuristic,
            hash: this.props.params.hash,
          })}
          renderFailure={error => {
            this.context.raven.captureMessage('OTP returned an error when requesting a plan', {
              extra: error,
            });

            return <div><NoRoutePopup /></div>;
          }}
          renderLoading={() => <div className="spinner-loader" />}
        />
      );
    } else {
      plan = <div className="spinner-loader" />;
    }

    const title = this.context.intl.formatMessage({
      id: 'itinerary-page.title',
      defaultMessage: 'Route',
    });

    const meta = {
      title,

      meta: [{
        name: 'description',

        content: this.context.intl.formatMessage({
          id: 'itinerary-page.description',
          defaultMessage: 'Route',
        }),
      }],
    };

    return (
      <DefaultNavigation
        className="fullscreen"
        title={title}
      >
        <Helmet {...meta} />
        {plan}
      </DefaultNavigation>
    );
  }
}

export default ItineraryPage;

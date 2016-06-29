import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import isEqual from 'lodash/isEqual';
import SummaryPlanContainer from '../component/summary/SummaryPlanContainer';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import SummaryNavigation from '../component/navigation/SummaryNavigation';
import NoRoutePopup from '../component/summary/no-route-popup';
import { itinerarySearchRequest } from '../action/ItinerarySearchActions';
import { otpToLocation } from '../util/otp-strings';
import { storeEndpoint } from '../action/EndpointActions';
import { intlShape } from 'react-intl';
import { SummaryPlanContainerRoute } from '../queries';
import config from '../config';

export default class SummaryPage extends React.Component {

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
    raven: React.PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static loadAction = (params) =>
    [
      [storeEndpoint, {
        target: 'origin',
        endpoint: otpToLocation(params.from),
      }],
      [storeEndpoint, {
        target: 'destination',
        endpoint: otpToLocation(params.to),
      }],
    ]

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.onMount = this.onMount.bind(this);
  }

  componentDidMount() {
    this.context.getStore('ItinerarySearchStore').addChangeListener(this.onChange);
    this.context.getStore('TimeStore').addChangeListener(this.onTimeChange);
    this.context.executeAction(itinerarySearchRequest, this.props);
    this.onMount();
  }

  shouldComponentUpdate(newProps, newState) {
    return !(this.state && isEqual(this.props, newProps && isEqual(this.state, newState)));
  }

  componentWillUnmount() {
    this.context.getStore('ItinerarySearchStore').removeChangeListener(this.onChange);
    this.context.getStore('TimeStore').removeChangeListener(this.onTimeChange);
  }

  onMount() {
    this.setState({
      search: this.updateItinerarySearch(this.context.getStore('ItinerarySearchStore')),
      time: this.updateTime(this.context.getStore('TimeStore')),
    });
  }

  onChange() {
    this.setState({
      search: this.updateItinerarySearch(this.context.getStore('ItinerarySearchStore')),
    });
  }

  onTimeChange(e) {
    if (e.selectedTime) {
      this.setState({
        time: this.updateTime(this.context.getStore('TimeStore')),
      });
    }
  }

  updateItinerarySearch(store) {
    return {
      modes: store.getMode(),
      walkReluctance: store.getWalkReluctance(),
      walkBoardCost: store.getWalkBoardCost(),
      minTransferTime: store.getMinTransferTime(),
      walkSpeed: store.getWalkSpeed(),
      wheelchair: store.isWheelchair(),
      maxWalkDistance: store.getMode().indexOf('BICYCLE') === -1 ?
        config.maxWalkDistance : config.maxBikingDistance,
      disableRemainingWeightHeuristic: store.getCitybikeState(),
    };
  }

  updateTime(store) {
    return {
      selectedTime: store.getSelectedTime(),
      arriveBy: store.getArriveBy(),
    };
  }

  render() {
    let plan;
    const from = otpToLocation(this.props.params.from);
    const to = otpToLocation(this.props.params.to);
    const search = this.state ? this.state.search : void 0;
    const time = this.state ? this.state.time : void 0;

    if (search && time) {
      plan = (
        <Relay.RootContainer
          Component={SummaryPlanContainer}
          route={new SummaryPlanContainerRoute({
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
              agencies: search.preferredAgencies,
            },
            arriveBy: time.arriveBy,
            disableRemainingWeightHeuristic: search.disableRemainingWeightHeuristic,
          })}
          renderFailure={error => {
            this.context.raven.captureMessage('OTP returned an error when requesting a plan', {
              extra: error,
            });
            return (
              <div className="summary">
                <SummaryPlanContainer from={from} to={to} />
                <NoRoutePopup />
              </div>);
          }}
          renderLoading={() => <div className="spinner-loader" />}
        />);
    } else {
      plan = <div className="spinner-loader" />;
    }

    const title = this.context.intl.formatMessage({
      id: 'itinerary-summary-page.title',
      defaultMessage: 'Route suggestions',
    });

    const description = this.context.intl.formatMessage({
      id: 'itinerary-summary-page.description',
      defaultMessage: 'Route suggestions',
    });

    const meta = {
      title,
      meta: [{
        name: 'description',
        content: description,
      }],
    };

    return (
      <DefaultNavigation className="fullscreen" title={title}>
        <SummaryNavigation
          title={title}
          hasDefaultPreferences={
            this.context.getStore('ItinerarySearchStore').hasDefaultPreferences()
          }
        >
          <Helmet {...meta} />
          {plan}
        </SummaryNavigation>
      </DefaultNavigation>);
  }
}

SummaryPage.propTypes = {
  params: React.PropTypes.object.isRequired,
};

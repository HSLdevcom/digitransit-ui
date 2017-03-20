import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import StopCode from './StopCode';
import LegAgencyInfo from './LegAgencyInfo';

class CallAgencyLeg extends React.Component {

  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  renderMain = () => {
    const originalTime = (
      this.props.leg.realTime &&
      this.props.leg.departureDelay >= this.context.config.itinerary.delayThreshold) &&
      [<br key="br" />, <span key="time" className="original-time">
        {moment(this.props.leg.startTime).subtract(this.props.leg.departureDelay, 's')
          .format('HH:mm')
        }
      </span>];

    const firstLegClassName = this.props.index === 0 ? ' start' : '';
    const modeClassName = 'call';

    return (
      <div>
        <div
          key={this.props.index}
          className="row itinerary-row"
        >
          <div className="itinerary-call-agency-warning" />
          <Link
            onClick={e => e.stopPropagation()}
            to={
          `/linjat/${this.props.leg.route.gtfsId}/pysakit/${
          this.props.leg.trip.pattern.code}/${this.props.leg.trip.gtfsId}`
          // TODO: Create a helper function for generationg links
        }
          >
            <div className="small-2 columns itinerary-time-column">
              <div className="itinerary-time-column-time">
                <span className={this.props.leg.realTime ? 'realtime' : ''}>
                  {this.props.leg.realTime &&
                  <Icon img="icon-icon_realtime" className="realtime-icon realtime" />}
                  {moment(this.props.leg.startTime).format('HH:mm')}
                </span>{originalTime}
              </div>
              <RouteNumber
                mode="call"
                className="call"
                realtime={false}
                vertical
                fadeLong
              />
            </div>
          </Link>
          <div
            onClick={this.props.focusAction}
            className={`small-10 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
          >
            <div className="itinerary-leg-first-row">
              <div>{this.props.leg.from.name}{this.stopCode(
            this.props.leg.from.stop && this.props.leg.from.stop.code)}
                <Icon
                  img="icon-icon_arrow-collapse--right"
                  className="itinerary-leg-first-row__arrow"
                />
              </div>
              <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
            </div>
            <div className="itinerary-transit-leg-route call">
              <span className="warning-message">Liikennöidään kutsujoukkoliikenteenä: <span className="route-name">{this.props.leg.route.longName}</span>,
          joka on tilattava etukäteen.
          <div className="itinerary-warning-agency-container"><LegAgencyInfo leg={this.props.leg} /></div>
                {this.props.leg.route.agency.phone ? (<div className="call-button"><Link href={`tel:${this.props.leg.route.agency.phone}`}>soita {this.props.leg.route.agency.phone}</Link></div>) : ''}
              </span>
            </div>
          </div>
        </div></div>);
  }

  render() {
    return (
      <div>
        {[].concat([this.renderMain()])}
      </div>);
  }
}

CallAgencyLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};


CallAgencyLeg.contextTypes = {
  focusFunction: React.PropTypes.func.isRequired,
  config: React.PropTypes.object.isRequired,
};


export default CallAgencyLeg;

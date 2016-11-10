import React, { PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import config from '../../../config';
import RouteNumber from '../../departure/RouteNumber';
import Icon from '../../icon/Icon';
import { durationToString } from '../../../util/timeUtils';
import StopCode from '../StopCode';

class TransitLeg extends React.Component {
  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  render() {
    const originalTime = (
      this.props.leg.realTime &&
      this.props.leg.departureDelay >= config.itinerary.delayThreshold) && [<br />,
        <span className="original-time">
          {moment(this.props.leg.startTime).subtract(
                  this.props.leg.departureDelay, 's').format('HH:mm')}
        </span>];

    const modeClassName =
      `${this.props.mode.toLowerCase()}${this.props.index === 0 ? ' from' : ''}`;


    return (<div
      key={this.props.index}
      style={{
        width: '100%',
      }}
      className="row itinerary-row"
    >
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
              {moment(this.props.leg.startTime).format('HH:mm')}
            </span>{originalTime}
          </div>
          <RouteNumber
            mode={this.props.mode.toLowerCase()}
            text={this.props.leg.route && this.props.leg.route.shortName}
            realtime={this.props.leg.realTime} vertical
          />
        </div>
      </Link>
      <div
        onClick={this.props.focusAction}
        className={`small-10 columns itinerary-instruction-column ${modeClassName}`}
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
        <div className="itinerary-transit-leg-route">
          {this.props.children}
        </div>
        <div className="itinerary-leg-intermediate-stops">
          <FormattedMessage
            id="number-of-intermediate-stops"
            values={{
              number: (this.props.leg.intermediateStops
                && this.props.leg.intermediateStops.length) || 0,
              duration: durationToString(this.props.leg.duration * 1000),
            }}
            defaultMessage="{number, plural, =0 {No intermediate stops}
              other {{number} stops} } ({duration})"
          />
        </div>
      </div>
    </div>);
  }
}

TransitLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  'leg.realTime': PropTypes.bool,
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};


export default TransitLeg;

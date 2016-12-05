import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import config from '../config';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import StopCode from './StopCode';

class TransitLeg extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showIntermediateStops: false,
    };
  }

  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  toggleShowIntermediateStops = () => {
    this.setState({ showIntermediateStops: !this.state.showIntermediateStops });
  }

  render() {
    const originalTime = (
      this.props.leg.realTime &&
      this.props.leg.departureDelay >= config.itinerary.delayThreshold) &&
      [<br />, <span className="original-time">
        {moment(this.props.leg.startTime).subtract(this.props.leg.departureDelay, 's')
          .format('HH:mm')
        }
      </span>];

    const modeClassName =
      `${this.props.mode.toLowerCase()}${this.props.index === 0 ? ' from' : ''}`;

    const IntermediateStop = ({ name, code, focusFunction }) => <li key={code} onClick={(e) => { e.stopPropagation(); focusFunction(e); }} className={`${modeClassName} itinerary-intermediate-stop`}><span className="itinerary-intermediate-stop-name">{name}</span> <StopCode code={code} /></li>;

    const IntermediateStopList = ({ leg, stops, toggleFunction, focusFunction }) =>
      <div className="intermediate-stop-info-container"><span className="intermediate-stops-link pointer-cursor" onClick={toggleFunction}><FormattedMessage
        id="itinerary-hide-stops"
        defaultMessage="Hide stops"
      /></span> <span className="intermediate-stops-duration">({durationToString(leg.duration * 1000)})</span>
        <ul className="itinerary-leg-intermediate-stops">
          {stops.map(stop => <IntermediateStop
            toggleFunction={toggleFunction}
            focusFunction={focusFunction({ lat: stop.lat, lon: stop.lon })} {...stop}
          />)}
        </ul>
      </div>;

    const StopInfo = ({ stops, leg, toggleFunction }) =>
      <div className="intermediate-stop-info-container"><span className="intermediate-stops-link pointer-cursor" onClick={toggleFunction}><FormattedMessage
        id="number-of-intermediate-stops"
        values={{
          number: (stops
          && stops.length) || 0,
        }}
        defaultMessage="{number, plural, =0 {No intermediate stops} other {{number} stops} }"
      /></span> <span className="intermediate-stops-duration">({durationToString(leg.duration * 1000)})</span></div>;

    const IntermediateStops = ({ stops, showStops, leg, toggleFunction, focusFunction }) =>
      (showStops && <IntermediateStopList
        toggleFunction={toggleFunction} focusFunction={focusFunction} stops={stops} leg={leg}
      />)
        || <StopInfo toggleFunction={toggleFunction} leg={leg} stops={stops} />;

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
        <div >
          <IntermediateStops
            toggleFunction={this.toggleShowIntermediateStops}
            leg={this.props.leg}
            stops={this.props.leg.intermediateStops}
            showStops={this.state.showIntermediateStops}
            focusFunction={this.context.focusFunction}
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

TransitLeg.contextTypes = {
  focusFunction: React.PropTypes.func.isRequired,
};


export default TransitLeg;

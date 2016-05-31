import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/icon-with-tail';
import moment from 'moment';
import cx from 'classnames';
import WalkDistance from '../itinerary/walk-distance';

class TripRouteStop extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  renderTime(realtimeDeparture) {
    const departureTime = this.context.getStore('TimeStore')
      .getCurrentTime().startOf('day').second(realtimeDeparture);
    return moment(departureTime).format('HH:mm');
  }

  render() {
    const vehicles = [];

    if (this.props.vehicle) {
      vehicles.push(
        <IconWithTail
          id="now"
          key={this.props.vehicle.id}
          className={cx(this.props.mode, 'large-icon')}
          img={`icon-icon_${this.props.mode}-live`}
        />);
    }

    const stopPassed = {
      passed: !this.props.stopPassed,
    };

    return (
      <div className={cx('route-stop row', stopPassed)}>
        <div className="columns small-3 route-stop-time">
          {this.renderTime(this.props.realtimeDeparture)}
          <div className="route-stop-now-icon">{vehicles}</div>
        </div>
        <Link to={`/pysakit/${this.props.stop.gtfsId}`}>
          <div className={`columns small-7 route-stop-name ${this.props.mode}`}>
            {this.props.stop.name}{"\u00a0"}
            {this.props.distance ?
              <WalkDistance
                className="nearest-route-stop"
                icon="icon_location-with-user"
                walkDistance={this.props.distance}
              /> : null}
            <br />
            <span className="route-stop-address">
              {this.props.stop.desc}
            </span>
          </div>
          <div className="columns small-2 route-stop-code">
            {this.props.stop.code}
          </div>
        </Link>
      </div>);
  }
}

TripRouteStop.propTypes = {
  vehicle: React.PropTypes.object,
  mode: React.PropTypes.string,
  stopPassed: React.PropTypes.bool,
  realtimeDeparture: React.PropTypes.number,
  stop: React.PropTypes.object,
  distance: React.PropTypes.number,
};

export default TripRouteStop;

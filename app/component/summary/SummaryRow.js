import React from 'react';
import moment from 'moment';
import cx from 'classnames';

import legTextUtil from '../../util/leg-text-util';
import { displayDistance } from '../../util/geo-utils';
import RouteNumber from '../departure/RouteNumber';
import Icon from '../icon/icon';
import RelativeDuration from '../duration/RelativeDuration';

export default function SummaryRow(props, { breakpoint }) {
  let mode;
  const data = props.data;
  const startTime = moment(data.startTime);
  const endTime = moment(data.endTime);
  const duration = endTime.diff(startTime);
  const legs = [];
  let realTimeAvailable = false;
  let noTransitLegs = true;

  for (const leg of data.legs) {
    if (leg.transitLeg || leg.rentedBike) {
      if (noTransitLegs && leg.realTime) {
        realTimeAvailable = true;
      }
      noTransitLegs = false;
      break;
    }
  }

  let lastLegRented = false;

  data.legs.forEach((leg, i) => {
    if (leg.rentedBike && lastLegRented) {
      return;
    }

    lastLegRented = leg.rentedBike;

    if (leg.transitLeg || leg.rentedBike || noTransitLegs) {
      mode = leg.mode;

      if (leg.rentedBike) {
        mode = 'CITYBIKE';
      }

      legs.push(
        <RouteNumber
          key={i}
          mode={mode}
          text={legTextUtil.getLegText(leg)}
          vertical className={cx('line', mode.toLowerCase())}
        />
      );
    }
  });

  let firstLegStartTime = null;

  if (!noTransitLegs) {
    let firstDeparture = false;
    if (data.legs[1] != null && !(data.legs[1].rentedBike || data.legs[0].transitLeg)) {
      firstDeparture = data.legs[1].startTime;
    }
    if (data.legs[0].transitLeg && !data.legs[0].rentedBike) {
      firstDeparture = data.legs[0].startTime;
    }
    if (firstDeparture) {
      firstLegStartTime = (
        <div className="itinerary-first-leg-start-time">
          {moment(firstDeparture).format('HH:mm')}
        </div>);
    }
  }


  const classes = cx(['itinerary-summary-row', 'cursor-pointer', {
    passive: props.passive,
    'bp-large': breakpoint === 'large',
  }]);

  return (
    <div
      className={classes}
      onClick={() => props.onSelect(props.hash)}
    >
      <div className="itinerary-duration-and-distance">
        <div className="itinerary-duration">
          <RelativeDuration duration={duration} />
        </div>
        <div className="itinerary-walking-distance">
          <Icon img="icon-icon_walk" viewBox="6 0 40 40" />
          {displayDistance(data.walkDistance)}
        </div>
      </div>
      {props.children ? props.children : [
        <div
          className={cx('itinerary-start-time', { 'realtime-available': realTimeAvailable })}
          key="startTime"
        >
          {startTime.format('HH:mm')}
          {firstLegStartTime}
        </div>,
        <div className="itinerary-legs" key="legs">
          {legs}
        </div>,
        <div className="itinerary-end-time" key="endtime">
          {endTime.format('HH:mm')}
        </div>,
        <div className="action-arrow" key="arrow">
          <Icon img="icon-icon_arrow-collapse--right" />
        </div>,
      ]}
    </div>);
}


SummaryRow.propTypes = {
  data: React.PropTypes.object.isRequired,
  passive: React.PropTypes.bool.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  hash: React.PropTypes.number.isRequired,
  children: React.PropTypes.node,
};

SummaryRow.contextTypes = {
  breakpoint: React.PropTypes.string,
};

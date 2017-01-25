import React from 'react';
import moment from 'moment';
import cx from 'classnames';
import getContext from 'recompose/getContext';
import { FormattedMessage, intlShape } from 'react-intl';

import { sameDay, dateOrEmpty } from '../util/timeUtils';
import { displayDistance } from '../util/geo-utils';
import RouteNumber from './RouteNumber';
import RouteNumberContainer from './RouteNumberContainer';
import Icon from './Icon';
import RelativeDuration from './RelativeDuration';
import ComponentUsageExample from './ComponentUsageExample';

const SummaryRow = (props, { intl: { formatMessage } }) => {
  let mode;
  let routeNumber;
  const data = props.data;
  const refTime = moment(props.refTime);
  const startTime = moment(data.startTime);
  const endTime = moment(data.endTime);
  const duration = endTime.diff(startTime);
  const legs = [];
  let realTimeAvailable = false;
  let noTransitLegs = true;

  data.legs.forEach((leg) => {
    if (leg.transitLeg || leg.rentedBike) {
      if (noTransitLegs && leg.realTime) {
        realTimeAvailable = true;
      }
      noTransitLegs = false;
    }
  });

  let lastLegRented = false;

  data.legs.forEach((leg) => {
    if (leg.rentedBike && lastLegRented) {
      return;
    }

    lastLegRented = leg.rentedBike;

    if (leg.transitLeg || leg.rentedBike || noTransitLegs) {
      mode = leg.mode;

      if (leg.rentedBike) {
        mode = 'CITYBIKE';
      }

      if (leg.route) {
        routeNumber = (
          <RouteNumberContainer
            route={leg.route}
            className={cx('line', mode.toLowerCase())}
            vertical
          />
        );
      } else {
        routeNumber = (
          <RouteNumber
            mode={mode}
            text={''}
            className={cx('line', mode.toLowerCase())}
            vertical
          />
        );
      }

      legs.push(
        <div key={`${leg.mode}_${leg.startTime}`} className="leg">
          {props.breakpoint === 'large' &&
            <div className="departure-stop overflow-fade">
              &nbsp;{(leg.transitLeg || leg.rentedBike) && leg.from.name}
            </div>
          }
          {routeNumber}
        </div>,
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
    'bp-large': props.breakpoint === 'large',
    open: props.open || props.children,
  }]);

  const itineraryLabel = formatMessage({ id: 'itinerary-page.title', defaultMessage: 'Itinerary' });

  return (
    <div
      className={classes}
      onClick={() => props.onSelect(props.hash)}
    >
      <div className="itinerary-duration-and-distance">
        <span className="itinerary-duration">
          <RelativeDuration duration={duration} />
        </span>
        <div className="itinerary-walking-distance">
          <Icon img="icon-icon_walk" viewBox="6 0 40 40" />
          {displayDistance(data.walkDistance)}
        </div>
      </div>
      {props.open || props.children ? [
        <div className="flex-grow itinerary-heading">
          <FormattedMessage
            key="title"
            id="itinerary-page.title"
            defaultMessage="Itinerary"
            tagName="h2"
          />
        </div>,
        <button
          title={itineraryLabel}
          key="arrow"
          className="action-arrow-click-area noborder flex-vertical"
          onClick={(e) => {
            e.stopPropagation();
            props.onSelectImmediately(props.hash);
          }}
        >
          <div className="action-arrow flex-grow">
            <Icon img="icon-icon_arrow-collapse--right" />
          </div>
        </button>,
        props.children,
      ] : [
        <div
          className={cx('itinerary-start-time', { 'realtime-available': realTimeAvailable })}
          key="startTime"
        >
          <span className={cx('itinerary-start-date', { nobg: sameDay(startTime, refTime) })} >
            <span>
              {dateOrEmpty(startTime, refTime)}
            </span>
          </span>
          {startTime.format('HH:mm')}
          {firstLegStartTime}
        </div>,
        <div className="itinerary-legs" key="legs">
          {legs}
        </div>,
        <div className="itinerary-end-time" key="endtime">
          {endTime.format('HH:mm')}
        </div>,
        <button
          title={itineraryLabel}
          key="arrow"
          className="action-arrow-click-area flex-vertical noborder"
          onClick={(e) => {
            e.stopPropagation();
            props.onSelectImmediately(props.hash);
          }}
        >
          <div className="action-arrow flex-grow">
            <Icon img="icon-icon_arrow-collapse--right" />
          </div>
        </button>,
      ]}
    </div>);
};


SummaryRow.propTypes = {
  refTime: React.PropTypes.number.isRequired,
  data: React.PropTypes.object.isRequired,
  passive: React.PropTypes.bool,
  onSelect: React.PropTypes.func.isRequired,
  onSelectImmediately: React.PropTypes.func.isRequired,
  hash: React.PropTypes.number.isRequired,
  children: React.PropTypes.node,
  open: React.PropTypes.bool,
  breakpoint: React.PropTypes.string.isRequired,
};

SummaryRow.contextTypes = {
  intl: intlShape.isRequired,
};

SummaryRow.displayName = 'SummaryRow';

const exampleData = t1 => ({
  startTime: t1,
  endTime: t1 + 10000,
  walkDistance: 770,
  legs: [
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 10000,
      endTime: t1 + 20000,
      mode: 'WALK',
      distance: 483.84600000000006,
      duration: 438,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 20000,
      endTime: t1 + 30000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 30000,
      endTime: t1 + 40000,
      mode: 'WALK',
      distance: 291.098,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Veturitie' },
    },
  ],
});

const nop = () => {};

SummaryRow.description = () => {
  const today = moment().hour(12).minute(34).second(0)
    .valueOf();
  const date = 1478611781000;
  return (
    <div>
      <p>
      Displays a summary of an itinerary.
    </p>
      <ComponentUsageExample description="passive-small-today">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-small-today">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="passive-large-today">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-large-today">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="passive-small-tomorrow">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(date)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-small-tomorrow">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="passive-large-tomorrow">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-large-tomorrow">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="open-large-today">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          open
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="open-large-tomorrow">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          open
        />
      </ComponentUsageExample>
    </div>
  );
};

const withBreakPoint = getContext({
  breakpoint: React.PropTypes.string.isRequired })(SummaryRow);

export { SummaryRow as component, withBreakPoint as default };

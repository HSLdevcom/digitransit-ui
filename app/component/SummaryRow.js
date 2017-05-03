import React from 'react';
import moment from 'moment';
import cx from 'classnames';
import getContext from 'recompose/getContext';
import { FormattedMessage, intlShape } from 'react-intl';
import isEqual from 'lodash/isEqual';

import { sameDay, dateOrEmpty } from '../util/timeUtils';
import { displayDistance } from '../util/geo-utils';
import RouteNumber from './RouteNumber';
import RouteNumberContainer from './RouteNumberContainer';
import Icon from './Icon';
import RelativeDuration from './RelativeDuration';
import ComponentUsageExample from './ComponentUsageExample';
import { isCallAgencyPickupType } from '../util/legUtils';

const Leg = ({ routeNumber, leg, large }) => (
  <div className={`leg ${large ? 'large' : ''}`}>
    { large &&
      <div className="departure-stop overflow-fade">
        &nbsp;{(leg.transitLeg || leg.rentedBike) && leg.from.name}
      </div>
    }
    {routeNumber}
  </div>
);

Leg.propTypes = {
  routeNumber: React.PropTypes.node.isRequired,
  leg: React.PropTypes.object.isRequired,
  large: React.PropTypes.bool.isRequired,
};

const RouteLeg = ({ leg, large, intl }) => {
  const isCallAgency = isCallAgencyPickupType(leg);

  let routeNumber;
  if (isCallAgency) {
    const message = intl.formatMessage({
      id: 'pay-attention',
      defaultMessage: 'Pay Attention',
    });
    routeNumber = (<RouteNumber
      large={large}
      mode="call"
      text={message}
      className={cx('line', 'call')}
      vertical
      withBar
    />);
  } else {
    routeNumber =
    (<RouteNumberContainer
      route={leg.route}
      className={cx('line', leg.mode.toLowerCase())}
      large={large}
      vertical
      withBar
    />);
  }

  return <Leg leg={leg} routeNumber={routeNumber} large={large} />;
};

RouteLeg.propTypes = {
  leg: React.PropTypes.object.isRequired,
  large: React.PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const ModeLeg = ({ leg, mode, large }) => {
  const routeNumber = (
    <RouteNumber
      mode={mode}
      text={''}
      className={cx('line', mode.toLowerCase())}
      vertical
    />
  );
  return <Leg leg={leg} routeNumber={routeNumber} large={large} />;
};

ModeLeg.propTypes = {
  leg: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  large: React.PropTypes.bool.isRequired,
};

const CityBikeLeg = ({ leg, large }) => (
  <ModeLeg leg={leg} mode="CITYBIKE" large={large} />
);

CityBikeLeg.propTypes = {
  leg: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  large: React.PropTypes.bool.isRequired,
};

const ViaLeg = ({ leg }) => (
  <div key={`${leg.mode}_${leg.startTime}`} className="leg via">
    <Icon img="icon-icon_place" className="itinerary-icon place" />
  </div>
);

ViaLeg.propTypes = {
  leg: React.PropTypes.object.isRequired,
};

const SummaryRow = (props, { intl, intl: { formatMessage } }) => {
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

    const large = props.breakpoint === 'large';

    if (leg.transitLeg || leg.rentedBike || noTransitLegs || leg.intermediatePlace) {
      if (leg.rentedBike) {
        legs.push(<ModeLeg key={`${leg.mode}_${leg.startTime}`} leg={leg} mode="CITYBIKE" large={large} />);
      } else if (leg.intermediatePlace) {
        legs.push(<ViaLeg key={`${leg.mode}_${leg.startTime}`} leg={leg} />);
      } else if (leg.route) {
        if (props.intermediatePlaces && props.intermediatePlaces.length > 0 && isEqual(
          [leg.from.lat, leg.from.lon],
          [props.intermediatePlaces[0].lat, props.intermediatePlaces[0].lon])
        ) {
          legs.push(<ViaLeg leg={leg} />);
        }
        legs.push(<RouteLeg key={`${leg.mode}_${leg.startTime}`} leg={leg} intl={intl} large={large} />);
      } else {
        legs.push(<ModeLeg key={`${leg.mode}_${leg.startTime}`} leg={leg} mode={leg.mode} large={large} />);
      }
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
        <div className={cx('itinerary-first-leg-start-time', { realtime: realTimeAvailable })}>
          {realTimeAvailable && <Icon img="icon-icon_realtime" className="realtime-icon realtime" />}
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
        <div className="flex-grow itinerary-heading" key="title">
          <FormattedMessage
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
        props.children &&
          React.cloneElement(React.Children.only(props.children), { searchTime: props.refTime }),
      ] : [
        <div
          className="itinerary-start-time"
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
  intermediatePlaces: React.PropTypes.array,
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

const exampleDataVia = t1 => ({
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
      transitLeg: true,
      startTime: t1 + 30000,
      endTime: t1 + 40000,
      mode: 'WALK',
      intermediatePlace: true,
      distance: 586.4621425755712,
      duration: 600,
      rentedBike: false,
      route: null,
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 40000,
      endTime: t1 + 50000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 50000,
      endTime: t1 + 60000,
      mode: 'WALK',
      distance: 291.098,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
  ],
});

const exampleDataCallAgency = t1 => ({
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
      from: { name: 'Ilmattarentie', stop: { gtfsId: 'start' } },
      to: { name: 'Joku Pysäkki', stop: { gtfsId: 'end' } },
      trip: {
        stoptimes: [
          { pickupType: 'CALL_AGENCY',
            stop: { gtfsId: 'start' } },
        ],
      },
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
      <ComponentUsageExample description="passive-small-via">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataVia(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-large-via">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataVia(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="passive-small-call-agency">
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataCallAgency(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="active-large-call-agency">
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataCallAgency(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
      </ComponentUsageExample>
    </div>
  );
};

const withBreakPoint = getContext({
  breakpoint: React.PropTypes.string.isRequired })(SummaryRow);

export { SummaryRow as component, withBreakPoint as default };

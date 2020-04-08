import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import StopCode from './StopCode';
import LegAgencyInfo from './LegAgencyInfo';
import ItineraryCircleLine from './ItineraryCircleLine';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

class CallAgencyLeg extends React.Component {
  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const originalTime = this.props.leg.realTime &&
      this.props.leg.departureDelay >=
        this.context.config.itinerary.delayThreshold && [
        <br key="br" />,
        <span key="time" className="original-time">
          {moment(this.props.leg.startTime)
            .subtract(this.props.leg.departureDelay, 's')
            .format('HH:mm')}
        </span>,
      ];

    const firstLegClassName = this.props.index === 0 ? ' start' : '';
    const modeClassName = 'call';

    return (
      <div className="row itinerary-row">
        <div className="itinerary-call-agency-warning" />
        <div className="small-2 columns itinerary-time-column call">
          <Link
            onClick={e => e.stopPropagation()}
            to={
              `/${PREFIX_ROUTES}/${
                this.props.leg.route.gtfsId
              }/${PREFIX_STOPS}/${this.props.leg.trip.pattern.code}
              /${this.props.leg.trip.gtfsId}`
              // TODO: Create a helper function for generationg links
            }
          >
            <div className="itinerary-time-column-time">
              <span>{moment(this.props.leg.startTime).format('HH:mm')}</span>
              {originalTime}
            </div>
            <RouteNumber
              mode="call"
              className="leg-call"
              realtime={false}
              gtfsId={this.props.leg.route.gtfsId}
              vertical
              fadeLong
            />
          </Link>
        </div>
        <ItineraryCircleLine
          index={this.props.index}
          modeClassName={modeClassName}
        />
        <div
          onClick={this.props.focusAction}
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
        >
          <div className="itinerary-leg-first-row">
            <div>
              {this.props.leg.from.name}
              {this.stopCode(
                this.props.leg.from.stop && this.props.leg.from.stop.code,
              )}
            </div>
            <Icon
              img="icon-icon_search-plus"
              className="itinerary-search-icon"
            />
          </div>
          <div className="itinerary-transit-leg-route call">
            <span className="warning-message">
              <FormattedMessage
                id="warning-call-agency"
                values={{
                  routeName: (
                    <span className="route-name">
                      {this.props.leg.route.longName}
                    </span>
                  ),
                }}
                defaultMessage={
                  'Only on demand: {routeName}, which needs to be booked in advance.'
                }
              />
              {this.props.leg.route.desc ? (
                <div className="itinerary-warning-route-description">
                  {this.props.leg.route.desc}
                </div>
              ) : (
                ''
              )}
              <div className="itinerary-warning-agency-container">
                <LegAgencyInfo leg={this.props.leg} />
              </div>
              {this.props.leg.route.agency.phone ? (
                <div className="call-button">
                  <Link href={`tel:${this.props.leg.route.agency.phone}`}>
                    <FormattedMessage id="call" defaultMessage="Call" />{' '}
                    {this.props.leg.route.agency.phone}
                  </Link>
                </div>
              ) : (
                ''
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

const exampleData = t1 => ({
  realTime: false,
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  mode: 'BUS',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  route: {
    longName: 'Leppävaara - Tapiola',
    agency: { phone: '09-555' },
    gtfsId: 'xxx',
    shortName: '57',
    mode: 'BUS',
  },
  from: { name: 'Ilmattarentie', stop: { gtfsId: 'start' } },
  to: { name: 'Joku Pysäkki', stop: { gtfsId: 'end' } },
  trip: {
    gtfsId: 'xxx',
    pattern: {
      code: 'xxx',
    },
    stoptimes: [
      {
        pickupType: 'CALL_AGENCY',
        stop: { gtfsId: 'start' },
      },
    ],
  },
});

CallAgencyLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary bus leg.</p>
      <ComponentUsageExample description="normal">
        <CallAgencyLeg
          leg={exampleData(today)}
          index={1}
          focusAction={() => {}}
        />
      </ComponentUsageExample>exampleData
    </div>
  );
};

CallAgencyLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

CallAgencyLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CallAgencyLeg;

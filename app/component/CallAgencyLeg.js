import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import StopCode from './StopCode';
import LegAgencyInfo from './LegAgencyInfo';
import ItineraryCircleLine from './ItineraryCircleLine';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { localizeTime } from '../util/timeUtils';

class CallAgencyLeg extends React.Component {
  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const originalTime = this.props.leg.realTime &&
      this.props.leg.departureDelay >=
        this.context.config.itinerary.delayThreshold && [
        <br key="br" />,
        <span key="time" className="original-time">
          {localizeTime(
            this.props.leg.startTime - this.props.leg.departureDelay * 1000,
          )}
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
              `/${PREFIX_ROUTES}/${this.props.leg.route.gtfsId}/${PREFIX_STOPS}/${this.props.leg.trip.pattern.code}
              /${this.props.leg.trip.gtfsId}`
              // TODO: Create a helper function for generationg links
            }
          >
            <div className="itinerary-time-column-time">
              <span>{localizeTime(this.props.leg.startTime)}</span>
              {originalTime}
            </div>
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
              img="icon-icon_show-on-map"
              className="itinerary-search-icon"
            />
          </div>
          <div className="itinerary-transit-leg-route call">
            <RouteNumber
              mode="call"
              className="leg-call"
              realtime={false}
              vertical
              fadeLong
            />
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
                defaultMessage="Only on demand: {routeName}, which needs to be booked in advance."
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
                  <a href={`tel:${this.props.leg.route.agency.phone}`}>
                    <FormattedMessage id="call" defaultMessage="Call" />{' '}
                    {this.props.leg.route.agency.phone}
                  </a>
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

CallAgencyLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

CallAgencyLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CallAgencyLeg;

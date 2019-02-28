import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import RouteNumber from './RouteNumber';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import StopCode from './StopCode';
import LegAgencyInfo from './LegAgencyInfo';
import IntermediateLeg from './IntermediateLeg';
import PlatformNumber from './PlatformNumber';
import ItineraryCircleLine from './ItineraryCircleLine';
import { PREFIX_ROUTES } from '../util/path';
import { legHasCancelation } from '../util/alertUtils';

class TransitLeg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIntermediateStops: false,
    };
  }

  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  toggleShowIntermediateStops = () => {
    window.dataLayer.push({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'IntermediateStopsClick',
      name: this.state.showIntermediateStops
        ? 'IntermediateStopsCollapse'
        : 'IntermediateStopsExpand',
    });

    this.setState(prevState => ({
      showIntermediateStops: !prevState.showIntermediateStops,
    }));
  };

  renderIntermediate() {
    const { leg, mode } = this.props;
    if (
      leg.intermediatePlaces.length > 0 &&
      this.state.showIntermediateStops === true
    ) {
      const stopList = leg.intermediatePlaces.map((place, i, array) => {
        const isFirstPlace = i === 0;
        const isLastPlace = i === array.length - 1;

        const previousZoneId =
          (array[i - 1] && array[i - 1].stop.zoneId) ||
          (isFirstPlace && leg.from.stop.zoneId);
        const currentZoneId = place.stop.zoneId;
        const nextZoneId =
          (array[i + 1] && array[i + 1].stop.zoneId) ||
          (isLastPlace && leg.to.stop.zoneId);

        const previousZoneIdDiffers =
          previousZoneId && previousZoneId !== currentZoneId;
        const nextZoneIdDiffers = nextZoneId && nextZoneId !== currentZoneId;
        const showCurrentZoneId = previousZoneIdDiffers || nextZoneIdDiffers;

        return (
          <IntermediateLeg
            color={leg.route ? `#${leg.route.color}` : 'currentColor'}
            key={place.stop.gtfsId}
            mode={mode}
            name={place.stop.name}
            arrivalTime={place.arrivalTime}
            realTime={leg.realTime}
            stopCode={place.stop.code}
            focusFunction={this.context.focusFunction({
              lat: place.stop.lat,
              lon: place.stop.lon,
            })}
            showZoneLimits={this.context.config.itinerary.showZoneLimits}
            showCurrentZoneDelimiter={previousZoneIdDiffers}
            previousZoneId={
              (isFirstPlace && previousZoneIdDiffers && previousZoneId) ||
              undefined
            }
            currentZoneId={(showCurrentZoneId && currentZoneId) || undefined}
            nextZoneId={
              (isLastPlace && nextZoneIdDiffers && nextZoneId) || undefined
            }
          />
        );
      });
      return <div className="itinerary-leg-container">{stopList}</div>;
    }
    return null;
  }

  renderMain = () => {
    const { children, focusAction, index, leg, mode } = this.props;
    const originalTime = leg.realTime &&
      leg.departureDelay &&
      leg.departureDelay >= this.context.config.itinerary.delayThreshold && [
        <br key="br" />,
        <span key="time" className="original-time">
          {moment(leg.startTime)
            .subtract(leg.departureDelay, 's')
            .format('HH:mm')}
        </span>,
      ];

    const firstLegClassName = index === 0 ? ' start' : '';
    /* const modeClassName =
      `${this.props.mode.toLowerCase()}${this.props.index === 0 ? ' from' : ''}`;
    */
    const modeClassName = mode.toLowerCase();
    const StopInfo = ({ stops, leg: stopLeg, toggleFunction }) => {
      const stopCount = (stops && stops.length) || 0;
      const message = (this.state.showIntermediateStops && (
        <FormattedMessage
          id="itinerary-hide-stops"
          defaultMessage="Hide stops"
        />
      )) || (
        <FormattedMessage
          id="number-of-intermediate-stops"
          values={{
            number: (stops && stops.length) || 0,
          }}
          defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
        />
      );
      /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
      return (
        <div className="intermediate-stop-info-container">
          {stopCount === 0 ? (
            <span className="intermediate-stop-no-stops">{message}</span>
          ) : (
            <span
              className="intermediate-stops-link pointer-cursor"
              onClick={event => {
                event.stopPropagation();
                toggleFunction();
              }}
            >
              {message}
            </span>
          )}{' '}
          <span className="intermediate-stops-duration">
            ({durationToString(stopLeg.duration * 1000)})
          </span>
        </div>
      );
    };

    const isCanceled = legHasCancelation(leg);
    return (
      <div key={index} className="row itinerary-row">
        <div className="small-2 columns itinerary-time-column">
          <Link
            onClick={e => e.stopPropagation()}
            to={
              `/${PREFIX_ROUTES}/${leg.route.gtfsId}/pysakit/${
                leg.trip.pattern.code
              }/${leg.trip.gtfsId}`
              // TODO: Create a helper function for generationg links
            }
          >
            <div className="itinerary-time-column-time">
              <span>{moment(leg.startTime).format('HH:mm')}</span>
              {originalTime}
            </div>
            <RouteNumber //  shouldn't this be a route number container instead???
              mode={mode.toLowerCase()}
              color={leg.route ? `#${leg.route.color}` : 'currentColor'}
              hasDisruption={isCanceled}
              text={leg.route && leg.route.shortName}
              realtime={leg.realTime}
              vertical
              fadeLong
            />
          </Link>
        </div>
        <ItineraryCircleLine
          index={index}
          modeClassName={modeClassName}
          color={leg.route ? `#${leg.route.color}` : 'currentColor'}
        />
        <div
          style={{
            color: leg.route ? `#${leg.route.color}` : 'currentColor',
          }}
          onClick={focusAction}
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
        >
          <div className="itinerary-leg-first-row">
            <div>
              {leg.from.name}
              {this.stopCode(leg.from.stop && leg.from.stop.code)}
              <PlatformNumber
                number={leg.from.stop.platformCode}
                short={false}
              />
            </div>
            <Icon
              img="icon-icon_search-plus"
              className="itinerary-search-icon"
            />
          </div>
          <div className="itinerary-transit-leg-route">{children}</div>
          <LegAgencyInfo leg={leg} />
          <div>
            <StopInfo
              toggleFunction={this.toggleShowIntermediateStops}
              leg={leg}
              stops={leg.intermediatePlaces}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.renderMain()}
        {this.renderIntermediate()}
      </React.Fragment>
    );
  }
}

TransitLeg.propTypes = {
  leg: PropTypes.shape({
    realtimeState: PropTypes.string,
    realTime: PropTypes.bool,
    from: PropTypes.shape({
      stop: PropTypes.shape({
        code: PropTypes.string,
        platformCode: PropTypes.string,
        zoneId: PropTypes.string,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      shortName: PropTypes.string,
      color: PropTypes.string,
    }).isRequired,
    to: PropTypes.shape({
      stop: PropTypes.shape({
        zoneId: PropTypes.string,
      }).isRequired,
    }).isRequired,
    trip: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    startTime: PropTypes.number.isRequired,
    departureDelay: PropTypes.number,
    intermediatePlaces: PropTypes.arrayOf(
      PropTypes.shape({
        arrivalTime: PropTypes.number.isRequired,
        stop: PropTypes.shape({
          gtfsId: PropTypes.string.isRequired,
          code: PropTypes.string,
          platformCode: PropTypes.string,
          zoneId: PropTypes.string,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

TransitLeg.contextTypes = {
  focusFunction: PropTypes.func.isRequired,
  config: PropTypes.shape({
    itinerary: PropTypes.shape({
      delayThreshold: PropTypes.number,
      showZoneLimits: PropTypes.bool,
    }).isRequired,
  }).isRequired,
};

export default TransitLeg;

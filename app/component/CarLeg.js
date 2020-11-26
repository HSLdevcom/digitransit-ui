import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import { isKeyboardSelectionEvent } from '../util/browser';
import ServiceAlertIcon from './ServiceAlertIcon';
import { AlertSeverityLevelType } from '../constants';
import { replaceQueryParams } from '../util/queryUtils';
import { getServiceAlertDescription } from '../util/alertUtils';

function CarLeg(props, context) {
  const { leg } = props;
  const distance = displayDistance(parseInt(leg.distance, 10), context.config);
  const duration = durationToString(leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'start' : '';
  const modeClassName = 'car';

  const alerts = leg.alerts || [];
  const carParkAlert = alerts.filter(a => a.alertId === 'car_park_full')[0];

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.car-leg"
          values={{
            time: moment(leg.startTime).format('HH:mm'),
            distance,
            origin: leg.from ? leg.from.name : '',
            destination: leg.to ? leg.to.name : '',
            duration,
          }}
        />
      </span>
      <div className="small-2 columns itinerary-time-column" aria-hidden="true">
        <div className="itinerary-time-column-time">
          {moment(leg.startTime).format('HH:mm')}
        </div>
      </div>
      <ItineraryCircleLine index={props.index} modeClassName={modeClassName} />
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${leg.mode.toLowerCase()}`}
      >
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.from.name || '' }}
          />
          {!!carParkAlert && (
            <FormattedMessage id="itinerary-details.route-has-info-alert" />
          )}
        </span>
        <div className="itinerary-leg-first-row" aria-hidden="true">
          <div>
            {leg.from.name}
            {props.children}
          </div>
          <div
            className="itinerary-map-action"
            onClick={props.focusAction}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && props.focusAction(e)
            }
            role="button"
            tabIndex="0"
          >
            <Icon
              img="icon-icon_show-on-map"
              className="itinerary-search-icon"
            />
          </div>
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
          <FormattedMessage
            id="car-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Drive {distance} ({duration})}"
          />
        </div>
        {carParkAlert && (
          <div className="itinerary-alert-box" aria-hidden="true">
            <div className="itinerary-alert-info carpool">
              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={AlertSeverityLevelType.Info}
              />
              {getServiceAlertDescription(carParkAlert, context.intl.locale)}
            </div>
            <button
              className="standalone-btn cursor-pointer carpool-offer-btn"
              onClick={() => {
                replaceQueryParams(context.router, {
                  useCarParkAvailabilityInformation: true,
                });
              }}
            >
              <FormattedMessage id="car-park-full" />
            </button>
          </div>
        )}
        <div className="itinerary-leg-action" aria-hidden="true">
          <button
            className="standalone-btn"
            onClick={props.toggleCarpoolDrawer}
          >
            <FormattedMessage id="offer-ride" defaultMessage="Offer carpool" />
          </button>
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  duration: 900,
  startTime: t1 + 20000,
  distance: 5678,
  from: { name: 'Ratsukuja', stop: { code: 'E1102' } },
  mode: 'CAR',
});

CarLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0).valueOf();
  return (
    <div>
      <p>Displays an itinerary car leg.</p>
      <ComponentUsageExample>
        <CarLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

CarLeg.propTypes = {
  leg: PropTypes.shape({
    duration: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    distance: PropTypes.number.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      stop: PropTypes.shape({
        code: PropTypes.string,
      }),
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    mode: PropTypes.string.isRequired,
    alerts: PropTypes.array,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  toggleCarpoolDrawer: PropTypes.func,
};

CarLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default CarLeg;

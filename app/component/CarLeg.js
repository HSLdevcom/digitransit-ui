import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import { isKeyboardSelectionEvent } from '../util/browser';
import ServiceAlertIcon from './ServiceAlertIcon';
import { AlertSeverityLevelType } from '../constants';
import { replaceQueryParams } from '../util/queryUtils';
import { getServiceAlertDescription } from '../util/alertUtils';
import DelayedTime from './DelayedTime';

function CarLeg(props, { config, intl, router, match, executeAction }) {
  const { leg } = props;
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'start' : '';
  const modeClassName = 'car';

  const [address, place] = props.leg.from.name.split(/, (.+)/); // Splits the name-string to two parts from the first occurance of ', '

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
          <DelayedTime
            leg={props.previousLeg}
            delay={props.previousLeg && props.previousLeg.arrivalDelay}
            startTime={props.startTime}
          />
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
          <div className="address-container">
            <div className="address">
              {address}
              {leg.from.stop && (
                <Icon
                  img="icon-icon_arrow-collapse--right"
                  className="itinerary-arrow-icon"
                  color="#333"
                />
              )}
            </div>
            <div className="place">{place}</div>
          </div>
          <div>{props.children}</div>
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
              {getServiceAlertDescription(carParkAlert, intl.locale)}
            </div>
            <button
              type="button"
              className="standalone-btn cursor-pointer carpool-offer-btn"
              onClick={() => {
                replaceQueryParams(
                  router,
                  match,
                  {
                    useCarParkAvailabilityInformation: true,
                  },
                  executeAction,
                );
              }}
            >
              <FormattedMessage id="car-park-full" />
            </button>
          </div>
        )}
        <div className="itinerary-leg-action" aria-hidden="true">
          <button
            type="button"
            className="standalone-btn cursor-pointer carpool-offer-btn"
            onClick={props.toggleCarpoolDrawer}
          >
            <FormattedMessage id="offer-ride" defaultMessage="Offer carpool" />
          </button>
        </div>
        {leg.to.vehicleParkingWithEntrance?.vehicleParking.tags.includes(
          'state:few',
        ) && (
          <div>
            <div className="itinerary-alert-info carpool">
              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={AlertSeverityLevelType.Info}
              />
              <FormattedMessage id="car-park-capacity-alert" />
            </div>
            <div className="carparks-exclude-container">
              <button
                type="button"
                className="standalone-btn cursor-pointer carparks-exclude-btn"
                onClick={() => {
                  replaceQueryParams(router, match, {
                    bannedVehicleParkingTags: 'state:few',
                  });
                }}
              >
                <FormattedMessage
                  id="exclude-full-carparks"
                  defaultMessage="Exclude full car parks"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
      vehicleParkingWithEntrance: PropTypes.shape({
        vehicleParking: PropTypes.shape({
          tags: PropTypes.array,
        }),
      }),
    }),
    mode: PropTypes.string.isRequired,
    alerts: PropTypes.array,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  toggleCarpoolDrawer: PropTypes.func,
  startTime: PropTypes.number.isRequired,
  previousLeg: PropTypes.shape({
    arrivalDelay: PropTypes.number,
  }),
};

CarLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default CarLeg;

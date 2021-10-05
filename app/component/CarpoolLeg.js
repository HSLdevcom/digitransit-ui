import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import moment from 'moment';
import React from 'react';
import cx from 'classnames';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

function CarpoolLeg(props, { config, intl }) {
  const { leg } = props;
  const [address, place] = leg.from.name.split(/, (.+)/); // Splits the name-string to two parts from the first occurance of ', '
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const duration = durationToString(leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'start' : '';
  const modeClassName = 'carpool';

  // Checks if route only has letters without identifying numbers and
  // length doesn't fit in the tab view
  const hasNoShortName =
    leg.route.shortName &&
    new RegExp(/^([^0-9]*)$/).test(leg.route.shortName) &&
    leg.route.shortName.length > 3;

  return (
    <div key={props.index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.carpool-leg"
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
        <div
          className={cx('itinerary-transit-leg-route', 'route-number', {
            'long-name': hasNoShortName,
          })}
        >
          <span aria-hidden="true">
            <Icon
              img="icon-icon_carpool"
              className="carpool carpool-itinerary"
              ariaLabel={modeClassName}
            />
          </span>
          <div className="headsign">
            {CarpoolLeg.drawIcons(leg.route.agency)} {leg.to.name}
          </div>
        </div>
        <div className="itinerary-leg-action" aria-hidden="true">
          <FormattedMessage
            id="carpool-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Ride {distance} ({duration})}"
          />
          <br />
          {CarpoolLeg.createBookButton(leg.route)}
        </div>
      </div>
    </div>
  );
}

CarpoolLeg.createBookButton = route => {
  if (route.url) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={route.url}>
        <FormattedMessage id="details" defaultMessage="Details" />
      </a>
    );
  }
  return <span />;
};

CarpoolLeg.drawIcons = agency => {
  if (agency.gtfsId === 'mfdz:fg') {
    return (
      <>
        <Icon
          img="fg_icon"
          className="carpool-agency-logo"
          ariaLabel={agency.name}
        />
        <Icon
          img="adac_icon"
          className="carpool-agency-logo"
          ariaLabel="ADAC Mitfahrclub"
        />
      </>
    );
  }
  return (
    <Icon
      img="mifaz_icon-without-text"
      className="carpool-agency-logo"
      ariaLabel={agency.name}
    />
  );
};

CarpoolLeg.propTypes = {
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
    route: PropTypes.shape({
      url: PropTypes.string,
      shortName: PropTypes.string,
      agency: PropTypes.shape({
        gtfsId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
};

CarpoolLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
};

export default CarpoolLeg;

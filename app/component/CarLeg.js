import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import LazilyLoad, { importLazy } from './LazilyLoad';
import { getDrawerWidth } from '../util/browser';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import ToggleButton from './ToggleButton';

function CarLeg(props, context) {
  const distance = displayDistance(
    parseInt(props.leg.distance, 10),
    context.config,
  );
  const duration = durationToString(props.leg.duration * 1000);
  const firstLegClassName = props.index === 0 ? 'start' : '';

  const carpoolAgencyIcon = [];
  if (props.leg.mode === 'CARPOOL') {
    if (props.leg.route.agency.gtfsId === 'mfdz:fg') {
      carpoolAgencyIcon[0] = 'fg_icon';
      carpoolAgencyIcon[1] = 'adac_icon';
    } else if (props.leg.route.agency.gtfsId === 'mfdz:mifaz') {
      carpoolAgencyIcon[0] = 'mifaz_icon-without-text';
    }
  }

  const carpoolOfferModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    CustomizeSearch: () => importLazy(import('./CarpoolOffer')),
  };

  let isOpen = false;
  function toggleOfferCarpool() {
    isOpen = !isOpen;
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={props.index} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={props.leg.mode.toLowerCase()} vertical />
      </div>
      <ItineraryCircleLine
        index={props.index}
        modeClassName={CarLeg.getModeClassName(props.leg.mode)}
      />
      <div
        onClick={props.focusAction}
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${props.leg.mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {props.leg.from.name}
            {props.children}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id={CarLeg.getTranslationKey(props.leg.mode)}
            values={{ distance, duration }}
            defaultMessage="Drive {distance} ({duration})}"
          />
          <br />
          {
            <ToggleButton
              className="standalone-btn"
              title="offer-ride" // tooltip
              showButtonTitle
              label="offer-ride" // button text
              onBtnClick={toggleOfferCarpool}
            />
          }
          {CarLeg.createBookButton(props.leg)}
          {carpoolAgencyIcon[1] ? (
            <Icon
              img={carpoolAgencyIcon[0]}
              className="carpool-agency-logo"
              tooltip={props.leg.route.agency.name}
            />
          ) : (
            ''
          )}
          {carpoolAgencyIcon[1] ? (
            <Icon
              img={carpoolAgencyIcon[1]}
              className="carpool-agency-logo"
              tooltip="ADAC Mitfahrclub"
            />
          ) : (
            ''
          )}
        </div>
      </div>
      <LazilyLoad modules={carpoolOfferModules}>
        {({ Drawer, CarpoolOffer }) => (
          <Drawer
            className="offcanvas"
            disableSwipeToOpen
            openSecondary
            docked={false}
            open={isOpen}
            onRequestChange={onRequestChange}
            // Needed for the closing arrow button that's left of the drawer.
            containerStyle={{
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            }}
            width={getDrawerWidth(window)}
          >
            <CarpoolOffer
              duration={props.leg.duration}
              from={props.leg.from.name}
              to={props.leg.to.name}
              start={props.leg.startTime}
            />
          </Drawer>
        )}
      </LazilyLoad>
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
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary car leg.</p>
      <ComponentUsageExample>
        <CarLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

CarLeg.getTranslationKey = mode => {
  if (mode === 'CARPOOL') {
    return 'carpool-distance-duration';
  }
  return 'car-distance-duration';
};

CarLeg.getModeClassName = mode => {
  if (mode === 'CARPOOL') {
    return 'carpool';
  }
  return 'car';
};

CarLeg.createBookButton = leg => {
  if (leg.route && leg.route.url) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={leg.route.url}>
        <FormattedMessage id="details" defaultMessage="Details" />
      </a>
    );
  }
  return <span />;
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
    mode: PropTypes.string.isRequired,
    route: PropTypes.object,
  }).isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
};

CarLeg.contextTypes = { config: PropTypes.object.isRequired };

export default CarLeg;

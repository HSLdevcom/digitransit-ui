import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import { routerShape } from 'react-router';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getDrawerWidth } from '../util/browser';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import ItineraryCircleLine from './ItineraryCircleLine';
import ToggleButton from './ToggleButton';

class CarLeg extends React.Component {
  carpoolOfferModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    CarpoolOffer: () => importLazy(import('./CarpoolOffer')),
  };

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  getLazilyLoad(isOpen) {
    return (
      <LazilyLoad modules={this.carpoolOfferModules}>
        {({ Drawer, CarpoolOffer }) => (
          <Drawer
            className="offcanvas"
            disableSwipeToOpen
            openSecondary
            docked={false}
            open={isOpen}
            onRequestChange={this.onRequestChange}
            // Needed for the closing arrow button that's left of the drawer.
            containerStyle={{
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            }}
            width={getDrawerWidth(window)}
          >
            <CarpoolOffer
              duration={this.props.leg.duration}
              from={this.props.leg.from}
              to={this.props.leg.to}
              start={this.props.leg.startTime}
              onToggleClick={this.toggleOfferCarpool}
            />
          </Drawer>
        )}
      </LazilyLoad>
    );
  }

  internalSetOffcanvas = newState => {
    if (newState) {
      this.context.router.push({
        ...this.context.location,
        state: {
          ...this.context.location.state,
          carpoolOfferOffcanvas: newState,
        },
      });
    } else {
      this.context.router.goBack();
    }
  };

  getOffcanvasState = () =>
    (this.context.location.state &&
      this.context.location.state.carpoolOfferOffcanvas) ||
    false;

  toggleOfferCarpool = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  render = () => {
    const isOpen = this.getOffcanvasState();
    const carpoolAgencyIcon = [];
    if (this.props.leg.mode === 'CARPOOL') {
      if (this.props.leg.route.agency.gtfsId === 'mfdz:fg') {
        carpoolAgencyIcon[0] = 'fg_icon';
        carpoolAgencyIcon[1] = 'adac_icon';
      } else if (this.props.leg.route.agency.gtfsId === 'mfdz:mifaz') {
        carpoolAgencyIcon[0] = 'mifaz_icon-without-text';
      }
    }

    const distance = displayDistance(
      parseInt(this.props.leg.distance, 10),
      this.context.config,
    );
    const duration = durationToString(this.props.leg.duration * 1000);

    const firstLegClassName = this.props.index === 0 ? 'start' : '';

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    return (
      <div key={this.props.index} className="row itinerary-row">
        <div className="small-2 columns itinerary-time-column">
          <div className="itinerary-time-column-time">
            {moment(this.props.leg.startTime).format('HH:mm')}
          </div>
          <RouteNumber mode={this.props.leg.mode.toLowerCase()} vertical />
        </div>
        <ItineraryCircleLine
          index={this.props.index}
          modeClassName={CarLeg.getModeClassName(this.props.leg.mode)}
        />
        <div
          onClick={this.props.focusAction}
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${this.props.leg.mode.toLowerCase()}`}
        >
          <div className="itinerary-leg-first-row">
            <div>
              {this.props.leg.from.name}
              {this.props.children}
            </div>
            <Icon
              img="icon-icon_search-plus"
              className="itinerary-search-icon"
            />
          </div>
          <div className="itinerary-leg-action">
            <FormattedMessage
              id={CarLeg.getTranslationKey(this.props.leg.mode)}
              values={{ distance, duration }}
              defaultMessage="Drive {distance} ({duration})}"
            />
            <br />
            {CarLeg.showCarpoolButton(this.props.leg, this.toggleOfferCarpool)}
            {CarLeg.createBookButton(this.props.leg)}
            {carpoolAgencyIcon[1] ? (
              <Icon
                img={carpoolAgencyIcon[0]}
                className="carpool-agency-logo"
                tooltip={this.props.leg.route.agency.name}
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
        {ReactDOM.createPortal(
          this.getLazilyLoad(isOpen),
          document.getElementById('app'),
        )}
      </div>
    );
  };
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

CarLeg.showCarpoolButton = (leg, toggleOfferCarpool) => {
  if (leg.mode === 'CAR') {
    return (
      <ToggleButton
        className="standalone-btn carpool-offer-btn"
        showButtonTitle
        label="offer-ride"
        onBtnClick={toggleOfferCarpool}
      />
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
    to: PropTypes.shape({
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

CarLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape,
  location: PropTypes.object.isRequired,
};

export default CarLeg;

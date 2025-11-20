import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { legShape, configShape } from '../../util/shapes';
import TransitLeg from './TransitLeg';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';
import RouteNumberContainer from '../RouteNumber';
import withBreakpoint from '../../util/withBreakpoint';

const CallAgencyLeg = (
  { leg, currentLanguage, breakpoint, ...props },
  { intl, config },
) => {
  const modeClassName = 'call';
  const { route } = leg;
  const mobile = breakpoint === 'small' || breakpoint === 'medium';
  const notification =
    config.showRouteDescNotification && route.desc?.length
      ? { content: route.desc, link: route.url }
      : {
          content: 'warning-call-agency',
          link: '',
        };
  const key = `callAgencyNotification-${route.gtfsId}`;
  const routeNumber = (
    <RouteNumberContainer
      route={leg.route}
      className={`line ${modeClassName}`}
      mode={modeClassName}
      vertical
      withBar
      isTransitLeg
      text={leg.route && leg.route.shortName}
    />
  );
  return (
    <TransitLeg
      mode={modeClassName}
      leg={leg}
      mobile={mobile}
      omitDivider
      {...props}
    >
      <CallAgencyDisclaimer
        key={key}
        text={notification.content}
        href={notification.link}
        linkText={intl.formatMessage({ id: 'extra-info' })}
        routeNumber={routeNumber}
        pickupBookingInfo={leg.pickupBookingInfo}
        agency={route.agency}
        route={route}
        mobile={mobile}
      />
    </TransitLeg>
  );
};

CallAgencyLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  showRouteDescNotification: PropTypes.bool,
  currentLanguage: PropTypes.string.isRequired,
  breakpoint: PropTypes.string,
};

CallAgencyLeg.defaultProps = {
  showRouteDescNotification: false,
  breakpoint: undefined,
};

CallAgencyLeg.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

const CallAgencyLegWithBreakpoint = withBreakpoint(CallAgencyLeg);

const connectedComponent = connectToStores(
  CallAgencyLegWithBreakpoint,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { CallAgencyLeg as Component, connectedComponent as default };

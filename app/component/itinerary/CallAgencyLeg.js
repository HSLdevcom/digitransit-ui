import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { legShape, configShape } from '../../util/shapes';
import TransitLeg from './TransitLeg';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';
import RouteNumberContainer from '../RouteNumber';
import withBreakpoint from '../../util/withBreakpoint';
import { isLocalCallAgency } from '../../util/legUtils';

const CallAgencyLeg = (
  { leg, currentLanguage, breakpoint, ...props },
  { config },
) => {
  const intl = useIntl();
  const modeClassName = 'call';
  const { route } = leg;
  const mobile = breakpoint === 'small' || breakpoint === 'medium';
  const notification =
    config.showRouteDescNotification &&
    route.desc?.length &&
    config.flex.infoLanguage === currentLanguage // No translations available in the data at the moment
      ? { content: route.desc, link: route.url }
      : {
          content: intl.formatMessage({ id: 'call-agency-disclaimer' }),
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
      appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
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
        routeNumber={routeNumber}
        pickupBookingInfo={leg.pickupBookingInfo}
        agency={route.agency}
        route={route}
        mobile={mobile}
        header={intl.formatMessage({ id: 'on-demand-service' })}
        href={leg.pickupBookingInfo.contactInfo?.bookingUrl}
        linkText={intl.formatMessage({ id: 'open-app' })}
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

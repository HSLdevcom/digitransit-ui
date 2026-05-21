import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { legShape } from '../../util/shapes';
import TransitLeg from './TransitLeg';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';
import RouteNumberContainer from '../RouteNumber';
import withBreakpoint from '../../util/withBreakpoint';
import { isLocalCallAgency } from '../../util/legUtils';
import { useConfigContext } from '../../configurations/ConfigContext';

const CallAgencyLeg = ({ leg, breakpoint, ...props }) => {
  const intl = useIntl();
  const config = useConfigContext();
  const modeClassName = 'call';
  const { route } = leg;
  const mobile = breakpoint === 'small' || breakpoint === 'medium';
  const notification =
    config.showRouteDescNotification &&
    route.desc?.length &&
    config.flex.infoLanguage === config.language // No translations available in the data at the moment
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
  breakpoint: PropTypes.string,
};

CallAgencyLeg.defaultProps = {
  showRouteDescNotification: false,
  breakpoint: undefined,
};

export { CallAgencyLeg as Component };
export default withBreakpoint(CallAgencyLeg);

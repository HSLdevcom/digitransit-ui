import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { legShape } from '../../utils/shapes';
import TransitLeg from './TransitLeg';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';
import RouteNumberContainer from '../RouteNumber';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { isLocalCallAgency } from '../../utils/legUtils';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function CallAgencyLeg({ leg, ...props }) {
  const intl = useIntl();
  const config = useConfigContext();
  const breakpoint = useBreakpoint();
  const modeClassName = 'call';
  const { route } = leg;
  const mobile = breakpoint === 'small' || breakpoint === 'medium';
  // No translations available in the data at the moment
  const hasDescription =
    config.showRouteDescNotification && route.desc && config.flex.infoLanguage === intl.locale;
  const text = hasDescription ? route.desc : intl.formatMessage({ id: 'call-agency-disclaimer' });
  const routeNumber = (
    <RouteNumberContainer
      route={route}
      className={`line ${modeClassName}`}
      mode={modeClassName}
      vertical
      withBar
      isTransitLeg
      text={route.shortName}
      appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
    />
  );
  return (
    <TransitLeg mode={modeClassName} leg={leg} mobile={mobile} omitDivider {...props}>
      <CallAgencyDisclaimer
        text={text}
        routeNumber={routeNumber}
        pickupBookingInfo={leg.pickupBookingInfo}
        agency={route.agency}
        route={route}
        mobile={mobile}
        header={intl.formatMessage({ id: 'on-demand-service' })}
        href={leg.pickupBookingInfo?.contactInfo?.bookingUrl}
        linkText={intl.formatMessage({ id: 'open-app' })}
      />
    </TransitLeg>
  );
}

CallAgencyLeg.propTypes = { leg: legShape.isRequired, index: PropTypes.number.isRequired };

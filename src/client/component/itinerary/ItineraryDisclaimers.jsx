import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { shouldShowFareInfo } from '../../utils/fareUtils';
import { hasScooterLegs, hasTaxiLegs, isCallAgencyLeg } from '../../utils/legUtils';
import { getTripOrRouteMode } from '../../utils/modeUtils';
import { fareShape, legShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';
import FareDisclaimer from './FareDisclaimer';
import RouteDisclaimer from './RouteDisclaimer';

function getReplacementBusNotification(route, trip, config, locale) {
  const isReplacementRoute =
    route &&
    (getTripOrRouteMode(trip, route, config)?.includes('replacement') ||
      config.replacementBusRoutes?.includes(route.gtfsId));
  const isReplacementTrip = trip?.submode?.includes('replacement') || trip?.submode?.includes(714);

  if (!isReplacementRoute && !isReplacementTrip) {
    return null;
  }

  const useRouteDescription =
    isReplacementRoute && config.showRouteDescNotification && route.desc?.length;

  return {
    key: `replacementBusNotification-${route.gtfsId || trip?.gtfsId}`,
    content: useRouteDescription
      ? route.desc
      : config.replacementBusNotification?.content?.[locale]?.join(' '),
    link: useRouteDescription ? route.url : config.replacementBusNotification?.link?.[locale],
  };
}

export default function ItineraryDisclaimers({ legs, compressedLegs, fares }) {
  const config = useConfigContext();
  const intl = useIntl();
  const { locale } = intl;
  const disclaimers = [];
  const externalOperatorJourneys =
    hasScooterLegs({ legs: compressedLegs }) || hasTaxiLegs({ legs: compressedLegs });

  if (
    shouldShowFareInfo(config, legs, fares) &&
    (fares.some(fare => fare.isUnknown) || externalOperatorJourneys)
  ) {
    const found = {};
    legs.forEach(leg => {
      if (config.modeDisclaimers?.[leg.mode] && !found[leg.mode]) {
        found[leg.mode] = true;
        const disclaimer = config.modeDisclaimers[leg.mode][locale];
        disclaimers.push(
          <FareDisclaimer
            key={leg.mode}
            text={disclaimer.disclaimer}
            href={disclaimer.link}
            linkText={disclaimer.text}
          />,
        );
      }
    });

    const callAgencyInfo = config.callAgencyInfo?.[locale];
    if (
      callAgencyInfo &&
      legs.some(
        leg =>
          isCallAgencyLeg(leg) && !config.flex.internal.agencies.includes(leg.route.agency.gtfsId),
      )
    ) {
      disclaimers.push(
        <FareDisclaimer
          key={disclaimers.length}
          textId="separate-ticket-required-for-call-agency-disclaimer"
          href={callAgencyInfo.callAgencyInfoLink}
          linkText={callAgencyInfo.callAgencyInfoLinkText}
        />,
      );
    }

    if (!disclaimers.length) {
      disclaimers.push(
        <FareDisclaimer
          key="faredisclaimer-separate-ticket-key"
          textId="separate-ticket-required-disclaimer"
          values={{
            agencyName:
              typeof config.primaryAgencyName === 'string'
                ? config.primaryAgencyName
                : config.primaryAgencyName?.[locale],
          }}
        />,
      );
    }
  }

  if (config.replacementBusNotification) {
    legs.forEach(({ route, trip }) => {
      const notification = getReplacementBusNotification(route, trip, config, locale);
      if (
        notification &&
        !disclaimers.some(disclaimer => disclaimer.props?.text === notification.content)
      ) {
        disclaimers.push(
          <RouteDisclaimer
            key={notification.key}
            text={notification.content}
            href={notification.link}
            linkText={intl.formatMessage({ id: 'extra-info' })}
            header={intl.formatMessage({ id: 'replacement-bus' })}
          />,
        );
      }
    });
  }

  return disclaimers;
}

ItineraryDisclaimers.propTypes = {
  legs: PropTypes.arrayOf(legShape).isRequired,
  compressedLegs: PropTypes.arrayOf(legShape).isRequired,
  fares: PropTypes.arrayOf(fareShape),
};

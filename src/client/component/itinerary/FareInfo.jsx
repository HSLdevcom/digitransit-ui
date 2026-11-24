import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { shouldShowFareInfo, shouldShowMobilePurchaseInfo } from '../../utils/fareUtils';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import TicketInformation from './TicketInformation';
import localizedUrl from '../../utils/urlUtils';
import { getZones } from '../../utils/legUtils';
import { configShape, fareShape, legShape } from '../../utils/shapes';

export function FareInfo({ config, legs, fares, isMobile }) {
  const { locale } = useIntl();

  if (!shouldShowFareInfo(config, legs, fares)) {
    return null;
  }

  if (shouldShowMobilePurchaseInfo(config, legs, fares, isMobile)) {
    return <MobileTicketPurchaseInformation fares={fares} zones={getZones(legs)} />;
  }

  return (
    <TicketInformation
      fares={fares}
      zones={getZones(legs)}
      legs={legs}
      ticketLink={localizedUrl(config.ticketLink, locale)}
    />
  );
}

FareInfo.propTypes = {
  config: configShape.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
  fares: PropTypes.arrayOf(fareShape),
  isMobile: PropTypes.bool.isRequired,
};

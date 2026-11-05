import PropTypes from 'prop-types';
import {
  shouldShowFareInfo,
  shouldShowMobilePurchaseInfo,
} from '../../../utils/client/fareUtils';
import MobileTicketPurchaseInformation from './MobileTicketPurchaseInformation';
import TicketInformation from './TicketInformation';
import localizedUrl from '../../../utils/client/urlUtils';
import { getZones } from '../../../utils/client/legUtils';
import { configShape, fareShape, legShape } from '../../../utils/client/shapes';

export function FareInfo({ config, legs, fares, isMobile }) {
  if (!shouldShowFareInfo(config, legs, fares)) {
    return null;
  }

  if (shouldShowMobilePurchaseInfo(config, legs, fares, isMobile)) {
    return (
      <MobileTicketPurchaseInformation fares={fares} zones={getZones(legs)} />
    );
  }

  return (
    <TicketInformation
      fares={fares}
      zones={getZones(legs)}
      legs={legs}
      ticketLink={localizedUrl(config.ticketLink, config.language)}
    />
  );
}

FareInfo.propTypes = {
  config: configShape.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
  fares: PropTypes.arrayOf(fareShape),
  isMobile: PropTypes.bool.isRequired,
};

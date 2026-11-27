import PropTypes from 'prop-types';
import Icon from '../Icon';
import { addAnalyticsEvent } from '../../../shared/utils/analyticsUtils';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { stopPagePath } from '../../../shared/utils/path';
import { legShape } from '../../utils/shapes';
import LegPlaceLink from './LegPlaceLink';
import AddressPlace from './AddressPlace';

/**
 * Name of the place where a transit leg starts. A call agency leg has no stop page to link to,
 * and a flex trip origin is shown as an address and a place.
 */
export default function LegOrigin({ leg, mode, index, name }) {
  const viaIcon = leg.from.viaLocationType && (
    <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
  );

  if (mode !== 'call') {
    return (
      <LegPlaceLink
        ariaLabel={name?.toLowerCase()}
        onClick={() =>
          addAnalyticsEvent({ category: 'Itinerary', action: 'OpenRouteFromItinerary', name: mode })
        }
        to={stopPagePath(false, leg.from.stop.gtfsId)}
        isViaPoint={!!leg.from.viaLocationType}
      >
        {name}
      </LegPlaceLink>
    );
  }

  if (index !== 0) {
    return <span>{name}</span>;
  }

  const [address, place] = splitStringToAddressAndPlace(name || '');
  return (
    <span>
      <AddressPlace address={address} place={place}>
        {viaIcon}
      </AddressPlace>
    </span>
  );
}

LegOrigin.propTypes = {
  leg: legShape.isRequired,
  mode: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string,
};

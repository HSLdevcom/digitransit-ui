import PropTypes from 'prop-types';
import { getZoneLabel } from '../../utils/legUtils';
import { legShape } from '../../utils/shapes';
import ZoneIcon from '../ZoneIcon';
import { useConfigContext } from '../../hooks/ConfigContext';
import { splitGtfsId } from '../../../shared/utils/gtfs';

export default function ZoneChange({ leg, showIntermediateStops }) {
  const config = useConfigContext();
  const startZone = leg.from.stop.zoneId;
  const endZone = leg.to.stop.zoneId;

  const { feedId } = splitGtfsId(leg.from.stop.gtfsId);
  const renderZoneIcons =
    config.zones.itinerary && leg.from.stop.gtfsId && config.feedIds.includes(feedId);

  if (
    startZone !== endZone &&
    (!showIntermediateStops || leg.intermediatePlaces.length === 0) &&
    renderZoneIcons
  ) {
    return (
      <div className="time-column-zone-icons-container">
        <ZoneIcon zoneId={getZoneLabel(startZone, config)} showUnknown />
        <ZoneIcon zoneId={getZoneLabel(endZone, config)} className="zone-delimiter" showUnknown />
      </div>
    );
  }

  if (startZone === endZone && renderZoneIcons) {
    return (
      <div className="time-column-zone-icons-container single">
        <ZoneIcon zoneId={getZoneLabel(startZone, config)} showUnknown />
      </div>
    );
  }

  return null;
}

ZoneChange.propTypes = {
  leg: legShape.isRequired,
  showIntermediateStops: PropTypes.bool.isRequired,
};

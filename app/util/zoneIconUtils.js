import { splitGtfsId } from './gtfs';

export default function getZoneId(config, propertiesZones, dataZones) {
  function zoneFilter(zones) {
    return Array.isArray(zones)
      ? zones.filter(
          zone => zone && config.feedIds.includes(splitGtfsId(zone).feedId),
        )
      : [];
  }

  const filteredZones = propertiesZones
    ? zoneFilter(propertiesZones)
    : zoneFilter(dataZones);
  return splitGtfsId(filteredZones.at(0)).entityId;
}

export default function getZoneId(config, propertiesZones, dataZones) {
  function zoneFilter(zones) {
    return Array.isArray(zones)
      ? zones.filter(
          zone => zone && config.feedIds.includes(zone.split(':')[0]),
        )
      : [];
  }

  const filteredZones = propertiesZones
    ? zoneFilter(propertiesZones)
    : zoneFilter(dataZones);
  const zone = filteredZones.length > 0 ? filteredZones[0] : undefined;
  return zone ? zone.split(':')[1] : undefined;
}

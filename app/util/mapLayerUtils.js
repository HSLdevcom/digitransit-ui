const TicketSalesFeatureType = {
  ServicePoint: 'Palvelupiste',
  TicketMachine1: 'HSL Automaatti MNL',
  TicketMachine2: 'HSL Automaatti KL',
  SalesPointGeneric: 'Myyntipiste',
  SalesPointRKioski: 'R-kioski',
};

export const mapTicketSalesFeatureTypeToSettings = type => {
  switch (type) {
    case TicketSalesFeatureType.ServicePoint:
      return 'servicePoint';
    case TicketSalesFeatureType.TicketMachine1:
    case TicketSalesFeatureType.TicketMachine2:
      return 'ticketMachine';
    case TicketSalesFeatureType.SalesPointGeneric:
    case TicketSalesFeatureType.SalesPointRKioski:
      return 'salesPoint';
    default:
      return undefined;
  }
};

export const isLayerEnabled = (layerName, mapLayers) => {
  if (!layerName || !mapLayers) {
    return false;
  }
  const mapLayer = mapLayers[layerName];
  const keys = Object.keys(mapLayer);
  if (keys.length === 0) {
    return Boolean(mapLayer);
  }
  if (keys.map(key => mapLayer[key]).every(value => value === false)) {
    return false;
  }
  return true;
};

export const isFeatureLayerEnabled = (feature, layerName, mapLayers) => {
  if (!feature || !layerName || !mapLayers) {
    return false;
  }
  if (!Object.keys(mapLayers).includes(layerName)) {
    return false;
  }
  const featureType = `${feature.properties.type}`.toLocaleLowerCase();
  if (featureType) {
    if (layerName === 'stop' && feature.properties.stops) {
      return isFeatureLayerEnabled(feature, 'terminal', mapLayers);
    }
    return Boolean(mapLayers[layerName][featureType]);
  }
  if (feature.properties.TYYPPI) {
    return Boolean(
      mapLayers[layerName][
        mapTicketSalesFeatureTypeToSettings(feature.properties.TYYPPI)
      ],
    );
  }
  return isLayerEnabled(layerName, mapLayers);
};

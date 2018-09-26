export const updateMapLayers = (actionContext, mapLayerSettings) => {
  actionContext.dispatch('UpdateMapLayers', mapLayerSettings);
};

export default updateMapLayers;

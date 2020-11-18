export const setMapMode = (actionContext, mapModeSettings) => {
  actionContext.dispatch('SetMapMode', mapModeSettings);
};

export default setMapMode;

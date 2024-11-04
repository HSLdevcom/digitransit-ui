export default function selectFeature(actionContext, feature) {
  actionContext.dispatch('SetSelectedFeature', feature);
}

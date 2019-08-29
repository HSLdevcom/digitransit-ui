import { findFeatures } from './geo-utils';
import { updateMessage } from '../action/MessageActions';
import GeoJsonStore from '../store/GeoJsonStore';

/**
 * Checks if the user is inside an area polygon featured in a message
 *
 * @param {*} lat The latitude of the position
 * @param {*} lon The longitude of the position
 * @param {*} context the context of the component
 * @param {*} messagesToCheck the messages to be checked
 */
export default function triggerMessage(lat, lon, context, messagesToCheck) {
  const { getGeoJsonData } = context.getStore(GeoJsonStore);
  const messages = messagesToCheck.filter(
    msg => !msg.shouldTrigger && msg.content && msg.geoJson,
  );
  messages.forEach(msg => {
    return new Promise(resolve => {
      resolve(getGeoJsonData(msg.geoJson));
    }).then(value => {
      const data = findFeatures(
        { lat, lon },
        (value && value.data && value.data.features) || [],
      );
      if (data.length > 0) {
        msg.shouldTrigger = true; // eslint-disable-line no-param-reassign
        context.executeAction(updateMessage, msg);
      }
    });
  });
}

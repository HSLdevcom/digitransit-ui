import startMqttClient from '../util/mqttClient';
import startGtfsRtClient from '../util/gtfsRtClient';

export function startRealTimeClient(actionContext, settings, done) {
  const options = !Array.isArray(settings.options)
    ? [settings.options]
    : settings.options;
  let url;
  let startClient;

  if (settings.mqtt) {
    url = settings.mqtt;
    startClient = startMqttClient;
  } else {
    url = settings.gtfsRt;
    startClient = startGtfsRtClient;
  }

  startClient(url, options, actionContext).then(data => {
    actionContext.dispatch('RealTimeClientStarted', data);
    done();
  });
}

export function stopRealTimeClient(actionContext, client, done) {
  client.end();
  actionContext.dispatch('RealTimeClientStopped');
  done();
}

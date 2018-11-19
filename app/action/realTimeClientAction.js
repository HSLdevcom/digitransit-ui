import startMqttClient from '../util/mqttClient';
import startGtfsRtHttpClient from '../util/gtfsRtHttpClient';

export function startRealTimeClient(actionContext, settings, done) {
  let startClient;

  if (settings.mqtt) {
    startClient = startMqttClient;
  } else {
    startClient = startGtfsRtHttpClient;
  }

  startClient(settings, actionContext).then(data => {
    actionContext.dispatch('RealTimeClientStarted', data);
    done();
  });
}

export function stopRealTimeClient(actionContext, client, done) {
  client.end();
  actionContext.dispatch('RealTimeClientStopped');
  done();
}

import startMqttClient from '../util/mqttClient';

export function startRealTimeClient(actionContext, settings, done) {
  const startClient = startMqttClient;

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

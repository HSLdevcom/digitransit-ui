import { startMqttClient, changeTopics } from '../util/mqttClient';

export function startRealTimeClient(actionContext, settings, done) {
  /* settings may have changed, so reset old store content */
  actionContext.dispatch('RealTimeClientReset');

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

export function changeRealTimeClientTopics(actionContext, settings, done) {
  // remove existing vehicles/topics
  actionContext.dispatch('RealTimeClientReset');

  changeTopics(settings, actionContext);
  done();
}

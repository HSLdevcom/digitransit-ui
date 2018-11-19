import GtfsRtParser from './gtfsRtParser';

class GtfsRtHttpClient {
  constructor(settings, actionContext, bindings) {
    this.parser = new GtfsRtParser(settings.agency, bindings);
    this.url = settings.gtfsRt;
    this.options = settings.options;
    this.actionContext = actionContext;
  }

  getMessage() {
    if (this.msgPending) {
      return;
    }
    this.msgPending = true;

    fetch(this.url)
      .then(response => {
        if (response.status !== 200) {
          this.msgPending = false;
          return;
        }
        response.arrayBuffer().then(data => {
          const messages = this.parser.parse(data, this.options);
          if (messages) {
            this.actionContext.dispatch('RealTimeClientMessage', messages);
          }
          this.msgPending = false;
        });
      })
      .catch(() => {
        this.msgPending = false;
      });
  }

  end() {
    clearInterval(this.timer);
  }
}

export default function startGtfsRtHttpClient(settings, actionContext) {
  return import('./gtfsrt').then(bindings => {
    const client = new GtfsRtHttpClient(settings, actionContext, bindings);
    client.timer = setInterval(() => client.getMessage(), 1000);

    return { client };
  });
}

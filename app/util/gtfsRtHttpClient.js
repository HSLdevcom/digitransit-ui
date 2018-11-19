class GtfsRtHttpClient {
  constructor(settings, actionContext, parser) {
    this.url = settings.gtfsRt;
    this.options = settings.options;
    this.agency = settings.agency;
    this.actionContext = actionContext;
    this.parser = parser;
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
          const messages = this.parser(data, this.options);
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
  return import('./gtfsRtParser').then(parser => {
    const client = new GtfsRtHttpClient(settings, actionContext, parser);
    client.timer = setInterval(() => client.getMessage(), 1000);

    return { client };
  });
}

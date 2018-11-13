import Pbf from 'pbf';

class GtfsRtClient {
  constructor(url, options, actionContext, parser) {
    this.url = url;
    this.options = options;
    this.actionContext = actionContext;
    this.timer = setInterval(this.getMessage, 1000);
    this.parser = parser;
  }

  parseMessage(feed) {
    let found = false;
    const messages = [];

    feed.entity.forEach(entity => {
      console.log('entity');
      if (entity.trip_update) {
        console.log(entity.trip_update);
      }
    });
    if (found) {
      this.actionContext.dispatch('RealTimeClientMessage', messages);
    }
    this.msgPending = false;
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
        response.blob().then(data => {
          const pbf = new Pbf(data);
          const feed = this.parser.FeedMessage.read(pbf);
          this.parseMessage(feed);
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

export default function startGtfsRtClient(url, options, actionContext) {
  return import('./gtfsrt').then(parser => {
    const client = new GtfsRtClient(url, options, actionContext, parser);
    return { client };
  });
}

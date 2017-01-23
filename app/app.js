import Fluxible from 'fluxible';
import routes from './routes';
import EndpointStore from './store/EndpointStore';
import FavouriteLocationStore from './store/FavouriteLocationStore';
import FavouriteRoutesStore from './store/FavouriteRoutesStore';
import FavouriteStopsStore from './store/FavouriteStopsStore';
import FeedbackStore from './store/FeedbackStore';
import MessageStore from './store/MessageStore';
import ModeStore from './store/ModeStore';
import OldSearchesStore from './store/OldSearchesStore';
import PositionStore from './store/PositionStore';
import PreferencesStore from './store/PreferencesStore';
import RealTimeInformationStore from './store/RealTimeInformationStore';
import TimeStore from './store/TimeStore';
import FavouriteCityBikeStationStore from './store/FavouriteCityBikeStationStore';

const app = new Fluxible({
  component: routes,
});

app.registerStore(EndpointStore);
app.registerStore(FavouriteLocationStore);
app.registerStore(FavouriteRoutesStore);
app.registerStore(FavouriteStopsStore);
app.registerStore(FeedbackStore);
app.registerStore(MessageStore);
app.registerStore(ModeStore);
app.registerStore(OldSearchesStore);
app.registerStore(PositionStore);
app.registerStore(PreferencesStore);
app.registerStore(RealTimeInformationStore);
app.registerStore(TimeStore);
app.registerStore(FavouriteCityBikeStationStore);

app.plug({
  name: 'extra-context-plugin',
  plugContext: (options) => {
    let { url, headers } = options;
    return {
      plugComponentContext: (componentContext) => {
        // eslint-disable-next-line no-param-reassign
        componentContext.url = url;
        // eslint-disable-next-line no-param-reassign
        componentContext.headers = headers;
      },

      dehydrate: () => ({
        url,
        headers,
      }),
      rehydrate: (state) => {
        url = state.url;
        headers = state.headers;
      },
    };
  },
  dehydrate: () => ({}),
  rehydrate: () => {},
});

export default app;

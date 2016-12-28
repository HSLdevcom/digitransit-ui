import Fluxible from 'fluxible';
import routes from './routes';
import DisruptionInfoStore from './store/DisruptionInfoStore';
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
import SearchStore from './store/SearchStore';
import TimeStore from './store/TimeStore';
import FavouriteCityBikeStationStore from './store/FavouriteCityBikeStationStore';

const app = new Fluxible({
  component: routes,
});

app.registerStore(DisruptionInfoStore);
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
app.registerStore(SearchStore);
app.registerStore(TimeStore);
app.registerStore(FavouriteCityBikeStationStore);

export default app;

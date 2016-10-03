import Fluxible from 'fluxible';
import routes from './routes';
import DisruptionInfoStore from './store/DisruptionInfoStore';
import EndpointStore from './store/EndpointStore';
import FavouriteLocationStore from './store/FavouriteLocationStore';
import FavouriteRoutesStore from './store/favourite-routes-store';
import FavouriteStopsStore from './store/favourite-stops-store';
import FeedbackStore from './store/feedback-store';
import MessageStore from './store/MessageStore';
import ModeStore from './store/ModeStore';
import NotImplementedStore from './store/not-implemented-store';
import OldSearchesStore from './store/old-searches-store';
import PositionStore from './store/PositionStore';
import PreferencesStore from './store/PreferencesStore';
import RealTimeInformationStore from './store/RealTimeInformationStore';
import SearchStore from './store/search-store';
import ServiceStore from './store/service-store';
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
app.registerStore(NotImplementedStore);
app.registerStore(OldSearchesStore);
app.registerStore(PositionStore);
app.registerStore(PreferencesStore);
app.registerStore(RealTimeInformationStore);
app.registerStore(SearchStore);
app.registerStore(ServiceStore);
app.registerStore(TimeStore);
app.registerStore(FavouriteCityBikeStationStore);

export default app;

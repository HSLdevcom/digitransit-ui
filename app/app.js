import Fluxible from 'fluxible';
import routes from './routes';
import CityBikeStore from './store/city-bike-store';
import DisruptionInfoStore from './store/DisruptionInfoStore';
import EndpointStore from './store/endpoint-store';
import FavouriteLocationStore from './store/favourite-location-store';
import FavouriteRoutesStore from './store/favourite-routes-store';
import FavouriteStopsStore from './store/favourite-stops-store';
import FeedbackStore from './store/feedback-store';
import ItinerarySearchStore from './store/itinerary-search-store';
import ModeStore from './store/mode-store';
import NotImplementedStore from './store/not-implemented-store';
import OldSearchesStore from './store/old-searches-store';
import PositionStore from './store/PositionStore';
import PreferencesStore from './store/preferences-store';
import RealTimeInformationStore from './store/real-time-information-store';
import SearchStore from './store/search-store';
import ServiceStore from './store/service-store';
import TimeStore from './store/TimeStore';

const app = new Fluxible({
  component: routes,
});

app.registerStore(CityBikeStore);
app.registerStore(DisruptionInfoStore);
app.registerStore(EndpointStore);
app.registerStore(FavouriteLocationStore);
app.registerStore(FavouriteRoutesStore);
app.registerStore(FavouriteStopsStore);
app.registerStore(FeedbackStore);
app.registerStore(ItinerarySearchStore);
app.registerStore(ModeStore);
app.registerStore(NotImplementedStore);
app.registerStore(OldSearchesStore);
app.registerStore(PositionStore);
app.registerStore(PreferencesStore);
app.registerStore(RealTimeInformationStore);
app.registerStore(SearchStore);
app.registerStore(ServiceStore);
app.registerStore(TimeStore);
export default app;

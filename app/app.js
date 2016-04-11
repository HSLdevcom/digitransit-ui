import Fluxible from 'fluxible';
import routes from './routes';
import ServiceStore from './store/service-store';
import FavouriteRoutesStore from './store/favourite-routes-store';
import FavouriteStopsStore from './store/favourite-stops-store';
import EndpointStore from './store/endpoint-store';
import ItinerarySearchStore from './store/itinerary-search-store';
import PositionStore from './store/position-store';
import RealTimeInformationStore from './store/real-time-information-store';
import TimeStore from './store/time-store';
import PreferencesStore from './store/preferences-store';
import ModeStore from './store/mode-store';
import NotImplementedStore from './store/not-implemented-store';
import CityBikeStore from './store/city-bike-store';
import FeedbackStore from './store/feedback-store';
import FavouriteLocationStore from './store/favourite-location-store';
import SearchStore from './store/search-store';
import OldSearchesStore from './store/old-searches-store';

const app = new Fluxible({
  component: routes,
});

app.registerStore(ServiceStore);
app.registerStore(FavouriteRoutesStore);
app.registerStore(FavouriteStopsStore);
app.registerStore(FavouriteLocationStore);
app.registerStore(EndpointStore);
app.registerStore(ItinerarySearchStore);
app.registerStore(PositionStore);
app.registerStore(RealTimeInformationStore);
app.registerStore(TimeStore);
app.registerStore(PreferencesStore);
app.registerStore(ModeStore);
app.registerStore(NotImplementedStore);
app.registerStore(CityBikeStore);
app.registerStore(FeedbackStore);
app.registerStore(SearchStore);
app.registerStore(OldSearchesStore);
export default app;

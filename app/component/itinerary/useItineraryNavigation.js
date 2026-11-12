import { useRouter } from 'found';
import { hasTaxiLegs } from '../../../utils/client/legUtils';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
import { getItineraryPagePath, streetHash } from '../../../utils/shared/path';

export default function useItineraryNavigation({
  itinerary,
  hash,
  passive,
  focusToHeader,
}) {
  const { router, match } = useRouter();

  const onSelectImmediately = () => {
    const modesWithSubpath = [
      streetHash.bikeAndVehicle,
      streetHash.parkAndRide,
      streetHash.carAndVehicle,
    ];
    const subpath = modesWithSubpath.includes(match.params.hash)
      ? `/${match.params.hash}/`
      : '/';

    // eslint-disable-next-line compat/compat
    const momentumScroll =
      document.getElementsByClassName('momentum-scroll')[0];
    if (momentumScroll) {
      momentumScroll.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    if (hasTaxiLegs(itinerary)) {
      addAnalyticsEvent({
        event: 'sendMatomoEvent',
        category: 'Itinerary',
        action: 'OpenItineraryDetailsWithMode',
        name: 'taxi',
      });
    }

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: hash,
    });

    const basePath = `${getItineraryPagePath(
      match.params.from,
      match.params.to,
    )}${subpath}`;
    const indexPath = `${basePath}${hash}`;
    const newLocation = {
      ...match.location,
      state: { ...match.location.state, selectedItineraryIndex: hash },
    };
    router.replace({ ...newLocation, pathname: basePath });
    router.push({ ...newLocation, pathname: indexPath });
    focusToHeader();
  };

  const onSelectActive = () => {
    if (!passive) {
      onSelectImmediately();
    } else {
      router.replace({
        ...match.location,
        state: {
          ...match.location.state,
          selectedItineraryIndex: hash,
        },
      });
      addAnalyticsEvent({
        category: 'Itinerary',
        action: 'HighlightItinerary',
        name: hash,
      });
    }
  };

  return { onSelectImmediately, onSelectActive };
}

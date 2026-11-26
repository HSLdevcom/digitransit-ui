import PropTypes from 'prop-types';
import IntermediateLeg from './IntermediateLeg';
import { getZoneLabel } from '../../utils/legUtils';
import { legShape } from '../../utils/shapes';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function IntermediateStops({ leg, interliningLegs, mode, color, canceledStopIds }) {
  const config = useConfigContext();
  const places = leg.intermediatePlaces.slice();

  let previousLeg = leg;
  interliningLegs.forEach(iLeg => {
    places.push({ ...previousLeg.to, arrival: previousLeg.end }, ...iLeg.intermediatePlaces);
    previousLeg = iLeg;
  });

  if (places.length === 0) {
    return null;
  }

  const stopList = places.map((place, i, array) => {
    const isFirstPlace = i === 0;
    const isLastPlace = i === array.length - 1;
    const isCanceled = canceledStopIds.has(place.stop.gtfsId);

    const previousZoneId =
      (array[i - 1] && array[i - 1].stop.zoneId) || (isFirstPlace && leg.from.stop.zoneId);
    const currentZoneId = place.stop.zoneId;
    const nextZoneId =
      (array[i + 1] && array[i + 1].stop.zoneId) ||
      (isLastPlace && interliningLegs[interliningLegs.length - 1]?.to.stop.zoneId) ||
      leg.to.stop.zoneId;

    const previousZoneIdDiffers = previousZoneId && previousZoneId !== currentZoneId;
    const nextZoneIdDiffers = nextZoneId && nextZoneId !== currentZoneId;
    const showCurrentZoneId = previousZoneIdDiffers || nextZoneIdDiffers;

    return (
      <IntermediateLeg
        placesCount={places.length}
        color={color}
        key={place.stop.gtfsId}
        gtfsId={place.stop.gtfsId}
        mode={mode}
        name={place.stop.name}
        arrival={place.arrival}
        realTime={leg.realTime}
        stopCode={place.stop.code}
        showZoneLimits={config.zones.itinerary}
        showCurrentZoneDelimiter={previousZoneIdDiffers}
        previousZoneId={
          (isFirstPlace && previousZoneIdDiffers && getZoneLabel(previousZoneId, config)) ||
          undefined
        }
        currentZoneId={(showCurrentZoneId && getZoneLabel(currentZoneId, config)) || undefined}
        nextZoneId={
          (isLastPlace && nextZoneIdDiffers && getZoneLabel(nextZoneId, config)) || undefined
        }
        isViaPoint={place.isViaPoint}
        isLastPlace={isLastPlace}
        isCanceled={isCanceled}
      />
    );
  });

  return <div className="itinerary-leg-container">{stopList}</div>;
}

IntermediateStops.propTypes = {
  leg: legShape.isRequired,
  interliningLegs: PropTypes.arrayOf(legShape).isRequired,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  canceledStopIds: PropTypes.instanceOf(Set).isRequired,
};

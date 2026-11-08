import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useRouter } from 'found';
import { graphql, useFragment } from 'react-relay';
import { fragmentRefShape } from '../../../utils/client/shapes';
import CardHeader from '../CardHeader';
import { getJson } from '../../../utils/shared/xhrPromise';
import { saveSearch } from '../../data/SearchHistory';
import { isIOS } from '../../../utils/shared/browser';
import FavouriteStopContainer from '../FavouriteStopContainer';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function StopCardHeader({
  stop: stopRef,
  distance,
  className,
  headingStyle,
  icons,
  isPopUp = false,
  breakpoint,
}) {
  const stop = useFragment(
    graphql`
      fragment StopCardHeader_stop on Stop {
        locationType
        gtfsId
        name
        code
        desc
        zoneId
        vehicleMode
        alerts {
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
        }
        lat
        lon
        stops {
          name
          desc
          zoneId
        }
      }
    `,
    stopRef,
  );
  const config = useConfigContext();
  const { match } = useRouter();
  const headerConfig = config.stopCard?.header || {};
  const isTerminal = stop.locationType === 'STATION';

  useEffect(() => {
    if (!isIOS || isPopUp || !match.location.query?.save) {
      return;
    }
    const layer = isTerminal ? 'station' : 'stop';
    let id = `GTFS:${stop.gtfsId}`;
    let { name } = stop;
    if (stop.code) {
      id = `${id}#${stop.code}`;
      name = `${name} ${stop.code}`;
    }

    const searchParams = {
      'point.lat': stop.lat,
      'point.lon': stop.lon,
      'boundary.circle.radius': 0.2,
      size: 1,
    };
    if (config.searchParams?.['boundary.country']) {
      searchParams['boundary.country'] =
        config.searchParams['boundary.country'];
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams)
      .then(data => {
        if (data.features != null && data.features.length > 0) {
          const feat = data.features[0].properties;
          const city = feat.localadmin;

          saveSearch({
            item: {
              geometry: { coordinates: [stop.lon, stop.lat] },
              properties: {
                name,
                id,
                gid: `gtfs:${layer}:${id}`,
                layer,
                label: `${stop.name}, ${city}`,
                localadmin: city,
              },
              type: 'Feature',
            },
            type: 'endpoint',
          });
        }
      })
      .catch(() => {});
  }, []);

  const getDescription = () => {
    let desc = '';
    if (headerConfig.showDescription && stop.desc) {
      desc += stop.desc;
    }
    if (headerConfig.showDistance && distance) {
      desc += ` // ${Math.round(distance)} m`;
    }
    if (isTerminal && stop.stops) {
      desc = stop.stops[0].desc;
    }
    return desc;
  };

  return (
    <CardHeader
      className={className}
      headingStyle={headingStyle}
      description={getDescription()}
      code={headerConfig.showStopCode && stop.code ? stop.code : null}
      icons={icons}
      showBackButton={breakpoint === 'large'}
      stop={stop}
      isTerminal={isTerminal}
      favouriteContainer={
        <FavouriteStopContainer stop={stop} isTerminal={isTerminal} />
      }
    />
  );
}

StopCardHeader.propTypes = {
  stop: fragmentRefShape.isRequired,
  distance: PropTypes.number,
  className: PropTypes.string,
  headingStyle: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isPopUp: PropTypes.bool,
  breakpoint: PropTypes.string,
};

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import Loading from '../../Loading';
import ZoneIcon from '../../ZoneIcon';
import { getJson } from '../../../../utils/shared/xhrPromise';
import { addAnalyticsEvent } from '../../../../utils/shared/analyticsUtils';
import { splitStringToAddressAndPlace } from '../../../../utils/shared/otpStrings';
import getZoneId from '../../../../utils/client/zoneIconUtils';
import PopupHeader from '../PopupHeader';
import { useConfigContext } from '../../../client/ConfigContext';

export default function LocationPopup({
  lat,
  lon,
  locationPopup,
  onSelectLocation = () => {},
}) {
  const config = useConfigContext();
  const intl = useIntl();
  // loading and location are updated together from a Promise callback, which
  // React 16 doesn't batch outside of event handlers. Keeping them in a
  // single state object avoids rendering with loading=false before location
  // has been updated with an address.
  const [state, setState] = useState({
    loading: true,
    location: { lat, lon },
  });

  useEffect(() => {
    const searchParams = {
      'point.lat': lat,
      'point.lon': lon,
      'boundary.circle.radius': 0.1, // 100m
      lang: config.language,
      size: 1,
      layers: 'address',
      zones: 1,
    };
    if (config.searchParams['boundary.country']) {
      searchParams['boundary.country'] =
        config.searchParams['boundary.country'];
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams).then(
      data => {
        let pointName;
        if (data.features != null && data.features.length > 0) {
          const match = data.features[0].properties;
          setState(prevState => ({
            loading: false,
            location: {
              ...prevState.location,
              address: getLabel(match),
              zoneId: getZoneId(config, match.zones, data.zones),
            },
          }));
          pointName = 'FreeAddress';
        } else {
          setState(prevState => ({
            loading: false,
            location: {
              ...prevState.location,
              address: intl.formatMessage({
                id: 'location-from-map',
                defaultMessage: 'Selected location',
              }),
              zoneId: getZoneId(config, data.zones),
            },
          }));
          pointName = 'NoAddress';
        }
        const pathPrefixMatch =
          window.location.pathname.match(/^\/([a-z]{2,})\//);
        const context =
          pathPrefixMatch && pathPrefixMatch[1] !== config.indexPath
            ? pathPrefixMatch[1]
            : 'index';
        addAnalyticsEvent({
          action: 'SelectMapPoint',
          category: 'Map',
          name: pointName,
          type: null,
          context,
        });
      },
      () => {
        setState({
          loading: false,
          location: {
            address: intl.formatMessage({
              id: 'location-from-map',
              defaultMessage: 'Selected location',
            }),
          },
        });
      },
    );
    // Run only on mount, mirroring the previous componentDidMount.
  }, []);

  const { loading, location } = state;
  if (loading) {
    return (
      <div className="card smallspinner" style={{ height: '4rem' }}>
        <Loading />
      </div>
    );
  }
  const { zoneId } = location;
  const [address, place] = splitStringToAddressAndPlace(location.address);
  return (
    <Card>
      <PopupHeader header={address} subHeader={place}>
        {zoneId && zoneId !== place && (
          <ZoneIcon zoneId={zoneId} showUnknown={false} />
        )}
      </PopupHeader>
      {(locationPopup === 'all' || locationPopup === 'origindestination') && (
        <MarkerPopupBottom
          location={location}
          locationPopup={locationPopup}
          onSelectLocation={onSelectLocation}
        />
      )}
    </Card>
  );
}

LocationPopup.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

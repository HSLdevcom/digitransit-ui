import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import ZoneIcon from '../../ZoneIcon';
import PreferencesStore from '../../../store/PreferencesStore';
import { getJson } from '../../../util/xhrPromise';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';

class LocationPopup extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    language: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      location: {
        lat: this.props.lat,
        lon: this.props.lon,
      },
    };
  }

  componentDidMount() {
    const { lat, lon } = this.props;
    const { config } = this.context;

    function getZoneId(propertiesZones, dataZones) {
      function zoneFilter(zones) {
        return Array.isArray(zones)
          ? zones.filter(
              zone => zone && config.feedIds.includes(zone.split(':')[0]),
            )
          : [];
      }
      const filteredZones = propertiesZones
        ? zoneFilter(propertiesZones)
        : zoneFilter(dataZones);
      const zone = filteredZones.length > 0 ? filteredZones[0] : undefined;
      return zone ? zone.split(':')[1] : undefined;
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': lat,
      'point.lon': lon,
      'boundary.circle.radius': 0.1, // 100m
      lang: this.props.language,
      size: 1,
      layers: 'address',
      zones: 1,
    }).then(
      data => {
        let pointName;
        if (data.features != null && data.features.length > 0) {
          const match = data.features[0].properties;
          this.setState(prevState => ({
            loading: false,
            location: {
              ...prevState.location,
              address: getLabel(match),
              zoneId: getZoneId(match.zones, data.zones),
            },
          }));
          pointName = 'FreeAddress';
        } else {
          this.setState(prevState => ({
            loading: false,
            location: {
              ...prevState.location,
              address: this.context.intl.formatMessage({
                id: 'location-from-map',
                defaultMessage: 'Selected location',
              }),
              zoneId: getZoneId(data.zones),
            },
          }));
          pointName = 'NoAddress';
        }
        const pathPrefixMatch = window.location.pathname.match(
          /^\/([a-z]{2,})\//,
        );
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
        this.setState({
          loading: false,
          location: {
            address: this.context.intl.formatMessage({
              id: 'location-from-map',
              defaultMessage: 'Selected location',
            }),
          },
        });
      },
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="card smallspinner" style={{ height: '4rem' }}>
          <Loading />
        </div>
      );
    }
    const { zoneId } = this.state.location;
    return (
      <Card>
        <div className="card-padding location-popup-wrapper">
          <CardHeader
            name={this.state.location.address}
            description={this.state.location.address}
            unlinked
            className="padding-small"
          >
            <ZoneIcon zoneId={zoneId} showUnknown={false} />
          </CardHeader>
        </div>
        {(this.props.locationPopup === 'all' ||
          this.props.locationPopup === 'origindestination') && (
          <MarkerPopupBottom
            location={this.state.location}
            locationPopup={this.props.locationPopup}
            onSelectLocation={this.props.onSelectLocation}
          />
        )}
      </Card>
    );
  }
}

const connectedComponent = connectToStores(
  LocationPopup,
  [PreferencesStore],
  ({ getStore }) => {
    const language = getStore(PreferencesStore).getLanguage();
    return { language };
  },
);

export { connectedComponent as default, LocationPopup as Component };

import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Icon from '../../Icon';
import Loading from '../../Loading';
import GeoJsonStore from '../../../store/GeoJsonStore';
import PreferencesStore from '../../../store/PreferencesStore';
import { getLabel } from '../../../util/suggestionUtils';
import { getJson } from '../../../util/xhrPromise';
import { findFeatures } from '../../../util/geo-utils';

class LocationPopup extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    getGeoJsonData: PropTypes.func.isRequired,
    language: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
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

    const promises = [
      getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
        'point.lat': lat,
        'point.lon': lon,
        'boundary.circle.lat': lat,
        'boundary.circle.lon': lon,
        'boundary.circle.radius': 0.1, // 100m
        lang: this.props.language,
        size: 1,
        layers: 'address',
      }),
    ];
    if (config.geoJson && config.geoJson.zones) {
      promises.push(this.props.getGeoJsonData(config.geoJson.zones.url));
    }

    Promise.all(promises).then(
      ([data, zoneData]) => {
        const zones = findFeatures(
          {
            lat,
            lon,
          },
          (zoneData && zoneData.data && zoneData.data.features) || [],
        );
        const zoneId = zones.length > 0 ? zones[0].Zone : undefined;

        if (data.features != null && data.features.length > 0) {
          const match = data.features[0].properties;
          this.setState({
            loading: false,
            location: {
              ...this.state.location,
              address: getLabel(match),
              zoneId,
            },
          });
        } else {
          this.setState({
            loading: false,
            location: {
              ...this.state.location,
              address: this.context.intl.formatMessage({
                id: 'location-from-map',
                defaultMessage: 'Selected location',
              }),
              zoneId,
            },
          });
        }
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
        <div className="padding-small">
          <CardHeader
            name={this.state.location.address}
            description={this.props.name}
            unlinked
            className="padding-small"
          >
            {zoneId && (
              <div className="zone-information-wrapper">
                {this.context.intl.formatMessage({
                  id: 'zone',
                  defaultMessage: 'Zone',
                })}
                <Icon
                  img={`icon-icon_zone-${zoneId.toLowerCase()}`}
                  viewBox="0 0 22 22"
                />
              </div>
            )}
          </CardHeader>
        </div>
        <MarkerPopupBottom location={this.state.location} />
      </Card>
    );
  }
}

const connectedComponent = connectToStores(
  LocationPopup,
  [GeoJsonStore, PreferencesStore],
  ({ getStore }) => {
    const language = getStore(PreferencesStore).getLanguage();
    const { getGeoJsonData } = getStore(GeoJsonStore);
    return { getGeoJsonData, language };
  },
);

export { connectedComponent as default, LocationPopup as Component };

import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import ZoneIcon from '../../ZoneIcon';
import PreferencesStore from '../../../store/PreferencesStore';
import { getLabel } from '../../../util/suggestionUtils';
import { reverseGeocode } from '../../../util/searchUtils';
import {
  getZoneLabelColor,
  getZoneLabelSize,
} from '../../../util/mapIconUtils';
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

    reverseGeocode(
      {
        'point.lat': lat,
        'point.lon': lon,
        'boundary.circle.radius': 0.1, // 100m
        lang: this.props.language,
        size: 1,
        layers: 'address',
        zones: 1,
      },
      config,
    ).then(
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
        const context = pathPrefixMatch ? pathPrefixMatch[1] : 'index';
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
        <div className="card-padding">
          <CardHeader
            name={this.state.location.address}
            description={this.props.name}
            unlinked
            className="padding-small"
          >
            <ZoneIcon
              showTitle
              zoneId={zoneId}
              zoneIdFontSize={getZoneLabelSize(zoneId, this.context.config)}
              zoneLabelColor={getZoneLabelColor(this.context.config)}
            />
          </CardHeader>
        </div>
        <MarkerPopupBottom location={this.state.location} />
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

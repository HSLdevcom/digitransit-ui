import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import MarkerPopupBottom from '../MarkerPopupBottom';
import { getLabel } from '../../../util/suggestionUtils';
import { getJson } from '../../../util/xhrPromise';
import Loading from '../../Loading';

class LocationPopup extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
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
    const language = this.context.getStore('PreferencesStore').getLanguage();
    getJson(this.context.config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': this.props.lat,
      'point.lon': this.props.lon,
      lang: language,
      size: 1,
      layers: 'address',
    }).then(
      data => {
        if (data.features != null && data.features.length > 0) {
          const match = data.features[0].properties;
          this.setState({
            loading: false,
            location: {
              ...this.state.location,
              address: getLabel(match),
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
            },
          });
        }
      },
      () => {
        this.setState({
          loading: false,
          address: this.context.intl.formatMessage({
            id: 'location-from-map',
            defaultMessage: 'Selected location',
          }),
        });
      },
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="card" style={{ height: '4rem' }}>
          <Loading />
        </div>
      );
    }
    return (
      <Card>
        <div className="padding-small">
          <CardHeader
            name={this.state.location.address}
            description={this.props.name}
            unlinked
            className="padding-small"
          />
        </div>
        <MarkerPopupBottom location={this.state.location} />
      </Card>
    );
  }
}

export default LocationPopup;

import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import { getJson } from '../../../util/xhrPromise';

class Covid19OpeningHoursPopup extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    feature: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const {
      feature: {
        properties: { fid },
      },
    } = this.props;

    getJson(
      `https://features.caresteouvert.fr/collections/public.poi_osm/items/${fid}.json`,
    ).then(res => {
      this.setState({ feature: res, loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="card smallspinner" style={{ height: '4rem' }}>
          <Loading />
        </div>
      );
    }
    const { name, brand, status, cat, fid } = this.state.feature.properties;
    return (
      <Card>
        <div className="padding-normal">
          <CardHeader
            name={ name || brand || cat}
            description={cat}
            unlinked
            className="padding-medium"
          />

          <div className="city-bike-container">
            <p>
              Covid-19 status: {status}
            </p>
            <p>
              Source: <a target="_blank" href={`https://www.bleibtoffen.de/place/${fid}`}>bleibtoffen.de</a>
            </p>
          </div>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(Covid19OpeningHoursPopup, {
  fragments: {},
});

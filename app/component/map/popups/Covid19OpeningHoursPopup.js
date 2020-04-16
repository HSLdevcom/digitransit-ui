import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import { getJson } from '../../../util/xhrPromise';
import OSMOpeningHours from './OSMOpeningHours';

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
    ).then(feature => {
      this.setState({ feature, loading: false });
    });
  }

  getOpeningHours = () => {
    const hours = this.state.feature.properties.opening_hours;
    if (hours) {
      return <OSMOpeningHours openingHours={hours} />;
    }
    return null;
  };

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
            name={name || brand || cat}
            description={cat}
            unlinked
            className="padding-medium"
            headingStyle="h2"
          />
          <p>
            <span className="covid-19-badge">COVID-19</span>
            <FormattedMessage
              id={`covid-19-${status}`}
              defaultMessage={status}
            />
          </p>
          <p>{this.getOpeningHours()}</p>
          <p>
            <FormattedMessage id="source" defaultMessage="Source" />:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.bleibtoffen.de/place/${fid}`}
            >
              bleibtoffen.de
            </a>
          </p>
        </div>
      </Card>
    );
  }
}

export default Relay.createContainer(Covid19OpeningHoursPopup, {
  fragments: {},
});

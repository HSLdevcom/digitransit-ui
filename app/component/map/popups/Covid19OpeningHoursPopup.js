import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
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
    featureId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.fetchFeatureData(props.featureId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.featureId !== prevProps.featureId) {
      this.showSpinner(); // has to be in a separate method so that eslint is quiet
      this.fetchFeatureData(this.props.featureId);
    }
  }

  showSpinner() {
    this.setState({ loading: true });
  }

  fetchFeatureData(id) {
    getJson(
      `https://features.caresteouvert.fr/collections/public.poi_osm/items/${id}.json`,
    ).then(feature => {
      this.setState({ feature, loading: false });
    });
  }

  renderOpeningHours() {
    const hours = this.state.feature.properties.opening_hours;
    if (hours) {
      return <OSMOpeningHours openingHours={hours} />;
    }
    return null;
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="card smallspinner" style={{ height: '4rem' }}>
          <Loading />
        </div>
      );
    }
    const {
      properties: { name, brand, status, cat, fid },
      geometry: {
        coordinates: [long, lat],
      },
    } = this.state.feature;

    const translatedCat = this.context.intl.formatMessage({
      id: `poi-${cat}`,
      defaultMessage: cat,
    });

    return (
      <Card>
        <div className="padding-normal">
          <CardHeader
            name={name || brand || translatedCat}
            description={translatedCat}
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
          <p>{this.renderOpeningHours()}</p>
          <p>
            <FormattedMessage id="source" defaultMessage="Source" />:{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.bleibtoffen.de/@${lat},${long},18/place/${fid}`}
            >
              bleibtoffen.de
            </a>
          </p>
        </div>
      </Card>
    );
  }
}

export default Covid19OpeningHoursPopup;

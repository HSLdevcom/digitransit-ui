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
    intl: intlShape.isRequired,
  };

  static propTypes = {
    featureId: PropTypes.string.isRequired,
  };

  hasRegularHours = false;

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
    const covidHours = this.state.feature.properties.opening_hours;
    const regularHours = this.state.feature.properties.tags.opening_hours;

    if (covidHours) {
      this.hasRegularHours = false;
      return <OSMOpeningHours openingHours={covidHours} />;
    }

    if (regularHours) {
      this.hasRegularHours = true;
      return <OSMOpeningHours openingHours={regularHours} />;
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

    const website =
      this.state.feature.properties.tags.website ||
      this.state.feature.properties.tags['contact:facebook'];

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
          {website ? (
            <a target="_blank" rel="noopener noreferrer" href={website}>
              <FormattedMessage id="website" defaultMessage="Website" />
            </a>
          ) : (
            ''
          )}
          <p>
            <span className="covid-19-badge">COVID-19</span>
            {this.hasRegularHours ? (
              <FormattedMessage
                id="covid-19-different-hours"
                defaultMessage="Opening hours may be different"
              />
            ) : (
              <FormattedMessage
                id={`covid-19-${status}`}
                defaultMessage={status}
              />
            )}
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

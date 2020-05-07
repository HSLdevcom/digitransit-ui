import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import { getJson } from '../../../util/xhrPromise';
import OSMOpeningHours from './OSMOpeningHours';
import MarkerPopupBottom from '../MarkerPopupBottom';

class Covid19OpeningHoursPopup extends React.Component {
  static contextTypes = {
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
    const {
      feature: { properties },
    } = this.state;
    const covidHours = properties.opening_hours;
    const regularHours = properties.tags.opening_hours;

    if (covidHours && covidHours !== 'open') {
      return <OSMOpeningHours openingHours={covidHours} displayStatus />;
    }

    if (regularHours) {
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
      properties: { name, brand, status, cat, fid, tags, delivery, takeaway },
      geometry: {
        coordinates: [long, lat],
      },
    } = this.state.feature;

    const hasDelivery =
      tags['delivery:covid19'] === 'yes' || delivery === 'yes';
    const hasTakeaway =
      tags['takeaway:covid19'] === 'yes' || takeaway === 'yes';

    const translatedCat = this.context.intl.formatMessage({
      id: `poi-${cat}`,
      defaultMessage: cat,
    });

    const website = tags.website || tags['contact:facebook'];

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
          {hasTakeaway ? (
            <div className="delivery-takeaway">
              <FormattedMessage
                id="covid-takeaway"
                defaultMessage="Take-away service available"
              />
            </div>
          ) : (
            ''
          )}
          {hasDelivery ? (
            <div className="delivery-takeaway">
              <FormattedMessage
                id="covid-delivery"
                defaultMessage="Delivery service available"
              />
            </div>
          ) : (
            ''
          )}
          <p>
            <span className="covid-19-badge">COVID-19</span>
            {/* eslint-disable-next-line no-nested-ternary */}
            {status === 'unknown' && tags.opening_hours ? (
              <FormattedMessage
                id="covid-19-different-hours"
                defaultMessage="Opening hours may be different"
              />
            ) : status === 'open_adapted' ? (
              <FormattedMessage id="covid-19-partial" defaultMessage={status} />
            ) : (
              <FormattedMessage
                id={`covid-19-${status}`}
                defaultMessage={status}
              />
            )}
          </p>
          <p>{this.renderOpeningHours()}</p>
          <Link
            href={`https://www.bleibtoffen.de/@${lat},${long},18/place/${fid}`}
            target="_blank"
            rel="noopener noreferrer"
            onlyActiveOnIndex={false}
            className="link-as-button"
          >
            <FormattedMessage
              id="covid-19-opening-edit"
              defaultMessage="Edit on bleibtoffen.de"
            />
          </Link>
        </div>
        <MarkerPopupBottom
          location={{
            address: name,
            lat,
            lon: long,
          }}
        />
      </Card>
    );
  }
}

export default Covid19OpeningHoursPopup;

import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { SimpleOpeningHours } from 'simple-opening-hours';
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
    ).then(feature => {
      this.setState({ feature, loading: false });
    });
  }

  getOpeningHours = () => {
    const { intl } = this.context;
    const opening = new SimpleOpeningHours(
      this.state.feature.properties.opening_hours,
    );
    const openingTable = opening.getTable();
    const { mo, tu, we, th, fr, sa, su, ph } = openingTable;

    const closed = intl.formatMessage({
      id: 'closed',
      defaultMessage: 'Closed',
    });

    return (
      <p>
        {intl.formatMessage({
          id: 'monday',
          defaultMessage: 'Mon',
        })}{' '}
        <span className="popup-opening-hours-times">
          {mo.length === 0 ? closed : mo}
        </span>
        <br />
        {intl.formatMessage({
          id: 'tuesday',
          defaultMessage: 'Tue',
        })}{' '}
        <span className="popup-opening-hours-times">
          {tu.length === 0 ? closed : tu}
        </span>
        <br />
        {intl.formatMessage({
          id: 'wednesday',
          defaultMessage: 'Wed',
        })}{' '}
        <span className="popup-opening-hours-times">
          {we.length === 0 ? closed : we}
        </span>
        <br />
        {intl.formatMessage({
          id: 'thursday',
          defaultMessage: 'Thu',
        })}{' '}
        <span className="popup-opening-hours-times">
          {th.length === 0 ? closed : th}
        </span>
        <br />
        {intl.formatMessage({
          id: 'friday',
          defaultMessage: 'Fri',
        })}{' '}
        <span className="popup-opening-hours-times">
          {fr.length === 0 ? closed : fr}
        </span>
        <br />
        {intl.formatMessage({
          id: 'saturday',
          defaultMessage: 'Sat',
        })}{' '}
        <span className="popup-opening-hours-times">
          {sa.length === 0 ? closed : sa}
        </span>
        <br />
        {intl.formatMessage({
          id: 'sunday',
          defaultMessage: 'Sun',
        })}{' '}
        <span className="popup-opening-hours-times">
          {su.length === 0 ? closed : su}
        </span>
        <br />
        {intl.formatMessage({
          id: 'public-holidays',
          defaultMessage: 'Public holidays',
        })}{' '}
        <span className="popup-opening-hours-times">
          {ph.length === 0 ? closed : ph}
        </span>
      </p>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="card smallspinner" style={{ height: '4rem' }}>
          <Loading />
        </div>
      );
    }
    const {
      name,
      brand,
      status,
      cat,
      fid,

      // eslint-disable-next-line camelcase
      opening_hours,
    } = this.state.feature.properties;

    return (
      <Card>
        <div className="padding-normal">
          <CardHeader
            name={name || brand || cat}
            description={cat}
            unlinked
            className="padding-medium"
          />

          <div className="city-bike-container">
            <p>Covid-19 status: {status}</p>
            {/* eslint-disable-next-line camelcase */}
            {opening_hours ? (
              <div>
                <p>
                  <FormattedMessage
                    id="opening-hours"
                    defaultMessage="Opening hours"
                  />
                </p>
                {this.getOpeningHours()}
              </div>
            ) : (
              ''
            )}
            <p>
              Source:{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.bleibtoffen.de/place/${fid}`}
              >
                bleibtoffen.de
              </a>
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

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
    const weekdays = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su', 'ph'];
    const openingTable = opening.getTable();

    const closed = intl.formatMessage({
      id: 'closed',
      defaultMessage: 'Closed',
    });

    const makeRow = day => {
      let hours;
      if (openingTable[day].length === 0) {
        hours = [closed];
      } else {
        hours = openingTable[day];
      }
      return (
        <tr key={day}>
          <td>
            {intl.formatMessage({
              id: `weekday-${day}`,
              defaultMessage: day,
            })}
          </td>
          <td>{hours.map(h => <div>{h}</div>)}</td>
        </tr>
      );
    };

    return (
      <p>
        <table className="popup-opening-hours">
          <tbody>{weekdays.map(makeRow)}</tbody>
        </table>
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
              <FormattedMessage
                id="source"
                defaultMessage="Source:"
              />
              <a
                style = {{'padding-left': '3px'}}
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

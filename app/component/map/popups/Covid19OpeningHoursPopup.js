import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { SimpleOpeningHours } from 'simple-opening-hours';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import Loading from '../../Loading';
import { getJson } from '../../../util/xhrPromise';
import FormattedMessage from '../../StopTitle';

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
    const { name, brand, status, cat, fid, opening_hours } = this.state.feature.properties;
    const { intl } = this.context;
    let opening;
    let openingTable;
    let openingHoursString;

    if (opening_hours) {
      opening = new SimpleOpeningHours(opening_hours);
      openingTable = opening.getTable();

      openingHoursString = `${intl.formatMessage({
        id: 'monday-3',
        defaultMessage: 'Mon',
      })}\t${openingTable.mo}\n${intl.formatMessage({
        id: 'tuesday-3',
        defaultMessage: 'Tue',
      })}\t\t${openingTable.tu}\n${intl.formatMessage({
        id: 'wednesday-3',
        defaultMessage: 'Wed',
      })}\t${openingTable.we}\n${intl.formatMessage({
        id: 'thursday-3',
        defaultMessage: 'Thu',
      })}\t\t${openingTable.th}\n${intl.formatMessage({
        id: 'friday-3',
        defaultMessage: 'Fri',
      })}\t\t${openingTable.fr}\n${intl.formatMessage({
        id: 'saturday-3',
        defaultMessage: 'Sat',
      })}\t\t${openingTable.sa}\n${intl.formatMessage({
        id: 'sunday-3',
        defaultMessage: 'Sun',
      })}\t\t${openingTable.su}\n${intl.formatMessage({
        id: 'holiday-3',
        defaultMessage: 'PH',
      })}\t\t${openingTable.ph}`;
    }

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
            {opening_hours ? (
              <p>
                <FormattedMessage id="opening-hours" defaultMessage="Opening hours" />
                <pre className="popup-opening-hours">{openingHoursString}</pre>
              </p>
            ) : (
              ''
            )}
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

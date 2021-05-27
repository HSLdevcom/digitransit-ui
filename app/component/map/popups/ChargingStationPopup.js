import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { intlShape } from 'react-intl';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';
import ChargingStations from '../tile-layer/ChargingStations';
import Loading from '../../Loading';

const ChargingStationPopup = (props, context) => {
  const CHARGING_STATION_DETAILS_API =
    'https://ochp.next-site.de/api/ocpi/2.2/location/';
  const { lat, lon } = props;
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetails({});
    fetch(`${CHARGING_STATION_DETAILS_API}${props.id}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setDetails(data);
      });
  }, [props]);

  const getCapacity = () => {
    const { intl } = context;
    const { capacity, available } = props;

    if (typeof available === 'number') {
      return intl.formatMessage(
        {
          id: 'charging-spaces-available',
          defaultMessage: '{available} of {capacity} parking spaces available',
        },
        { capacity, available },
      );
    }

    if (typeof capacity === 'number') {
      return intl.formatMessage(
        {
          id: 'charging-spaces-in-total',
          defaultMessage: 'Capacity: {capacity} parking spaces',
        },
        props,
      );
    }
    return null;
  };

  const getPayment = paymentResources => {
    return <a href={paymentResources[0].url}>Payment details</a>;
  };

  const getEvses = () => {
    const { evses } = details;
    const { intl } = context;
    if (evses) {
      return (
        <div>
          {evses.map(evse => (
            <div key={evse.evse_id}>
              <h4>{evse.evse_id}</h4>
              <div>{`Status: ${evse.status}`}</div>
              {evse.opening_times.twentyfourseven && (
                <div>
                  {intl.formatMessage({
                    id: 'open-24-7',
                    defaultMessage: 'Open 24/7',
                  })}
                </div>
              )}
              {evse.related_resource && getPayment(evse.related_resource)}
            </div>
          ))}
        </div>
      );
    }
    return <div />;
  };

  return !loading ? (
    <Card>
      <div className="padding-normal charging-station-popup">
        <CardHeader
          name={details.name}
          descClass="padding-vertical-small"
          unlinked
          icon={ChargingStations.getIcon(props)}
          className="padding-medium"
          headingStyle="h2"
          description=""
        />
        <div className="content">
          <div>{getCapacity()}</div>
          {getEvses()}
        </div>
      </div>
      <MarkerPopupBottom
        onSelectLocation={props.onSelectLocation}
        location={{
          address: details.address,
          lat,
          lon,
        }}
      />
    </Card>
  ) : (
    <Card>
      <CardHeader
        name=""
        descClass="padding-vertical-small"
        unlinked
        className="padding-medium"
        headingStyle="h2"
        description=""
      />
      <div className="padding-normal charging-station-popup">
        <div className="content">
          <Loading />
        </div>
      </div>
    </Card>
  );
};

ChargingStationPopup.propTypes = {
  id: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
  available: PropTypes.number.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
  onSelectLocation: PropTypes.func.isRequired,
};

ChargingStationPopup.description = (
  <div>
    <p>Renders a citybike popup.</p>
    <ComponentUsageExample description="">
      <ChargingStationPopup
        id={123}
        capacity={1}
        available={1}
        lat={123}
        lon={123}
        context="context object here"
        station={exampleStation}
      >
        Im content of a citybike card
      </ChargingStationPopup>
    </ComponentUsageExample>
  </div>
);

ChargingStationPopup.contextTypes = {
  intl: intlShape.isRequired,
};

export default ChargingStationPopup;

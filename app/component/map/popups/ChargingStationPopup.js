/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { intlShape } from 'react-intl';
import {
  Chademo,
  DomesticF,
  IEC603092Single,
  IEC603092SThree,
  IEC62196T1,
  IEC62196T2,
  IEC62196T2Combo,
  TeslaS,
} from 'react-charging-station-connector-icons';
import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import { station as exampleStation } from '../../ExampleData';
import ComponentUsageExample from '../../ComponentUsageExample';
import ChargingStations from '../tile-layer/ChargingStations';
import Loading from '../../Loading';
import Icon from '../../Icon';

const CONNECTOR_ICONS_MAP = {
  CHADEMO: <Chademo variant="light" subtitle="false" />,
  DOMESTIC_F: <DomesticF variant="light" subtitle="false" />,
  IEC_60309_2_single_16: <IEC603092Single variant="light" subtitle="false" />,
  IEC_60309_2_three_16: <IEC603092SThree variant="light" subtitle="false" />,
  IEC_60309_2_three_32: <IEC603092SThree variant="light" subtitle="false" />,
  IEC_60309_2_three_64: <IEC603092SThree variant="light" subtitle="false" />,
  IEC_62196_T1: <IEC62196T1 variant="light" subtitle="false" />,
  IEC_62196_T2: <IEC62196T2 variant="light" subtitle="false" />,
  IEC_62196_T2_COMBO: <IEC62196T2Combo variant="light" subtitle="false" />,
  TESLA_S: <TeslaS variant="light" subtitle="false" />,
};

const CONNECTOR_TYPES_MAP = {
  CHADEMO: 'CHAdeMO',
  DOMESTIC_F: 'Type F',
  IEC_60309_2_single_16: 'Single phase',
  IEC_60309_2_three_16: 'Three phase',
  IEC_60309_2_three_32: 'Three phase',
  IEC_60309_2_three_64: 'Three phase',
  IEC_62196_T1: 'Type 1',
  IEC_62196_T2: 'Type 2',
  IEC_62196_T2_COMBO: 'Type 2 combo',
  TESLA_S: 'Tesla S',
};

const getConnectors = evses => {
  const connectors = evses?.reduce(
    (previous, evse) => [
      ...previous,
      ...evse.connectors.map(connector => {
        return {
          standard: connector.standard,
          maxAmperage: connector.max_amperage,
        };
      }),
    ],
    [],
  );

  const uniqueConnectors = [
    ...new Map(connectors?.map(item => [item.standard, item])).values(),
  ];

  return uniqueConnectors?.map(connector => ({
    icon: CONNECTOR_ICONS_MAP[connector.standard],
    text: `${CONNECTOR_TYPES_MAP[connector.standard] || connector.standard} - ${
      connector.maxAmperage
    } kW`,
  }));
};

const ChargingStationPopup = (props, context) => {
  const CHARGING_STATION_DETAILS_API =
    'https://ochp.next-site.de/api/ocpi/2.2/location/';
  const { lat, lon } = props;
  const [details, setDetails] = useState({});
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetails({});
    fetch(`${CHARGING_STATION_DETAILS_API}${props.id}`)
      .then(res => res.json())
      .then(data => {
        setConnectors(getConnectors(data.evses));
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

  const getDirectDeepLink = () => {
    const { intl } = context;
    const link = details?.evses
      ? details.evses[0]?.related_resource[0]?.url
      : undefined;
    return (
      link && (
        <a href={link}>
          {intl.formatMessage({
            id: 'charging-direct-deep-link',
            defaultMessage: 'Start charging',
          })}
        </a>
      )
    );
  };

  const getOpeningTimes = () => {
    const { intl } = context;
    const openingTimes =
      details?.opening_times || details?.evses
        ? details.evses[0].opening_times
        : undefined;
    return (
      openingTimes?.twentyfourseven && (
        <div>
          {intl.formatMessage({
            id: 'open-24-7',
            defaultMessage: 'Open 24/7',
          })}
        </div>
      )
    );
  };

  const getAddress = () => {
    const { address, city, postal_code } = details;

    return (
      address &&
      city &&
      postal_code && <div>{`${address}, ${postal_code}, ${city}`}</div>
    );
  };

  const getPhoneNumber = () => {
    const { evses } = details;
    const phone = evses ? evses[0].phone : undefined;
    return phone && <div>{phone.replace('00', '+')}</div>;
  };

  const getPaymentTypes = () => {
    const { intl } = context;

    const capabilities = details?.evses
      ? details.evses[0].capabilities
      : undefined;
    const supportsRfid = capabilities?.includes('RFID_READER');
    const rfidMessage = intl.formatMessage({
      id: 'charging-payment-rfid',
      defaultMessage: 'RFID',
    });
    const supportsCreditCard = capabilities?.includes('CREDIT_CARD_PAYABLE');
    const creditCardMessage = intl.formatMessage({
      id: 'charging-payment-credit',
      defaultMessage: 'Credit Card',
    });
    const supportsDebitCard = capabilities?.includes('DEBIT_CARD_PAYABLE');
    const debitCardMessage = intl.formatMessage({
      id: 'charging-payment-debit',
      defaultMessage: 'Debit Card',
    });
    const supportsContactless = capabilities?.includes(
      'CONTACTLESS_CARD_SUPPORT',
    );
    const contactlessMessage = intl.formatMessage({
      id: 'charging-payment-contactless',
      defaultMessage: 'Contactless',
    });

    return (
      capabilities && (
        <div>
          {supportsRfid && <span>{`${rfidMessage}`}</span>}
          {supportsCreditCard && <span>{`, ${creditCardMessage}`}</span>}
          {supportsDebitCard && <span>{`, ${debitCardMessage}`}</span>}
          {supportsContactless && <span>{`, ${contactlessMessage}`}</span>}
        </div>
      )
    );
  };

  return !loading ? (
    <Card className="charging-station-card">
      <div className="padding-normal charging-station-popup">
        <CardHeader
          name={details.name}
          descClass="padding-vertical-small"
          unlinked
          icon={ChargingStations.getIcon(props)}
          className="padding-medium"
          headingStyle="h2"
          description=""
          showCardSubHeader={false}
        />
        <div className="content">
          <div className="text-light">
            <Icon
              img="icon-icon_schedule"
              color="#939393"
              width="16px"
              height="16px"
            />
            <span className="text-alignment">{getOpeningTimes()}</span>
          </div>
          <div className="charging-station-divider" />
          <div className="charging-info-container">
            <div className="connector-container">
              {connectors.map(connector => (
                <div key={connector.text}>
                  <span className="connector-icon">{connector.icon}</span>
                  <span className="text-alignment">{connector.text}</span>
                </div>
              ))}
            </div>
            <div className="text-light text-alignment">|</div>
            <div className="text-light text-alignment">{getCapacity()}</div>
          </div>
          <div className="charging-station-divider" />
          <div className="text-light">
            <Icon
              img="icon-icon_payment"
              color="#939393"
              width="16px"
              height="16px"
            />
            <span className="text-alignment">{getPaymentTypes()}</span>
          </div>
          <div className="text-light">
            <Icon
              img="icon-icon_place"
              color="#939393"
              width="16px"
              height="16px"
            />
            <span className="text-alignment">{getAddress()}</span>
          </div>
          <div className="text-light">
            <Icon
              img="icon-icon_call"
              color="#939393"
              width="16px"
              height="16px"
            />
            <span className="text-alignment">{getPhoneNumber()}</span>
          </div>
          <div className="charging-station-divider" />
          <div>{getDirectDeepLink()}</div>
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

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
import isNumber from 'lodash/isNumber';
import Loading from '../../Loading';
import Icon from '../../Icon';
import withBreakpoint from '../../../util/withBreakpoint';
import SidebarContainer from './SidebarContainer';

export const getIcon = properties => {
  const { cb, c, name } = properties;
  // c - car capacity, cb - bike capacity
  return `icon-icon_stop_${
    (!c && cb) || name.includes('E-Bike') ? 'bicycle' : 'car'
  }_charging_station`;
};

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
          id: String(connector.evse_id),
          standard: connector.standard,
          maxPower: connector.max_electric_power,
        };
      }),
    ],
    [],
  );
  const uniqueConnectors = Array.from(
    new Map(connectors?.map(item => [item.standard, item])).values(),
  );

  return uniqueConnectors?.map(connector => {
    let text = '';
    if (Number.isInteger(connector.maxPower)) {
      const powerInKw = Math.floor(connector.maxPower / 1000);
      text = `${
        CONNECTOR_TYPES_MAP[connector.standard] || connector.standard
      } - ${powerInKw} kW`;
    }
    return {
      id: connector.id,
      icon: CONNECTOR_ICONS_MAP[connector.standard],
      text,
    };
  });
};

const ChargingStationContent = ({ match }, { intl, config }) => {
  const { CHARGING_STATION_DETAILS_API } = config.URL;
  const { lat, lng } = match.location.query;
  const [details, setDetails] = useState({});
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetails({});
    fetch(`${CHARGING_STATION_DETAILS_API}${match.location.query.stationId}`)
      .then(res => res.json())
      .then(data => {
        setConnectors(getConnectors(data.evses));
        setLoading(false);
        setDetails(data);
      });
  }, [match.location.query]);

  const getCapacity = () => {
    const available = details.evses?.filter(evse => evse.status === 'AVAILABLE')
      .length;
    const capacityUnknown = details.evses?.filter(
      evse => evse.status === 'UNKNOWN' || evse.status === 'STATIC',
    ).length;
    const capacity = details.evses?.length;
    const body = {
      id: 'charging-spaces-no-data',
      defaultMessage: 'No capacity data available',
    };

    if (capacity) {
      if (isNumber(available) && capacityUnknown === 0) {
        body.id = 'charging-spaces-available';
        body.defaultMessage =
          '{available} of {capacity} parking spaces available';
      } else {
        body.id = 'charging-spaces-in-total';
        body.defaultMessage = 'Capacity: {capacity} parking spaces';
      }
    }

    return (
      <>
        <div className="text-light text-alignment">|</div>
        <div className="text-light text-alignment">
          {intl.formatMessage(body, { capacity, available })}
        </div>
      </>
    );
  };

  const getDirectDeepLink = () => {
    let link;

    if (
      details &&
      details.evses &&
      details.evses[0] &&
      details.evses[0].related_resource
    ) {
      link = details.evses[0]?.related_resource[0]?.url;
    }
    return (
      link && (
        <div className="direct-deep-link">
          <Icon className="sidebar-info-icon" img="icon-icon_power" />
          <span className="text-alignment">
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={link} target="_blank">
              {intl.formatMessage({
                id: 'charging-direct-deep-link',
                defaultMessage: 'Start charging',
              })}
            </a>
          </span>
        </div>
      )
    );
  };

  const getOpeningTimes = () => {
    const openingTimes = details?.opening_times;
    if (!openingTimes?.twentyfourseven) {
      return null;
    }
    return (
      <div className="text-light opening-times-container">
        <Icon className="sidebar-info-icon" img="icon-icon_schedule" />
        <span className="text-alignment">
          {intl.formatMessage({
            id: 'open-24-7',
            defaultMessage: 'Open 24/7',
          })}
        </span>
      </div>
    );
  };

  const getAddress = () => {
    const { address, city, postal_code } = details;

    return (
      address &&
      city &&
      postal_code && <div>{`${address}, ${postal_code} ${city}`}</div>
    );
  };

  const getPhoneInfo = () => {
    const { evses } = details;
    const phone = evses ? evses[0].phone : undefined;
    if (!phone) {
      return null;
    }
    return (
      <div className="text-light sidebar-info-container">
        <Icon className="sidebar-info-icon" img="icon-icon_call" />
        <span className="text-alignment">
          <div>{phone.replace('00', '+')}</div>
        </span>
      </div>
    );
  };

  const knownPaymentTypes = [
    ['RFID_READER', 'charging-payment-rfid', 'RFID'],
    ['CREDIT_CARD_PAYABLE', 'charging-payment-credit', 'Credit Card'],
    ['DEBIT_CARD_PAYABLE', 'charging-payment-debit', 'Debit Card'],
    ['CONTACTLESS_CARD_SUPPORT', 'charging-payment-contactless', 'Contactless'],
  ];

  const getPaymentTypes = () => {
    const capabilities = (details.evses || [])[0]?.capabilities || [];
    const paymentTypes = knownPaymentTypes
      .filter(([identifier]) => capabilities.includes(identifier))
      .map(([identifier, messageId, defaultMessage]) => {
        return (
          <span key={identifier}>
            {intl.formatMessage({
              id: messageId,
              defaultMessage,
            })}
          </span>
        );
      })
      .reduce((acc, paymentType) => [...acc, ', ', paymentType], [])
      .slice(1);

    if (paymentTypes.length === 0) {
      return null;
    }
    return (
      <div className="text-light sidebar-info-container">
        <Icon className="sidebar-info-icon" img="icon-icon_payment" />
        <span className="text-alignment">{paymentTypes}</span>
      </div>
    );
  };

  return !loading ? (
    <SidebarContainer
      className="charging-station-card"
      location={{
        address: details.address,
        lat: Number(lat),
        lon: Number(lng),
      }}
      name={details.name || details.address}
      icon={getIcon(match.location.query)}
      newLayout
    >
      <div className="content">
        {getOpeningTimes()}
        <div className="divider" />
        <div className="sidebar-info-container">
          <div className="connector-container">
            {connectors.map(connector => (
              <div key={connector.id}>
                <span className="connector-icon">{connector.icon}</span>
                <span className="text-alignment">{connector.text}</span>
              </div>
            ))}
          </div>
          {getCapacity()}
        </div>
        <div className="divider" />
        {getPaymentTypes()}
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="icon-icon_place" />
          <span className="text-alignment">{getAddress()}</span>
        </div>
        {getPhoneInfo()}
        <div className="divider" />
        {getDirectDeepLink()}
      </div>
    </SidebarContainer>
  ) : (
    <SidebarContainer>
      <div className="padding-normal charging-station-popup">
        <div className="content">
          <Loading />
        </div>
      </div>
    </SidebarContainer>
  );
};

ChargingStationContent.propTypes = {
  match: PropTypes.object,
};

ChargingStationContent.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default withBreakpoint(ChargingStationContent);

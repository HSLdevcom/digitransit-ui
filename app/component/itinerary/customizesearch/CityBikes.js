import React from 'react';
import { FormattedMessage } from 'react-intl';
import NetworkSelector from './NetworkSelector';
import { TransportMode } from '../../../constants';

export default function CityBikes() {
  return (
    <>
      <div className="section-header">
        <FormattedMessage id="citybike-network-headers" />
      </div>
      <NetworkSelector type={TransportMode.Citybike} />
    </>
  );
}

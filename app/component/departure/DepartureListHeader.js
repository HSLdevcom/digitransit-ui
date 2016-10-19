import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const DepartureListHeader = () => (
  <div className="departure-list-header padding-vertical-small border-top">
    <span className="time-header">
      <FormattedMessage
        id='leaves'
        defaultMessage="Leaves" />
    </span>
    <span className="route-number-header">
      <FormattedMessage
        id='line'
        defaultMessage="Line" />
    </span>
    <span className="route-destination-header">
      <FormattedMessage
        id='destination'
        defaultMessage="Destination" />
    </span>
  </div>
);

DepartureListHeader.displayName = 'DepartureListHeader';

DepartureListHeader.description = (
  <div>
    <ComponentUsageExample description="basic">
      <DepartureListHeader />
    </ComponentUsageExample>
  </div>
);

export default DepartureListHeader;

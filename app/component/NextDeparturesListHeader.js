import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

const NextDeparturesListHeader = () => (
  <tr className="header-tr">
    <th className="th-to-stop">
      <FormattedMessage id="to-stop" defaultMessage="To stop" />
    </th>
    <th className="th-route">
      <FormattedMessage id="route" defaultMessage="Route" />
    </th>
    <th className="th-destination">
      <FormattedMessage id="destination" defaultMessage="Destination" />
    </th>
    <th className="th-leaves">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </th>
    <th className="th-next">
      <FormattedMessage id="next" defaultMessage="Next" />
    </th>
  </tr>
);

NextDeparturesListHeader.displayName = 'NextDeparturesListHeader';

NextDeparturesListHeader.description = () => (
  <div>
    <ComponentUsageExample>
      <NextDeparturesListHeader />
    </ComponentUsageExample>
  </div>
);

export default NextDeparturesListHeader;

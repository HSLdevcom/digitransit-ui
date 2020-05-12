import PropTypes from 'prop-types';
import React from 'react';

import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

export function getIcon(type) {
  switch (type) {
    case 'Palvelupiste':
      return 'icon-icon_service-point';
    case 'Monilippuautomaatti':
      return 'icon-icon_ticket-machine';
    case 'Kertalippuautomaatti':
      return 'icon-icon_ticket-machine-single';
    case 'Myyntipiste':
      return 'icon-icon_ticket-sales-point';
    default:
      // eslint-disable-next-line no-console
      console.log(`Unknown ticket sales type: ${type}`);
      return 'icon-icon_ticket-sales-point';
  }
}

function TicketSalesPopup(props) {
  return (
    <div className="card">
      <Card className="card-padding">
        <CardHeader
          name={props.Name_fi}
          description={props.Address_fi}
          icon={getIcon(props.Tyyppi)}
          unlinked
        />
      </Card>
      <MarkerPopupBottom
        location={{
          address: props.Name_fi,
          lat: props.LAT,
          lon: props.LON,
        }}
      />
    </div>
  );
}

TicketSalesPopup.description = (
  <div>
    <p>Renders a ticket sales popup.</p>
    <ComponentUsageExample description="">
      <TicketSalesPopup context="context object here" />
    </ComponentUsageExample>
  </div>
);

TicketSalesPopup.propTypes = {
  Tyyppi: PropTypes.string.isRequired,
  Name_fi: PropTypes.string.isRequired,
  Address_fi: PropTypes.string.isRequired,
  LAT: PropTypes.number.isRequired,
  LON: PropTypes.number.isRequired,
};

export default TicketSalesPopup;

import React from 'react';

import MarkerPopupBottom from '../MarkerPopupBottom';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import ComponentUsageExample from '../../ComponentUsageExample';

export function getIcon(type) {
  switch (type) {
    case 'Palvelupiste':
      return 'icon-icon_service-point';
    case 'HSL Automaatti MNL':
      return 'icon-icon_ticket-machine';
    case 'HSL Automaatti KL':
      return 'icon-icon_ticket-machine-single';
    case 'Myyntipiste':
      return 'icon-icon_ticket-sales-point';
    case 'R-kioski':
      return 'icon-icon_ticket-sales-point';
    default:
      console.log(`Unknown ticket sales type: ${type}`);
      return 'icon-icon_ticket-sales-point';
  }
}

function TicketSalesPopup(props) {
  return (
    <div className="card">
      <Card className="padding-small">
        <CardHeader
          name={props.NIMI}
          description={props.OSOITE}
          icon={getIcon(props.TYYPPI)}
          unlinked
        />
      </Card>
      <MarkerPopupBottom
        location={{
          address: props.NIMI,
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
  TYYPPI: React.PropTypes.string.isRequired,
  NIMI: React.PropTypes.string.isRequired,
  OSOITE: React.PropTypes.string.isRequired,
  LAT: React.PropTypes.number.isRequired,
  LON: React.PropTypes.number.isRequired,
};

export default TicketSalesPopup;

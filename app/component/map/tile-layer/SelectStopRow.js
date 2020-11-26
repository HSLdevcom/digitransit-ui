import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';

function SelectStopRow({ gtfsId, type, name, code, terminal, desc }) {
  let iconId;
  switch (type) {
    case 'TRAM':
      iconId = 'icon-icon_tram';
      break;
    case 'RAIL':
      iconId = 'icon-icon_rail';
      break;
    case 'BUS':
      iconId = 'icon-icon_bus';
      break;
    case 'SUBWAY':
      iconId = 'icon-icon_subway';
      break;
    case 'FERRY':
      iconId = 'icon-icon_ferry';
      break;
    case 'AIRPLANE':
      iconId = 'icon-icon_airplane';
      break;
    case 'CARPOOL':
      iconId = 'icon-icon_carpool';
      break;
    default:
      iconId = 'icon-icon_bus';
      break;
  }

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const prefix = terminal ? PREFIX_TERMINALS : PREFIX_STOPS;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${prefix}/${encodeURIComponent(gtfsId)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={iconId} />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        {(showDesc || showCode) && (
          <span className="choose-row-text">
            {showDesc && <span className="choose-row-address">{desc}</span>}
            {showCode && <span className="choose-row-number">{code}</span>}
          </span>
        )}
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.description = () => (
  <div>
    <p>Renders a select stop row</p>
    <ComponentUsageExample description="">
      <SelectStopRow
        gtfsId="TEST"
        type="BUS"
        name="Testipysäkki"
        code="X0000"
        desc="Testikatu"
      />
    </ComponentUsageExample>
  </div>
);

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
};

SelectStopRow.defaultProps = {
  terminal: false,
  code: null,
  desc: null,
};

export default SelectStopRow;

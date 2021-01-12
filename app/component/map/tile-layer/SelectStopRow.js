import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';

function SelectStopRow({ gtfsId, type, name, code, terminal, desc }) {
  const iconOptions = {};
  switch (type) {
    case 'TRAM':
      iconOptions.iconId = 'icon-icon_tram';
      break;
    case 'RAIL':
      iconOptions.iconId = 'icon-icon_rail';
      break;
    case 'BUS':
      iconOptions.iconId = 'icon-icon_bus-stop';
      iconOptions.color = '#007ac9';
      break;
    case 'SUBWAY':
      iconOptions.iconId = 'icon-icon_subway';
      break;
    case 'FERRY':
      iconOptions.iconId = 'icon-icon_ferry';
      break;
    case 'AIRPLANE':
      iconOptions.iconId = 'icon-icon_airplane';
      break;
    default:
      iconOptions.iconId = 'icon-icon_bus';
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
        <Icon img={iconOptions.iconId} color={iconOptions.color || null} />
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

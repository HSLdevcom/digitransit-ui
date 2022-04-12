import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { getDatahubPoiPath } from '../../../util/path';
import Icon from '../../Icon';

function SelectDatahubPoiRow(props) {
  const { datahubId, icon, name, description } = props;

  const path = getDatahubPoiPath(datahubId);

  return (
    <Link className="stop-popup-choose-row" to={path}>
      <span className="choose-row-left-column" aria-hidden="true">
        {icon ? <Icon img={icon} /> : null}
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        <span className="choose-row-text">
          <span className="choose-row-address">{description}</span>
        </span>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectDatahubPoiRow.propTypes = {
  datahubId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

export default SelectDatahubPoiRow;

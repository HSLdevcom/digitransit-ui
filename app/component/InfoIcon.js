import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { PREFIX_STOPS } from '../util/path';

const InfoIcon = ({ stop }) => (
  <Link href={`/${PREFIX_STOPS}/${stop.gtfsId}/info`}>
    <span className="cursor-pointer">
      <Icon className="info" img="icon-icon_info" />
    </span>
  </Link>
);

InfoIcon.propTypes = {
  stop: PropTypes.object.isRequired,
};

InfoIcon.displayName = 'InfoIcon';

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

InfoIcon.description = () => (
  <div>
    <ComponentUsageExample description="basic">
      <InfoIcon stop={exampleStop} />
    </ComponentUsageExample>
  </div>
);

export default InfoIcon;

import React from 'react';
import Icon from './Icon';
import NotImplementedLink from './NotImplementedLink';
import ComponentUsageExample from './ComponentUsageExample';

const InfoIcon = ({ stop }) => (
  <NotImplementedLink
    href={`/pysakit/${stop.gtfsId}/info`}
    name="info"
    nonTextLink
  >
    <span className="cursor-pointer">
      <Icon className="info" img="icon-icon_info" />
    </span>
  </NotImplementedLink>
);

InfoIcon.propTypes = {
  stop: React.PropTypes.object.isRequired,
};

InfoIcon.displayName = 'InfoIcon';

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
};

InfoIcon.description = () =>
  <div>
    <ComponentUsageExample description="basic">
      <InfoIcon stop={exampleStop} />
    </ComponentUsageExample>
  </div>;

export default InfoIcon;

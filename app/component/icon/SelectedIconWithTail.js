import React from 'react';
import IconWithTail from './IconWithTail';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const SelectedIconWithTail = ({ img }) => (
  <IconWithTail img={img} className="selected-tail-icon" >
    <svg>
      <circle strokeWidth="2" r="16" cx="40" cy="40" fill="rgba(0,0,0,0)" stroke="#575757" />
      <use xlinkHref={'#icon-icon_attention'} transform="translate(47,22) scale(0.15) " />
    </svg>
  </IconWithTail>);

SelectedIconWithTail.displayName = 'SelectedIconWithTail';

SelectedIconWithTail.description = (
  <div>
    <p>Shows an selected (vehicle) icon that cconsists of IconWithTail and a green ckecked
    mark and a greyish circle on top of it.</p>
    <ComponentUsageExample description="">
      <SelectedIconWithTail className="bus selected-tail-icon" img="icon-icon_bus-live" />
    </ComponentUsageExample>
  </div>
);

SelectedIconWithTail.propTypes = {
  img: React.PropTypes.string.isRequired,
};

export default SelectedIconWithTail;

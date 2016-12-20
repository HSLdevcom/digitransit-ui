import React from 'react';
import IconWithTail from './IconWithTail';
import ComponentUsageExample from './ComponentUsageExample';

const SelectedIconWithTail = ({ img, fullscreenMap }) => (
  <IconWithTail
    img={img}
    className="selected-tail-icon"
    rotate={180}
    scrollIntoView={fullscreenMap}
  >
    <svg>
      <circle strokeWidth="2" r="16" cx="40" cy="40" fill="rgba(0,0,0,0)" stroke="#575757" />
      <use xlinkHref={'#icon-icon_good-availability'} transform="translate(47,22) scale(0.15) " />
      <circle strokeWidth="1" r="6" cx="53" cy="28" fill="rgba(0,0,0,0)" stroke="#fff" />
    </svg>
  </IconWithTail>);

SelectedIconWithTail.displayName = 'SelectedIconWithTail';

SelectedIconWithTail.description = () =>
  <div>
    <p>Shows an selected (vehicle) icon that cconsists of IconWithTail and a green ckecked
    mark and a greyish circle on top of it.</p>
    <ComponentUsageExample description="">
      <SelectedIconWithTail className="bus selected-tail-icon" img="icon-icon_bus-live" />
    </ComponentUsageExample>
  </div>;

SelectedIconWithTail.propTypes = {
  img: React.PropTypes.string.isRequired,
  fullscreenMap: React.PropTypes.bool,
};

export default SelectedIconWithTail;

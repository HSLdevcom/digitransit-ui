import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const ExternalLinkDecoration = ({ className }) => (
  <svg viewBox="0 0 40 40" className={cx('icon', 'external-link-decoration', className)}>
    <use
      className="external-link-icon-outer"
      xlinkHref="#icon-icon_external_link_arrow"
    />
    <use
      className="external-link-icon"
      xlinkHref="#icon-icon_external_link_arrow"
      transform="scale(0.9,0.9)"
      y="0"
      x="4"
    />
  </svg>
);

ExternalLinkDecoration.description = () =>
  <ComponentUsageExample description="Bus with caution">
    <div className="external-top-bar" style={{ textAlign: 'center', width: 50, height: 20, backgroundColor: '#ccc' }}>
      <ExternalLinkDecoration />
    </div>
  </ComponentUsageExample>;

ExternalLinkDecoration.displayName = 'IconWithCaution';

ExternalLinkDecoration.propTypes = {
  className: React.PropTypes.string,
};

export default ExternalLinkDecoration;

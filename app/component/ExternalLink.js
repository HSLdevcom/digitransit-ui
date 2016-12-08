import React, { PropTypes } from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

const ExternalLink = ({ name, href, className }) => ((name !== undefined) &&
  <span className={`external-link-container ${className}`}>
    <a onClick={e => e.stopPropagation()}className="external-link" href={href} >{name}</a>
    <Icon img="icon-icon_external_link_arrow" className="external-link-icon-outer" />
    <Icon img="icon-icon_external_link_arrow" className="external-link-icon" />
  </span>
);

ExternalLink.propTypes = {
  name: PropTypes.string,
  href: PropTypes.string,
  className: PropTypes.string,
};

ExternalLink.defaultProps = {
  className: '',
};

ExternalLink.description = () => (
  <div>
    <p>
      Link to external url
    </p>
    <ComponentUsageExample description="">
      <span style={{ background: '#007ac9', padding: '10px 10px 10px 10px' }}>
        <ExternalLink name="HSL.fi" href="http://www.hsl.fi" />
      </span>
    </ComponentUsageExample>
  </div>);

export default ExternalLink;

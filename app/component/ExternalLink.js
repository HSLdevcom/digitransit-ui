import PropTypes from 'prop-types';
import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

const ExternalLink = ({ name, children, href, className, onClick }) =>
  (name || children !== undefined) && (
    <span className={className}>
      <span className="external-link-container">
        <a
          onClick={e => {
            e.stopPropagation();
            if (onClick) {
              onClick(e);
            }
          }}
          className="external-link"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {name || children}
        </a>
      </span>
    </span>
  );

ExternalLink.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node,
  href: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ExternalLink.defaultProps = {
  className: '',
};

ExternalLink.displayName = 'ExternalLink';

ExternalLink.description = () => (
  <div>
    <p>Link to external url</p>
    <ComponentUsageExample description="with text only">
      <span style={{ background: '#007ac9', padding: '10px 10px 10px 10px' }}>
        <ExternalLink
          className="external-top-bar"
          name="HSL.fi"
          href="http://www.hsl.fi"
        />
      </span>
    </ComponentUsageExample>
    <ComponentUsageExample description="with more complex content">
      <span style={{ background: '#ccc', padding: '10px 10px 10px 10px' }}>
        <ExternalLink className="action-bar" href="http://print.me.invalid">
          <Icon img="icon-icon_print" /> Print
        </ExternalLink>
      </span>
    </ComponentUsageExample>
  </div>
);

export default ExternalLink;

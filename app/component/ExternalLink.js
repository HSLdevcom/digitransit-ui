import PropTypes from 'prop-types';
import React from 'react';

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

export default ExternalLink;

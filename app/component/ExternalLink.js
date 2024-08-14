import PropTypes from 'prop-types';
import React from 'react';

export default function ExternalLink({
  name,
  children,
  href,
  className,
  onClick,
}) {
  return (
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
            rel="noopener noreferrer"
          >
            {name || children}
          </a>
        </span>
      </span>
    )
  );
}

ExternalLink.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node,
  href: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ExternalLink.defaultProps = {
  name: undefined,
  children: undefined,
  href: undefined,
  onClick: undefined,
  className: '',
};

ExternalLink.displayName = 'ExternalLink';

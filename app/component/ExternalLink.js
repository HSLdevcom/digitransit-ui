import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

export default function ExternalLink({
  name,
  children,
  href,
  className,
  onClick,
  withArrow,
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
          {withArrow && (
            <Icon className="arrow" img="icon_arrow-collapse--right" />
          )}
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
  withArrow: PropTypes.bool,
};

ExternalLink.defaultProps = {
  name: undefined,
  children: undefined,
  href: undefined,
  onClick: undefined,
  className: '',
  withArrow: false,
};

ExternalLink.displayName = 'ExternalLink';

import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { routerShape } from 'found';

const mapToLink = (href, children, onClick, openInNewTab) => (
  <span className="cursor-pointer">
    <a
      href={href}
      onClick={onClick}
      target={openInNewTab ? '_blank' : '_self'}
      rel="noreferrer"
    >
      {children}
    </a>
  </span>
);

const mapToRoute = (router, route, children, onClick) => (
  <button
    className="noborder button cursor-pointer"
    onClick={e => {
      router.push(route);
      if (onClick) {
        onClick(e);
      }
    }}
  >
    {children}
  </button>
);

export default function MenuItem(
  { name, href, label, route, onClick, openInNewTab },
  { router, intl },
) {
  const displayLabel = label || (
    <FormattedMessage id={name} defaultMessage={name} />
  );
  let item = <span id={name}>{displayLabel}</span>;
  if (href) {
    if (typeof href === 'object') {
      item = mapToLink(href[intl.locale], item, onClick, openInNewTab);
    } else {
      item = mapToLink(href, item, onClick, openInNewTab);
    }
  } else if (route) {
    item = mapToRoute(router, route, item, onClick);
  } else {
    item = <span className="menu-text">{item}</span>;
  }
  return <span className="menu-item">{item}</span>;
}

MenuItem.propTypes = {
  name: PropTypes.string,
  href: PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.string),
    PropTypes.string,
  ]),
  route: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  openInNewTab: PropTypes.bool,
};

MenuItem.defaultProps = {
  name: undefined,
  href: undefined,
  route: undefined,
  label: undefined,
  onClick: undefined,
  openInNewTab: false,
};

MenuItem.contextTypes = {
  router: routerShape.isRequired,
  intl: intlShape.isRequired,
};

MenuItem.displayName = 'MenuItem';

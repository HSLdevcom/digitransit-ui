import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'found';
import Icon from './Icon';

const mapToLink = (href, children, onClick) => (
  <span className="cursor-pointer">
    <a href={href} onClick={onClick}>
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

const MenuItem = (
  { name, href, label, nameEn, route, icon, onClick },
  { router },
) => {
  const displayIcon =
    (icon && <Icon className="menu-icon" img={icon} />) || undefined;
  const displayLabel = label || (
    <FormattedMessage id={name} defaultMessage={nameEn || name} />
  );
  let item = (
    <span id={name}>
      {displayIcon}
      {displayLabel}
    </span>
  );
  if (href) {
    item = mapToLink(href, item, onClick);
  } else if (route) {
    item = mapToRoute(router, route, item, onClick);
  } else {
    item = <span className="menu-text">{item}</span>;
  }
  return <span className="menu-item">{item}</span>;
};

MenuItem.propTypes = {
  name: PropTypes.string,
  nameEn: PropTypes.string,
  icon: PropTypes.string,
  href: PropTypes.string,
  route: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

MenuItem.contextTypes = {
  router: routerShape.isRequired,
};

MenuItem.displayName = 'MenuItem';

export default MenuItem;

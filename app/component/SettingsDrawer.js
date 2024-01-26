import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

export const SettingsDrawer = ({ children, open, className }) => {
  if (open) {
    return <div className={className}>{children}</div>;
  }
  return null;
};

SettingsDrawer.propTypes = {
  open: PropTypes.bool,
  className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

SettingsDrawer.defaultProps = { open: false };

SettingsDrawer.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default SettingsDrawer;

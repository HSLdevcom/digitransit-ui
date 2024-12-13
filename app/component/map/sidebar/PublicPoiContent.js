import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import SidebarContainer from './SidebarContainer';

const PublicPoiContent = ({ match }, { intl }) => {
  const { type, name } = match.location.query;

  return (
    <SidebarContainer
      name={intl.formatMessage({
        id: type,
        defaultMessage: type,
      })}
      description={name}
      icon={`icon-${type}`}
    />
  );
};

PublicPoiContent.displayName = 'PublicPoiContent';

PublicPoiContent.propTypes = {
  match: PropTypes.object.isRequired,
};

PublicPoiContent.contextTypes = {
  intl: intlShape.isRequired,
};

export default PublicPoiContent;

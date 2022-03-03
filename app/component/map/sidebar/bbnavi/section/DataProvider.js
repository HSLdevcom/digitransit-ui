import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

const DataProvider = ({ dataProvider }) => {
  if (!dataProvider) {
    return null;
  }

  return (
    <div>
      <div className="divider" />
      {!!dataProvider.description && (
        <div className="text-light sidebar-info-container">
          <FormattedMessage id="datasource" defaultMessage="data source" />{' '}
          {`: ${dataProvider.description}`}
        </div>
      )}
      <div
        className="data-provider-notice"
        dangerouslySetInnerHTML={{ __html: dataProvider.notice }}
      />
    </div>
  );
};

DataProvider.propTypes = {
  dataProvider: PropTypes.object.isRequired,
};

export default DataProvider;

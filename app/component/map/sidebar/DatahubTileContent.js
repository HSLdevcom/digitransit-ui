import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import moment from 'moment';
import SidebarContainer from './SidebarContainer';

const DatahubTileContent = ({ match }, { intl }) => {
  const { lat, lng, updatedAt, address } = match.location.query;

  return (
    <SidebarContainer
      name={intl.formatMessage({
        id: 'datahub-tile',
        defaultMessage: 'Datahub tile',
      })}
      description={address}
      icon="icon-icon_mapMarker-point"
    >
      <table className="component-list">
        <tbody>
          <tr>
            <td>
              <FormattedMessage
                id="additional-info"
                defaultMessage="Additional information will appear here..."
              />
              <br />
              Coords: {lat}, {lng}
            </td>
          </tr>
          {updatedAt && (
            <tr>
              <td colSpan={2} className="last-updated">
                <FormattedMessage
                  id="last-updated"
                  defaultMessage="Last updated"
                  values={{ time: moment(updatedAt).format('LT') || '' }}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </SidebarContainer>
  );
};

DatahubTileContent.displayName = 'DatahubTileContent';

DatahubTileContent.propTypes = {
  match: PropTypes.object.isRequired,
};

DatahubTileContent.contextTypes = {
  intl: intlShape.isRequired,
};

export default DatahubTileContent;

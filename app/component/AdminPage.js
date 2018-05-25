import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { getRoutingSettings } from '../store/localStorage';
import SaveRoutingSettingsButton from './SaveRoutingSettingsButton';

export const defaultRoutingSettings = {
  ignoreRealtimeUpdates: false,
};

const AdminPage = (context) => {
  const merged = {
    ...defaultRoutingSettings,
    ...getRoutingSettings(),
    ...context.location.query,
  };

  const replaceParams = newParams =>
  context.router.replace({
    ...context.location,
    query: {
      ...context.location.query,
      ...newParams,
    },
  });

  const toggleRealtimeUpdates = ({ target }) => {
    const ignoreRealtimeUpdates = target.value;
    context.router.replace({
      pathname: context.location.pathname,
      query: {
        ...context.location.query,
        ignoreRealtimeUpdates,
      },
    });
  };

  return (
    <div className="page-frame fullscreen momentum-scroll">
      <label>
          Ignore realtime updates (default false):
        <select
          value={merged.ignoreRealtimeUpdates}
          onChange={toggleRealtimeUpdates}
        >
          <option value="false">
            False
          </option>
          <option value="true">
            True
          </option>
        </select>
      </label>
      <SaveRoutingSettingsButton />
    </div>
  );
};

AdminPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

AdminPage.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default connectToStores(AdminPage, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));

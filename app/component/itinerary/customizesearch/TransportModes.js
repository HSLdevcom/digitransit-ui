import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import Icon from '../../Icon';
import {
  getTransitModes,
  getModes,
  toggleTransportMode,
} from '../../../util/modeUtils';
import { getModeIconColor } from '../../../util/colorUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function TransportModes({ updateSettings }) {
  const config = useConfigContext();
  const alternativeNames = config.useAlternativeNameForModes || [];
  const transitModes = getTransitModes(config);
  const selectedModes = getModes(config);

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="pick-mode" />
      </div>
      {transitModes.map(mode => {
        const lowerCaseMode = mode.toLowerCase();
        return (
          <SettingsToggle
            labelId={
              alternativeNames.includes(mode)
                ? `settings-alternative-name-${lowerCaseMode}`
                : lowerCaseMode
            }
            labelStyle="mode-label"
            key={`settings-toggle-${mode}`}
            id={`settings-toggle-${mode}`}
            leftElement={
              <Icon
                img={`icon_${lowerCaseMode}`}
                color={getModeIconColor(config, mode)}
                height={2}
                width={2}
              />
            }
            toggled={selectedModes.includes(mode)}
            onToggle={() =>
              updateSettings({ modes: toggleTransportMode(mode, config) })
            }
            borderStyle="bottom-border"
          />
        );
      })}
    </>
  );
}

TransportModes.propTypes = {
  updateSettings: PropTypes.func.isRequired,
};

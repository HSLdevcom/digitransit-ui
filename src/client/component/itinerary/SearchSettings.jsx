import PropTypes from 'prop-types';
import { useRouter } from 'found';
import SettingsButton from './SettingsButton';
import DatetimepickerContainer from '../DatetimepickerContainer';
import { useConfigContext } from '../../hooks/ConfigContext';
import { isEmpty } from '../../../shared/path';

export default function SearchSettings({ toggleSettings }) {
  const config = useConfigContext();
  const { params } = useRouter().match;
  // a time change starts a search only when both endpoints are set
  const searchable = !isEmpty(params.from) && !isEmpty(params.to);

  return (
    <div className="searchsettings-container">
      <DatetimepickerContainer
        realtime={false}
        showUpdateInstructions={searchable}
        embedWhenClosed={
          !config.hideItinerarySettings && (
            <div className="open-advanced-settings">
              <SettingsButton onToggleClick={toggleSettings} />
            </div>
          )
        }
        embedWhenOpen={
          <div className="open-embed-container">
            <div className="open-advanced-settings open-embed">
              {!config.hideItinerarySettings && <SettingsButton onToggleClick={toggleSettings} />}
            </div>
          </div>
        }
      />
    </div>
  );
}

SearchSettings.propTypes = { toggleSettings: PropTypes.func.isRequired };

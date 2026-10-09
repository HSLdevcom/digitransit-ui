import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultColors } from '@digitransit-component/digitransit-component-icon';
import AllModesModal from './AllModesModal';
import ModeButton from './ModeButton';
import styles from './styles.scss';
import useModesWithAlerts from './useModesWithAlerts';
import { VALID_NEAR_YOU_MODES, getModeUrl } from './utils';

const DEFAULT_FONT_WEIGHTS = { medium: 500 };
const MAX_VISIBLE_MODES = 7;
const MORE = 'more';

export default function NearStopsAndRoutes({
  horizontal = true,
  modeArray,
  language = 'fi',
  title,
  alertsContext,
  origin,
  onClick,
  modeSet = 'hsl',
  colors = defaultColors,
  fontWeights = DEFAULT_FONT_WEIGHTS,
  isMobile = false,
  urlPrefix,
  omitLanguageUrl = false,
  loading = true,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation();
  const modesWithAlerts = useModesWithAlerts(alertsContext);

  const modes = modeArray.filter(mode => VALID_NEAR_YOU_MODES.includes(mode));
  const useModal = horizontal && modes.length > MAX_VISIBLE_MODES;
  const visibleModes = useModal
    ? [...modes.slice(0, MAX_VISIBLE_MODES - 1), MORE]
    : modes;

  const renderButton = (mode, inModal) => (
    <ModeButton
      key={mode}
      mode={mode}
      language={language}
      modeSet={modeSet}
      colors={colors}
      fontWeights={fontWeights}
      withAlert={modesWithAlerts.includes(mode.toUpperCase())}
      loading={loading}
      horizontal={horizontal}
      inModal={inModal}
      onActivate={
        mode === MORE
          ? () => setModalOpen(true)
          : e =>
              onClick(
                getModeUrl({
                  urlPrefix,
                  language,
                  omitLanguageUrl,
                  origin,
                  mode,
                }),
                e,
              )
      }
    />
  );

  return (
    <div
      className={styles['near-you-container']}
      style={{ '--font-weight': fontWeights.medium }}
    >
      {useModal && (
        <AllModesModal
          language={language}
          isMobile={isMobile}
          modalOpen={modalOpen}
          fontWeights={fontWeights}
          closeModal={() => setModalOpen(false)}
        >
          {modes.map((mode, i) => (
            <div key={mode}>
              {renderButton(mode, true)}
              {i < modes.length - 1 && <div className={styles.separator} />}
            </div>
          ))}
        </AllModesModal>
      )}
      <h2 className={styles['near-you-title']}>
        {title?.[language] || t('title', { lng: language })}
      </h2>
      <div
        className={
          horizontal
            ? styles['near-you-buttons-container']
            : styles['near-you-buttons-container-wide']
        }
      >
        {visibleModes.map(mode => renderButton(mode, false))}
      </div>
    </div>
  );
}

NearStopsAndRoutes.propTypes = {
  loading: PropTypes.bool,
  modeArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.objectOf(PropTypes.string),
  language: PropTypes.string,
  horizontal: PropTypes.bool,
  alertsContext: PropTypes.shape({
    getModesWithAlerts: PropTypes.func,
    currentTime: PropTypes.number,
    feedIds: PropTypes.arrayOf(PropTypes.string),
  }),
  origin: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  onClick: PropTypes.func.isRequired,
  colors: PropTypes.objectOf(PropTypes.string),
  modeSet: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  isMobile: PropTypes.bool,
  urlPrefix: PropTypes.string.isRequired,
  omitLanguageUrl: PropTypes.bool,
};

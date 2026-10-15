import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Shimmer from '@hsl-fi/shimmer';
import NearYouButton from './NearYouButton';
import { isKeyboardSelectionEvent } from './utils';

const MODAL_FONT_WEIGHT = 325;

/** Keyboard and pointer accessible link-like button for one transport mode */
export default function ModeButton({
  mode,
  language,
  modeSet,
  colors,
  fontWeights,
  withAlert,
  loading,
  horizontal,
  inModal,
  onActivate,
}) {
  const [t] = useTranslation();

  const buttonProps = {
    mode,
    modeSet,
    colors,
    withAlert,
    boxed: inModal || horizontal, // squared icon or interior only
  };

  if (inModal) {
    const titleKey =
      modeSet === 'hsl' && mode === 'rail' ? 'rail_local' : `${mode}_short`;
    buttonProps.title = t(titleKey, { lng: language });
    buttonProps.titleWeight = MODAL_FONT_WEIGHT;
    buttonProps.withArrow = true;
    buttonProps.margin = '0';
    buttonProps.iconSize = '35px';
    buttonProps.padding = '6px';
  } else {
    buttonProps.withBorder = true;
    if (!horizontal) {
      buttonProps.title = t(mode, { lng: language });
      buttonProps.titleWeight = fontWeights.medium;
    }
  }

  return (
    <div
      aria-label={t(mode, { lng: language })}
      role="link"
      tabIndex="0"
      onClick={() => onActivate()}
      onKeyDown={e => {
        if (isKeyboardSelectionEvent(e)) {
          onActivate(e);
        }
      }}
    >
      <Shimmer active={loading}>
        <NearYouButton {...buttonProps} />
      </Shimmer>
    </div>
  );
}

ModeButton.propTypes = {
  mode: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  modeSet: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  fontWeights: PropTypes.shape({ medium: PropTypes.number }).isRequired,
  withAlert: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  horizontal: PropTypes.bool.isRequired,
  inModal: PropTypes.bool.isRequired,
  onActivate: PropTypes.func.isRequired,
};

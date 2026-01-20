import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './styles.scss';

export default function NearYouButton({
  mode,
  modeSet,
  colors,
  getIconName,
  title,
  srMsg,
  withAlert,
  boxed,
  withBorder,
  withArrow,
  margin,
  padding,
  iconSize,
}) {
  let iconProps;

  if (mode === 'favorite') {
    iconProps = { img: 'star' };
  } else if (mode === 'more') {
    iconProps = {
      img: 'arrow',
      color: colors.primary,
      width: 1.2,
      height: 1.2,
    };
  } else {
    iconProps = {
      img: getIconName(mode, modeSet, boxed),
      color: colors[mode],
    };
  }

  if (!boxed) {
    iconProps = {
      ...iconProps,
      width: 1.4,
      height: 1.4,
    };
  }
  const buttonStyle = { '--margin': margin, '--padding': padding };
  let iconContainerStyle = { '--iconSize': iconSize, '--iconMargin': padding };
  if (!boxed) {
    iconContainerStyle = {
      ...iconContainerStyle,
      '--bckColor': colors[mode],
      '--borderRadius': '50%',
      '--iconMargin': '17px',
    };
  }

  const buttonClass = withBorder
    ? 'near-you-button-with-border'
    : 'near-you-button';
  return (
    <>
      {srMsg && <span className={styles['sr-only']}>{srMsg}</span>}
      <span className={styles[buttonClass]} style={buttonStyle}>
        <span className={styles['icon-container']} style={iconContainerStyle}>
          <Icon {...iconProps} />
          {withAlert && (
            <span className={styles['transport-mode-alert-icon']}>
              <Icon img="caution" color={colors.caution} />
            </span>
          )}
        </span>
        {title}
        {withArrow && (
          <div className={styles['near-you-button-caret']}>
            <Icon img="arrow" color={colors.primary} width={0.9} height={0.9} />
          </div>
        )}
      </span>
    </>
  );
}

NearYouButton.propTypes = {
  mode: PropTypes.string.isRequired,
  modeSet: PropTypes.string.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  getIconName: PropTypes.func.isRequired,
  title: PropTypes.node,
  srMsg: PropTypes.string,
  withAlert: PropTypes.bool,
  boxed: PropTypes.bool,
  withBorder: PropTypes.bool,
  withArrow: PropTypes.bool,
  margin: PropTypes.string,
  padding: PropTypes.string,
  iconSize: PropTypes.string,
};

NearYouButton.defaultProps = {
  title: '',
  srMsg: undefined,
  withAlert: false,
  boxed: false,
  withBorder: false,
  withArrow: false,
  margin: '8px',
  padding: '8px',
  iconSize: '30px',
};

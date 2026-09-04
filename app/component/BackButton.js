import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { routerShape, matchShape } from 'found';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';
import { IS_DEV_BUILD } from '../util/envUtils';

export default function BackButton(props, context) {
  const config = useConfigContext();
  const intl = useIntl();

  const goBack = url => {
    const { router, match } = context;
    const { location } = match;

    if (
      location.index > 0 ||
      // eslint-disable-next-line no-restricted-globals
      (history.length > 1 && props.fallback === 'back')
    ) {
      router.go(-1);
    } else if (
      props.fallback === 'pop' &&
      location.pathname.split('/').length > 1
    ) {
      const parts = location.pathname.split('/');
      parts.pop();
      const newLoc = {
        ...location,
        pathname: parts.join('/'),
      };
      router.replace(newLoc);
    } else if (url) {
      window.location.href = url;
    } else {
      router.push('/');
    }
  };

  let url;
  // apply rootlink only in production, it is annoying locally
  if (!IS_DEV_BUILD) {
    if (config.passLanguageToRootLink && intl.locale !== 'fi') {
      url = `${config.URL.ROOTLINK}/${intl.locale}`;
    } else {
      url = config.URL.ROOTLINK;
    }
  }
  return (
    <div className="back-button">
      {props.title && <h1>{props.title}</h1>}
      <button
        type="button"
        className="icon-holder noborder cursor-pointer"
        onClick={() => goBack(url)}
        aria-label={intl.formatMessage({ id: 'back-button-title' })}
        tabIndex={0}
      >
        <Icon
          img="icon_arrow-collapse--left"
          color={config.colors.primary}
          className="arrow-icon"
        />
      </button>
    </div>
  );
}

BackButton.contextTypes = { router: routerShape, match: matchShape };
BackButton.propTypes = { title: PropTypes.node, fallback: PropTypes.string };
BackButton.defaultProps = { title: undefined, fallback: undefined };

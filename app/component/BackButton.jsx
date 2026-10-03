import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import Icon from './Icon';
import { useConfigContext } from '../client/ConfigContext';

export default function BackButton({ title, fallback }) {
  const config = useConfigContext();
  const intl = useIntl();
  const { router, match } = useRouter();

  const goBack = url => {
    const { location } = match;

    if (
      location.index > 0 ||
      // eslint-disable-next-line no-restricted-globals
      (history.length > 1 && fallback === 'back')
    ) {
      router.go(-1);
    } else if (fallback === 'pop' && location.pathname.split('/').length > 1) {
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
  if (process.env.NODE_ENV !== 'development') {
    if (config.passLanguageToRootLink && intl.locale !== 'fi') {
      url = `${config.URL.ROOTLINK}/${intl.locale}`;
    } else {
      url = config.URL.ROOTLINK;
    }
  }
  return (
    <div className="back-button">
      {title && <h1>{title}</h1>}
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

BackButton.propTypes = { title: PropTypes.node, fallback: PropTypes.string };

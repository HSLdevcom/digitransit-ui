import PropTypes from 'prop-types';
import React from 'react';
import i18next from 'i18next';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape } from 'found';
import BackButton from './BackButton';

const initLanguage = language => {
  i18next.init({ lang: language, resources: {} });
  i18next.changeLanguage(language);
  if (language === 'fi') {
    i18next.addResourceBundle('fi', 'translation', {
      destination: 'Valitse määränpää',
      origin: 'Valitse lähtöpaikka',
    });
  }
  if (language === 'sv') {
    i18next.addResourceBundle('sv', 'translation', {
      destination: 'Välj destination',
      origin: 'Välj avfärdsplats',
    });
  }
  if (language === 'en') {
    i18next.addResourceBundle('en', 'translation', {
      destination: 'Select destination',
      origin: 'Select origin',
    });
  }
};

const getUrlToBack = location => {
  const { pathname, search } = location;
  const pathArray = pathname.substring(1).split('/');
  if (pathArray[0] === 'SelectFromMap' && pathArray[1] === '-') {
    return `/${search}`;
  } else if (pathArray[0] === '-' && pathArray[1] === 'SelectFromMap') {
    return `/${search}`;
  } else if (pathArray[0] === 'SelectFromMap' && pathArray[1] !== '-') {
    return `/-/${pathArray[1]}${search}`;
  } else if (pathArray[0] !== '-' && pathArray[1] === 'SelectFromMap') {
    return `/${pathArray[0]}/-${search}`;
  }
  return undefined;
};

const SelectFromMapHeaderComponent = (props, { config, match }) => {
  initLanguage(props.language);
  return (
    <React.Fragment>
      <div
        style={{
          minHeight: '3em',
          boxShadow: '0 2 10 0 rgba(0, 0, 0, 0.2)',
          backgroundColor: '#ffffff',
        }}
      >
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          color={config.colors.primary}
          iconClassName="arrow-icon"
          customStyle={{
            marginTop: '1em',
            left: '1.5em',
          }}
          title={
            props.isDestination ? i18next.t('destination') : i18next.t('origin')
          }
          titleCustomStyle={{
            fontSize: 18,
            fontWeight: 500,
            fontStretch: 'normal',
            fontStyle: 'normal',
            lineHeight: 'normal',
            letterSpacing: -0.6,
            textAlign: 'center',
            verticalAlign: 'text-top',
            color: '#333333',
            position: 'relative',
            top: '0.75em',
            left: '5em',
            whiteSpace: 'nowrap',
          }}
          urlToBack={getUrlToBack(match.location)}
        />
      </div>
    </React.Fragment>
  );
};

SelectFromMapHeaderComponent.propTypes = {
  language: PropTypes.string.isRequired,
  isDestination: PropTypes.bool.isRequired,
};

SelectFromMapHeaderComponent.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape,
};

const connectedComponent = connectToStores(
  SelectFromMapHeaderComponent,
  ['PreferencesStore'],
  context => ({
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export {
  connectedComponent as default,
  SelectFromMapHeaderComponent as Component,
};

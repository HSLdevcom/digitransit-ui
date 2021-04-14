import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import { save } from 'react-cookie';
import ComponentUsageExample from './ComponentUsageExample';
import { isBrowser } from '../util/browser';

const language = (lang, highlight, match) => (
  <a
    id={`lang-${lang}`}
    key={lang}
    href={`/${lang}${match.location.pathname}${match.location.search}`}
    className={`${(highlight && 'selected') || ''} noborder lang`}
  >
    {lang}
  </a>
);

const LangSelect = ({ currentLanguage }, { config, match }) => {
  if (isBrowser) {
    return (
      <div key="lang-select" id="lang-select">
        {config.availableLanguages.map(lang =>
          language(lang, lang === currentLanguage, match),
        )}
      </div>
    );
  }
  return null;
};

LangSelect.displayName = 'LangSelect';

LangSelect.description = () => (
  <div>
    <p>Language selection component, language selection comes from config.</p>
    <ComponentUsageExample description="">
      <div style={{ width: '200px', background: 'rgb(51, 51, 51)' }}>
        <LangSelect currentLanguage="en" />
      </div>
    </ComponentUsageExample>
  </div>
);

LangSelect.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

LangSelect.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connected = connectToStores(
  LangSelect,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connected as default, LangSelect as Component };

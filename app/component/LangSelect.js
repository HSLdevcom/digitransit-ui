import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { isBrowser } from '../util/browser';

const language = (lang, highlight, match, intl) => {
  const aria = highlight
    ? intl.formatMessage(
        { id: 'search-current-suggestion' },
        { selection: lang },
      )
    : intl.formatMessage({ id: 'language-selection' }, { language: lang });
  return (
    <a
      id={`lang-${lang}`}
      aria-label={aria}
      key={lang}
      href={`/${lang}${match.location.pathname}${match.location.search}`}
      className={`${(highlight && 'selected') || ''} noborder lang`}
    >
      {lang}
    </a>
  );
};

const LangSelect = ({ currentLanguage }, { config, match, intl }) => {
  if (isBrowser) {
    return (
      <div key="lang-select" id="lang-select">
        {config.availableLanguages.map(lang =>
          language(lang, lang === currentLanguage, match, intl),
        )}
      </div>
    );
  }
  return null;
};

LangSelect.displayName = 'LangSelect';

LangSelect.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

LangSelect.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

const connected = connectToStores(
  LangSelect,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connected as default, LangSelect as Component };
